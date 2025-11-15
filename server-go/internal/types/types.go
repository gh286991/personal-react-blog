package types

import "time"

type RouteCategory string

const (
	RouteList     RouteCategory = "list"
	RouteArchive  RouteCategory = "archive"
	RouteDetail   RouteCategory = "detail"
	RouteStatic   RouteCategory = "static"
	RouteNotFound RouteCategory = "not-found"
)

type RouteMatch struct {
	Kind       RouteCategory `json:"kind"`
	Slug       string        `json:"slug,omitempty"`
	StaticPage string        `json:"staticPage,omitempty"`
}

type SiteConfig struct {
	ShowFilters bool `json:"showFilters"`
}

type PostSummary struct {
	Slug           string    `json:"slug"`
	Title          string    `json:"title"`
	Date           time.Time `json:"date"`
	LastUpdated    time.Time `json:"lastUpdated"`
	Summary        *string   `json:"summary"`
	Category       string    `json:"category"`
	Tags           []string  `json:"tags"`
	ReadingMinutes int       `json:"readingMinutes"`
	Featured       bool      `json:"featured,omitempty"`
}

type Post struct {
	PostSummary
	ContentHTML string `json:"contentHtml"`
}

type AppProps struct {
	Route  RouteMatch    `json:"route"`
	Posts  []PostSummary `json:"posts"`
	Post   *Post         `json:"post"`
	Config SiteConfig    `json:"config"`
}

type RouteData struct {
	Props  AppProps
	Status int
}
