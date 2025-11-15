package feed

import (
	"fmt"
	"strings"
	"time"

	"personal-react-blog/server-go/internal/types"
)

const rssTimeLayout = "Mon, 02 Jan 2006 15:04:05 GMT"

func BuildXML(baseURL string, posts []types.PostSummary) string {
	siteTitle := "tomslab.dev｜湯編驛 (Tom's lab)"
	siteDescription := "開發筆記，記錄程式碼與想法的實踐過程"
	feedURL := fmt.Sprintf("%s/feed.xml", strings.TrimRight(baseURL, "/"))
	siteURL := strings.TrimRight(baseURL, "/")

	var items strings.Builder
	for _, post := range posts {
		postURL := fmt.Sprintf("%s/posts/%s", siteURL, post.Slug)
		pubDate := post.Date.UTC().Format(rssTimeLayout)
		description := ""
		if post.Summary != nil {
			description = escapeXML(*post.Summary)
		}
		items.WriteString("    <item>\n")
		items.WriteString(fmt.Sprintf("      <title>%s</title>\n", escapeXML(post.Title)))
		items.WriteString(fmt.Sprintf("      <link>%s</link>\n", postURL))
		items.WriteString(fmt.Sprintf("      <guid isPermaLink=\"true\">%s</guid>\n", postURL))
		items.WriteString(fmt.Sprintf("      <pubDate>%s</pubDate>\n", pubDate))
		items.WriteString(fmt.Sprintf("      <description>%s</description>\n", description))
		items.WriteString("    </item>\n")
	}

	lastBuild := time.Now().UTC().Format(rssTimeLayout)

	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>%s</title>
    <link>%s</link>
    <description>%s</description>
    <language>zh-TW</language>
    <lastBuildDate>%s</lastBuildDate>
    <atom:link href="%s" rel="self" type="application/rss+xml"/>
%s  </channel>
</rss>`,
		escapeXML(siteTitle),
		siteURL,
		escapeXML(siteDescription),
		lastBuild,
		feedURL,
		items.String())
}

func escapeXML(value string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		"\"", "&quot;",
		"'", "&apos;",
	)
	return replacer.Replace(value)
}
