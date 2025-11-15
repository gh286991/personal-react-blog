package routes

import (
	"net/url"
	"path"
	"strings"
	"personal-react-blog/server-go/internal/types"
)

func Match(rawPath string) types.RouteMatch {
	normalized := normalizePathname(rawPath)

	switch normalized {
	case "/":
		return types.RouteMatch{Kind: types.RouteList}
	case "/about":
		return types.RouteMatch{Kind: types.RouteStatic, StaticPage: "about"}
	case "/works":
		return types.RouteMatch{Kind: types.RouteStatic, StaticPage: "works"}
	case "/posts":
		return types.RouteMatch{Kind: types.RouteArchive}
	}

	if slug := extractPostSlug(normalized); slug != "" {
		return types.RouteMatch{Kind: types.RouteDetail, Slug: slug}
	}

	return types.RouteMatch{Kind: types.RouteNotFound}
}

func normalizePathname(raw string) string {
	if raw == "" {
		return "/"
	}

	parsed, err := url.Parse(raw)
	if err == nil && parsed.Path != "" {
		raw = parsed.Path
	}

	cleaned := path.Clean(raw)
	if cleaned == "." {
		cleaned = "/"
	}

	if cleaned != "/" && strings.HasSuffix(cleaned, "/") {
		cleaned = strings.TrimRight(cleaned, "/")
		if cleaned == "" {
			cleaned = "/"
		}
	}

	if !strings.HasPrefix(cleaned, "/") {
		cleaned = "/" + cleaned
	}

	return cleaned
}

func extractPostSlug(p string) string {
	if !strings.HasPrefix(p, "/posts/") {
		return ""
	}
	if strings.Contains(p[7:], "/") {
		return ""
	}

	slug, err := url.PathUnescape(p[len("/posts/"):])
	if err != nil {
		return p[len("/posts/"):]
	}
	return slug
}
