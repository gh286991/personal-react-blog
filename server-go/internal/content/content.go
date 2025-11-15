package content

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/microcosm-cc/bluemonday"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"gopkg.in/yaml.v3"

	"personal-react-blog/server-go/internal/types"
)

var (
	slugPattern       = regexp.MustCompile(`^[a-z0-9]+(?:[a-z0-9-_]*[a-z0-9])?$`)
	controlCharRegexp = regexp.MustCompile("[\x00-\x1F\x7F]")
	htmlTagRegexp     = regexp.MustCompile(`<[^>]*>`)
	whitespaceRegexp  = regexp.MustCompile(`\s+`)
	codeClassPattern  = regexp.MustCompile(`^language-[\w-]+$`)
)

const (
	summaryPreviewLimit = 500
	summaryMaxLength    = 200
	titleMaxLength      = 80
	tagMaxLength        = 30
	categoryMaxLength   = 40
	slugMaxLength       = 80
)

var ErrPostNotFound = errors.New("post not found")

type Config struct {
	BaseDir string
}

type Store struct {
	postsDir   string
	configPath string
	markdown   goldmark.Markdown
	sanitizer  *bluemonday.Policy

	fileListMu sync.RWMutex
	fileList   []postFile
	fileListTs time.Time
}

type postFile struct {
	fullPath string
	folder   string
}

type parsedMarkdown struct {
	front matter
	body  string
	info  os.FileInfo
	file  postFile
}

type matter struct {
	Title      string     `yaml:"title"`
	Date       string     `yaml:"date"`
	Summary    string     `yaml:"summary"`
	Category   string     `yaml:"category"`
	Tags       stringList `yaml:"tags"`
	Updated    string     `yaml:"updated"`
	LastUpdate string     `yaml:"lastUpdated"`
	Featured   bool       `yaml:"featured"`
	Promoted   bool       `yaml:"promoted"`
	Promote    bool       `yaml:"promote"`
}

type configMatter struct {
	ShowFilters bool `yaml:"showFilters"`
}

type stringList []string

func NewStore(cfg Config) *Store {
	postsDir := filepath.Join(cfg.BaseDir, "posts")
	markdown := goldmark.New(
		goldmark.WithExtensions(extension.GFM),
		goldmark.WithParserOptions(parser.WithAutoHeadingID()),
		goldmark.WithRendererOptions(html.WithUnsafe()),
	)
	return &Store{
		postsDir:   postsDir,
		configPath: filepath.Join(cfg.BaseDir, "_config.md"),
		markdown:   markdown,
		sanitizer:  buildSanitizer(),
	}
}

func buildSanitizer() *bluemonday.Policy {
	policy := bluemonday.UGCPolicy()
	policy.AllowElements("span", "del", "ins", "sup", "sub", "table", "thead", "tbody", "tr", "th", "td", "hr")
	policy.AllowAttrs("class").Matching(codeClassPattern).OnElements("code", "pre")
	policy.AllowAttrs("class").OnElements("table")
	policy.AllowAttrs("scope").OnElements("th")
	policy.AllowAttrs("loading", "width", "height", "title").OnElements("img")
	policy.AllowAttrs("target", "title", "rel", "name").OnElements("a")
	policy.AllowAttrs("src", "alt").OnElements("img")
	policy.AllowAttrs("data-language").OnElements("code")
	policy.AllowURLSchemes("http", "https", "mailto")
	policy.RequireNoFollowOnLinks(false)
	policy.AllowStyles("text-align")
	return policy
}

func (s *Store) LoadPostSummaries(_ context.Context) ([]types.PostSummary, error) {
	files, err := s.listMarkdownFiles()
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return []types.PostSummary{}, nil
	}
	summaries := make([]types.PostSummary, 0, len(files))
	for _, entry := range files {
		summary, err := s.parseSummary(entry)
		if err != nil {
			continue
		}
		summaries = append(summaries, summary)
	}
	sort.Slice(summaries, func(i, j int) bool {
		return summaries[i].Date.After(summaries[j].Date)
	})
	return summaries, nil
}

func (s *Store) LoadPost(_ context.Context, slug string) (*types.Post, error) {
	safeSlug := sanitizeSlug(slug)
	if safeSlug == "" {
		return nil, nil
	}

	path := filepath.Join(s.postsDir, safeSlug+".md")
	info, err := os.Stat(path)
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return nil, err
		}
		files, listErr := s.listMarkdownFiles()
		if listErr != nil {
			return nil, listErr
		}
		found := false
		for _, entry := range files {
			base := strings.TrimSuffix(filepath.Base(entry.fullPath), filepath.Ext(entry.fullPath))
			if base == safeSlug {
				path = entry.fullPath
				info, err = os.Stat(path)
				if err != nil {
					return nil, err
				}
				found = true
				break
			}
		}
		if !found {
			return nil, nil
		}
	}

	parsed, err := s.readMarkdown(path, info)
	if err != nil {
		return nil, err
	}
	summary := buildSummaryFromParsed(parsed)
	html, err := s.renderHTML(parsed.body)
	if err != nil {
		return nil, err
	}
	return &types.Post{PostSummary: summary, ContentHTML: html}, nil
}

func (s *Store) LoadConfig(_ context.Context) (types.SiteConfig, error) {
	if _, err := os.Stat(s.configPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return types.SiteConfig{ShowFilters: false}, nil
		}
		return types.SiteConfig{}, err
	}
	raw, err := os.ReadFile(s.configPath)
	if err != nil {
		return types.SiteConfig{}, err
	}
	front, _ := splitFrontMatter(raw)
	if front == nil {
		return types.SiteConfig{ShowFilters: false}, nil
	}
	var cfg configMatter
	if err := yaml.Unmarshal(front, &cfg); err != nil {
		return types.SiteConfig{}, err
	}
	return types.SiteConfig{ShowFilters: cfg.ShowFilters}, nil
}

func (s *Store) listMarkdownFiles() ([]postFile, error) {
	s.fileListMu.RLock()
	cached := s.fileList
	ts := s.fileListTs
	s.fileListMu.RUnlock()

	stat, err := os.Stat(s.postsDir)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return []postFile{}, nil
		}
		return nil, err
	}

	if len(cached) > 0 && !stat.ModTime().After(ts) {
		return append([]postFile(nil), cached...), nil
	}

	entries := []postFile{}
	walkErr := filepath.WalkDir(s.postsDir, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}
		if !strings.HasSuffix(strings.ToLower(d.Name()), ".md") {
			return nil
		}
		rel, err := filepath.Rel(s.postsDir, path)
		if err != nil {
			return err
		}
		folder := filepath.Dir(rel)
		if folder == "." {
			folder = ""
		}
		entries = append(entries, postFile{fullPath: path, folder: folder})
		return nil
	})
	if walkErr != nil {
		return nil, walkErr
	}

	s.fileListMu.Lock()
	s.fileList = append([]postFile(nil), entries...)
	s.fileListTs = stat.ModTime()
	s.fileListMu.Unlock()

	return entries, nil
}

func (s *Store) parseSummary(entry postFile) (types.PostSummary, error) {
	info, err := os.Stat(entry.fullPath)
	if err != nil {
		return types.PostSummary{}, err
	}
	parsed, err := s.readMarkdown(entry.fullPath, info)
	if err != nil {
		return types.PostSummary{}, err
	}
	return buildSummaryFromParsed(parsed), nil
}

func (s *Store) readMarkdown(path string, info os.FileInfo) (*parsedMarkdown, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	front, body := splitFrontMatter(raw)
	fm := matter{}
	if front != nil {
		if err := yaml.Unmarshal(front, &fm); err != nil {
			return nil, err
		}
	}

	folder := ""
	rel, relErr := filepath.Rel(s.postsDir, path)
	if relErr == nil {
		folder = filepath.Dir(rel)
		if folder == "." {
			folder = ""
		}
	}

	return &parsedMarkdown{
		front: fm,
		body:  string(body),
		info:  info,
		file:  postFile{fullPath: path, folder: folder},
	}, nil
}

func splitFrontMatter(raw []byte) ([]byte, []byte) {
	reader := bufio.NewReader(bytes.NewReader(raw))
	firstLine, err := reader.ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return nil, raw
	}
	if strings.TrimSpace(firstLine) != "---" {
		return nil, raw
	}

	var front bytes.Buffer
	for {
		line, err := reader.ReadString('\n')
		if errors.Is(err, io.EOF) {
			return front.Bytes(), []byte{}
		}
		trimmed := strings.TrimSpace(line)
		if trimmed == "---" {
			break
		}
		front.WriteString(line)
	}

	remainder, _ := io.ReadAll(reader)
	return front.Bytes(), remainder
}

func (s *Store) renderHTML(markdownBody string) (string, error) {
	var buf bytes.Buffer
	if err := s.markdown.Convert([]byte(markdownBody), &buf); err != nil {
		return "", err
	}
	sanitized := s.sanitizer.Sanitize(buf.String())
	// 標準化圖片路徑並添加 lazy loading
	normalized := normalizeImagePaths(sanitized)
	withLazyLoading := addLazyLoadingToImages(normalized)
	return withLazyLoading, nil
}

// normalizeImagePaths 標準化圖片路徑：將相對路徑和本地路徑轉換為 /images/ 路徑
func normalizeImagePaths(html string) string {
	// 匹配圖片標籤中的 src 屬性
	imgPattern := regexp.MustCompile(`(?i)<img\s+([^>]*?)>`)
	return imgPattern.ReplaceAllStringFunc(html, func(match string) string {
		// 提取 src 屬性值
		srcMatch := regexp.MustCompile(`(?i)\bsrc\s*=\s*["']([^"']+)["']`).FindStringSubmatch(match)
		if len(srcMatch) < 2 {
			return match
		}
		
		src := srcMatch[1]
		originalSrc := src
		
		// 如果是外部 URL，不處理
		if strings.HasPrefix(src, "http://") || strings.HasPrefix(src, "https://") {
			return match
		}
		
		// 如果已經是 /images/ 路徑，不需要轉換
		if strings.HasPrefix(src, "/images/") {
			return match
		}
		
		// 提取文件名
		var fileName string
		if strings.Contains(src, "public/images/") {
			parts := strings.Split(src, "public/images/")
			if len(parts) > 1 {
				fileName = filepath.Base(parts[1])
			} else {
				fileName = filepath.Base(src)
			}
		} else if strings.Contains(src, "images/") {
			parts := strings.Split(src, "images/")
			if len(parts) > 1 {
				fileName = filepath.Base(parts[1])
			} else {
				fileName = filepath.Base(src)
			}
		} else {
			fileName = filepath.Base(src)
		}
		
		// 轉換為 /images/ 路徑
		newSrc := fmt.Sprintf("/images/%s", fileName)
		
		// 如果路徑改變了，替換 src 屬性
		if newSrc != originalSrc {
			newMatch := regexp.MustCompile(`(?i)\bsrc\s*=\s*["'][^"']+["']`).ReplaceAllString(match, fmt.Sprintf(`src="%s"`, newSrc))
			return newMatch
		}
		
		return match
	})
}

// addLazyLoadingToImages 為所有圖片標籤自動添加 lazy loading 屬性
func addLazyLoadingToImages(html string) string {
	// 匹配 <img> 標籤（包括自閉合標籤），如果沒有 loading 屬性就添加
	imgPattern := regexp.MustCompile(`(?i)<img\s+([^>]*?)(\s*/)?>`)
	return imgPattern.ReplaceAllStringFunc(html, func(match string) string {
		// 如果已經有 loading 屬性，不修改
		if strings.Contains(strings.ToLower(match), "loading=") {
			return match
		}
		// 提取屬性和自閉合標記
		submatch := imgPattern.FindStringSubmatch(match)
		if len(submatch) < 3 {
			return match
		}
		attributes := submatch[1]
		selfClosing := submatch[2]
		// 添加 loading="lazy" 屬性
		if selfClosing != "" {
			return fmt.Sprintf(`<img %s loading="lazy"%s>`, attributes, selfClosing)
		}
		return fmt.Sprintf(`<img %s loading="lazy">`, attributes)
	})
}

func buildSummaryFromParsed(parsed *parsedMarkdown) types.PostSummary {
	base := strings.TrimSuffix(filepath.Base(parsed.file.fullPath), filepath.Ext(parsed.file.fullPath))
	slug := sanitizeSlug(base)
	if slug == "" {
		slug = fmt.Sprintf("post-%d", parsed.info.ModTime().Unix())
	}

	title := sanitizePlainText(parsed.front.Title, titleMaxLength)
	if title == "" {
		title = slug
	}

	summaryText := parsed.front.Summary
	if summaryText == "" {
		summaryText = fallbackSummary(parsed.body)
	}
	summaryText = sanitizePlainText(summaryText, summaryMaxLength)
	var summaryPtr *string
	if summaryText != "" {
		summaryPtr = &summaryText
	}

	date := pickDate(parsed.front.Date, parsed.info.ModTime())
	lastUpdated := pickDate(firstNonEmpty(parsed.front.Updated, parsed.front.LastUpdate), parsed.info.ModTime())

	tags := normalizeTags(parsed.front.Tags)
	category := sanitizePlainText(parsed.front.Category, categoryMaxLength)
	if category == "" {
		if parsed.file.folder != "" {
			category = parsed.file.folder
		} else {
			category = "未分類"
		}
	}

	readingMinutes := computeReadingMinutes(parsed.body)
	featured := parsed.front.Featured || parsed.front.Promoted || parsed.front.Promote

	return types.PostSummary{
		Slug:           slug,
		Title:          title,
		Date:           date,
		LastUpdated:    lastUpdated,
		Summary:        summaryPtr,
		Category:       category,
		Tags:           tags,
		ReadingMinutes: readingMinutes,
		Featured:       featured,
	}
}

func normalizeTags(raw stringList) []string {
	if len(raw) == 0 {
		return []string{}
	}
	tags := make([]string, 0, len(raw))
	for _, tag := range raw {
		safe := sanitizePlainText(tag, tagMaxLength)
		if safe != "" {
			tags = append(tags, safe)
		}
		if len(tags) >= 8 {
			break
		}
	}
	return tags
}

func fallbackSummary(body string) string {
	preview := body
	if len(preview) > summaryPreviewLimit {
		preview = preview[:summaryPreviewLimit]
	}
	preview = strings.ReplaceAll(preview, "\n", " ")
	preview = strings.ReplaceAll(preview, "#", "")
	preview = strings.ReplaceAll(preview, "*", "")
	preview = strings.ReplaceAll(preview, "`", "")
	preview = whitespaceRegexp.ReplaceAllString(preview, " ")
	return preview
}

func sanitizePlainText(raw string, max int) string {
	cleaned := controlCharRegexp.ReplaceAllString(raw, "")
	cleaned = htmlTagRegexp.ReplaceAllString(cleaned, "")
	cleaned = strings.TrimSpace(cleaned)
	if cleaned == "" {
		return ""
	}
	runes := []rune(cleaned)
	if len(runes) > max {
		runes = runes[:max]
	}
	return string(runes)
}

func sanitizeSlug(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if len(trimmed) > slugMaxLength {
		trimmed = trimmed[:slugMaxLength]
	}
	if !slugPattern.MatchString(trimmed) {
		return ""
	}
	return trimmed
}

func computeReadingMinutes(body string) int {
	inWord := false
	words := 0
	for _, r := range body {
		if unicode.IsSpace(r) {
			if inWord {
				inWord = false
			}
			continue
		}
		if !inWord {
			words++
			inWord = true
		}
	}
	minutes := int(math.Round(float64(words) / 150.0))
	if minutes < 1 {
		minutes = 1
	}
	return minutes
}

func pickDate(raw string, fallback time.Time) time.Time {
	if parsed, err := parseDate(raw); err == nil && !parsed.IsZero() {
		return parsed
	}
	return fallback
}

func parseDate(raw string) (time.Time, error) {
	if strings.TrimSpace(raw) == "" {
		return time.Time{}, errors.New("empty date")
	}
	layouts := []string{
		time.RFC3339,
		"2006-01-02",
		"2006/01/02",
		"2006-01-02 15:04:05",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, raw); err == nil {
			return t, nil
		}
	}
	return time.Time{}, errors.New("invalid date")
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func (s *stringList) UnmarshalYAML(value *yaml.Node) error {
	if s == nil {
		return nil
	}
	switch value.Kind {
	case yaml.SequenceNode:
		tmp := make([]string, 0, len(value.Content))
		for _, node := range value.Content {
			tmp = append(tmp, node.Value)
		}
		*s = stringList(tmp)
	case yaml.ScalarNode:
		trimmed := strings.TrimSpace(value.Value)
		if trimmed == "" {
			*s = nil
			return nil
		}
		parts := strings.Split(trimmed, ",")
		tmp := make([]string, 0, len(parts))
		for _, part := range parts {
			tmp = append(tmp, strings.TrimSpace(part))
		}
		*s = stringList(tmp)
	default:
		*s = nil
	}
	return nil
}
