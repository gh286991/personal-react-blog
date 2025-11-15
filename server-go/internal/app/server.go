package app

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"personal-react-blog/server-go/internal/content"
	"personal-react-blog/server-go/internal/feed"
	"personal-react-blog/server-go/internal/routes"
	"personal-react-blog/server-go/internal/ssr"
	"personal-react-blog/server-go/internal/templates"
	"personal-react-blog/server-go/internal/types"
	"personal-react-blog/server-go/internal/util"
)

type Config struct {
	Template  string
	Content   *content.Store
	SSR       *ssr.Worker
	ClientDir string
}

type Server struct {
	template  string
	content   *content.Store
	ssr       *ssr.Worker
	clientDir string
}

func NewServer(cfg Config) (*Server, error) {
	if cfg.Template == "" {
		return nil, errors.New("missing HTML template")
	}
	if cfg.Content == nil {
		return nil, errors.New("missing content store")
	}
	if cfg.SSR == nil {
		return nil, errors.New("missing SSR worker")
	}
	if cfg.ClientDir == "" {
		return nil, errors.New("missing client directory")
	}
	absClient, err := filepath.Abs(cfg.ClientDir)
	if err != nil {
		return nil, err
	}
	return &Server{
		template:  cfg.Template,
		content:   cfg.Content,
		ssr:       cfg.SSR,
		clientDir: absClient,
	}, nil
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	switch r.URL.Path {
	case "/feed.xml":
		s.handleFeed(w, r)
		return
	}

	if s.tryServeStatic(w, r) {
		return
	}

	s.handleSSR(w, r)
}

func (s *Server) handleFeed(w http.ResponseWriter, r *http.Request) {
	posts, err := s.content.LoadPostSummaries(r.Context())
	if err != nil {
		log.Printf("[server] rss build failed: %v", err)
		http.Error(w, "Failed to build feed", http.StatusInternalServerError)
		return
	}
	scheme := "https"
	if r.TLS == nil {
		scheme = "http"
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, r.Host)
	xml := feed.BuildXML(baseURL, posts)
	w.Header().Set("Content-Type", "application/rss+xml; charset=utf-8")
	_, _ = io.WriteString(w, xml)
}

func (s *Server) handleSSR(w http.ResponseWriter, r *http.Request) {
	route := routes.Match(r.URL.Path)
	data, err := BuildRouteData(r.Context(), s.content, route)
	if err != nil {
		log.Printf("[server] route data error for %s: %v", r.URL.Path, err)
		http.Error(w, "Failed to resolve route", http.StatusInternalServerError)
		return
	}

	html, err := s.ssr.Render(r.Context(), data.Props)
	if err != nil {
		log.Printf("[server] SSR rendering failed for %s: %v", r.URL.Path, err)
		http.Error(w, "SSR rendering failed", http.StatusInternalServerError)
		return
	}

	clientProps := buildClientPayload(data.Props)
	payload, err := util.MarshalForScript(clientProps)
	if err != nil {
		log.Printf("[server] payload serialization failed for %s: %v", r.URL.Path, err)
		http.Error(w, "Failed to serialize payload", http.StatusInternalServerError)
		return
	}

	meta := ResolveMeta(data.Props)
	document := templates.Inject(s.template, html, payload, meta)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(data.Status)
	_, _ = io.WriteString(w, document)
}

func (s *Server) tryServeStatic(w http.ResponseWriter, r *http.Request) bool {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		return false
	}
	clean := path.Clean(r.URL.Path)
	if clean == "/" || clean == "." {
		return false
	}
	rel := strings.TrimPrefix(clean, "/")
	if rel == "" {
		return false
	}
	relFS := filepath.Clean(rel)
	target := filepath.Join(s.clientDir, relFS)
	if !strings.HasPrefix(target, s.clientDir) {
		return false
	}
	info, err := os.Stat(target)
	if err != nil || info.IsDir() {
		return false
	}

	if strings.HasPrefix(clean, "/assets/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	} else if strings.HasPrefix(clean, "/images/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=3600")
	}

	http.ServeFile(w, r, target)
	return true
}

func buildClientPayload(props types.AppProps) types.AppProps {
	client := props
	if props.Route.Kind != types.RouteList && props.Route.Kind != types.RouteArchive {
		client.Posts = []types.PostSummary{}
	}
	if props.Route.Kind != types.RouteDetail {
		client.Post = nil
	}
	return client
}
