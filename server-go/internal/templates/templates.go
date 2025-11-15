package templates

import "strings"

type Meta struct {
	Title       string
	Description string
}

func Inject(baseTemplate, appHTML, payload string, meta Meta) string {
	title := escapeAttr(meta.Title)
	description := escapeAttr(meta.Description)

	replaced := strings.Replace(baseTemplate, "%APP_TITLE%", title, 1)
	replaced = strings.Replace(replaced, "%APP_DESCRIPTION%", description, 1)
	replaced = strings.Replace(replaced, "<!--app-html-->", appHTML, 1)
	replaced = strings.Replace(replaced, "<!--app-data-->", payload, 1)
	return replaced
}

func escapeAttr(value string) string {
	replacer := strings.NewReplacer(
		`"`, "&quot;",
	)
	return replacer.Replace(value)
}
