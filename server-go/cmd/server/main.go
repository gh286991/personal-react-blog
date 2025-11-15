package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"personal-react-blog/server-go/internal/app"
	"personal-react-blog/server-go/internal/content"
	"personal-react-blog/server-go/internal/ssr"
)

func main() {
	addr := flag.String("addr", ":4173", "listen address")
	root := flag.String("root", ".", "project root directory")
	dist := flag.String("dist", "dist", "build output directory (relative to root)")
	contentBase := flag.String("content-base", "", "content base directory (defaults to dist)")
	nodeBin := flag.String("node", "node", "node executable to use for SSR rendering")
	flag.Parse()

	rootDir, err := filepath.Abs(*root)
	if err != nil {
		log.Fatalf("resolve root: %v", err)
	}

	distDir := resolvePath(rootDir, *dist)
	clientDir := filepath.Join(distDir, "client")
	entryFile := filepath.Join(distDir, "server", "entry-server.mjs")
	templatePath := filepath.Join(clientDir, "index.html")

	templateBytes, err := os.ReadFile(templatePath)
	if err != nil {
		log.Fatalf("read template: %v", err)
	}

	baseDir := *contentBase
	if baseDir == "" {
		baseDir = distDir
	}
	baseDir = resolvePath(rootDir, baseDir)

	store := content.NewStore(content.Config{BaseDir: baseDir})

	env := map[string]string{
		"NODE_ENV":        "production",
		"CONTENT_BASE":    baseDir,
		"LOW_MEMORY_MODE": "true",
	}
	if nodePath := buildNodePath(rootDir); nodePath != "" {
		env["NODE_PATH"] = nodePath
	}

	worker, err := ssr.NewWorker(ssr.Config{
		NodeBinary: *nodeBin,
		ScriptPath: filepath.Join(rootDir, "server-go", "ssr", "render-worker.mjs"),
		EntryFile:  entryFile,
		WorkDir:    rootDir,
		Env:        env,
	})
	if err != nil {
		log.Fatalf("start SSR worker: %v", err)
	}
	defer worker.Close()

	application, err := app.NewServer(app.Config{
		Template:  string(templateBytes),
		Content:   store,
		SSR:       worker,
		ClientDir: clientDir,
	})
	if err != nil {
		log.Fatalf("init server: %v", err)
	}

	srv := &http.Server{
		Addr:    *addr,
		Handler: application,
	}

	go func() {
		log.Printf("Go SSR server listening on %s", *addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}

func resolvePath(root, p string) string {
	if filepath.IsAbs(p) {
		return p
	}
	return filepath.Join(root, p)
}

func buildNodePath(root string) string {
	candidates := []string{
		filepath.Join(root, "node_modules"),
		filepath.Join(root, "server", "node_modules"),
	}
	parts := make([]string, 0, len(candidates))
	for _, dir := range candidates {
		if info, err := os.Stat(dir); err == nil && info.IsDir() {
			parts = append(parts, dir)
		}
	}
	return strings.Join(parts, string(os.PathListSeparator))
}
