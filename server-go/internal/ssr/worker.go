package ssr

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	"personal-react-blog/server-go/internal/types"
)

type Config struct {
	NodeBinary string
	ScriptPath string
	EntryFile  string
	WorkDir    string
	Env        map[string]string
}

type Worker struct {
	cmd       *exec.Cmd
	stdin     io.WriteCloser
	responses map[string]chan renderResult
	mu        sync.Mutex
	counter   atomic.Uint64
	closed    chan struct{}
	closeOnce sync.Once
}

type renderResult struct {
	html string
	err  error
}

type workerMessage struct {
	Type  string          `json:"type"`
	ID    string          `json:"id"`
	HTML  string          `json:"html"`
	Error *workerError    `json:"error"`
	Props json.RawMessage `json:"props"`
}

type workerError struct {
	Message string `json:"message"`
	Stack   string `json:"stack"`
}

type renderRequest struct {
	Type  string         `json:"type"`
	ID    string         `json:"id"`
	Props types.AppProps `json:"props"`
}

func NewWorker(cfg Config) (*Worker, error) {
	if cfg.NodeBinary == "" {
		cfg.NodeBinary = "node"
	}
	if cfg.ScriptPath == "" {
		return nil, errors.New("missing worker script path")
	}
	if cfg.EntryFile == "" {
		return nil, errors.New("missing entry file path")
	}

	absScript, err := filepath.Abs(cfg.ScriptPath)
	if err != nil {
		return nil, err
	}
	absEntry, err := filepath.Abs(cfg.EntryFile)
	if err != nil {
		return nil, err
	}

	cmd := exec.Command(cfg.NodeBinary, absScript, absEntry)
	if cfg.WorkDir != "" {
		cmd.Dir = cfg.WorkDir
	}

	cmd.Env = append(os.Environ(), formatEnv(cfg.Env)...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}

	worker := &Worker{
		cmd:       cmd,
		stdin:     stdin,
		responses: make(map[string]chan renderResult),
		closed:    make(chan struct{}),
	}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	ready := make(chan struct{})

	go worker.readLoop(stdout, ready)
	go io.Copy(os.Stderr, stderr)
	go worker.waitForExit()

	select {
	case <-ready:
		return worker, nil
	case <-time.After(5 * time.Second):
		worker.Close()
		return nil, errors.New("timed out waiting for SSR worker to start")
	}
}

func (w *Worker) Render(ctx context.Context, props types.AppProps) (string, error) {
	id := fmt.Sprintf("req-%d", w.counter.Add(1))
	ch := make(chan renderResult, 1)

	w.mu.Lock()
	w.responses[id] = ch
	w.mu.Unlock()

	req := renderRequest{Type: "render", ID: id, Props: props}
	payload, err := json.Marshal(req)
	if err != nil {
		return "", err
	}

	if _, err := w.stdin.Write(append(payload, '\n')); err != nil {
		w.removeResponse(id)
		return "", err
	}

	select {
	case res := <-ch:
		return res.html, res.err
	case <-ctx.Done():
		w.removeResponse(id)
		return "", ctx.Err()
	case <-w.closed:
		w.removeResponse(id)
		return "", errors.New("ssr worker stopped")
	}
}

func (w *Worker) readLoop(stdout io.Reader, ready chan<- struct{}) {
	scanner := bufio.NewScanner(stdout)
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 10*1024*1024)
	signaledReady := false

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var msg workerMessage
		if err := json.Unmarshal(line, &msg); err != nil {
			continue
		}
		if !signaledReady {
			if msg.Type == "ready" {
				signaledReady = true
				close(ready)
				continue
			}
		}
		if msg.ID == "" {
			continue
		}
		var res renderResult
		if msg.Error != nil {
			res.err = errors.New(msg.Error.Message)
		} else {
			res.html = msg.HTML
		}
		w.mu.Lock()
		ch, ok := w.responses[msg.ID]
		if ok {
			delete(w.responses, msg.ID)
		}
		w.mu.Unlock()
		if ok {
			ch <- res
		}
	}

	if !signaledReady {
		close(ready)
	}

	w.mu.Lock()
	for id, ch := range w.responses {
		delete(w.responses, id)
		ch <- renderResult{err: errors.New("ssr worker stopped")}
	}
	w.mu.Unlock()
	w.signalClosed()
}

func (w *Worker) waitForExit() {
	w.cmd.Wait()
	w.signalClosed()
}

func (w *Worker) removeResponse(id string) {
	w.mu.Lock()
	if ch, ok := w.responses[id]; ok {
		delete(w.responses, id)
		close(ch)
	}
	w.mu.Unlock()
}

func (w *Worker) Close() {
	w.stdin.Close()
	if w.cmd.Process != nil {
		_ = w.cmd.Process.Kill()
	}
	<-w.closed
}

func formatEnv(values map[string]string) []string {
	if len(values) == 0 {
		return nil
	}
	result := make([]string, 0, len(values))
	for key, value := range values {
		result = append(result, fmt.Sprintf("%s=%s", key, value))
	}
	return result
}

func (w *Worker) signalClosed() {
	w.closeOnce.Do(func() {
		close(w.closed)
	})
}
