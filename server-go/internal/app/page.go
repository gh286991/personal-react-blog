package app

import (
	"context"

	"personal-react-blog/server-go/internal/content"
	"personal-react-blog/server-go/internal/templates"
	"personal-react-blog/server-go/internal/types"
)

func BuildRouteData(ctx context.Context, store *content.Store, route types.RouteMatch) (types.RouteData, error) {
	config, err := store.LoadConfig(ctx)
	if err != nil {
		return types.RouteData{}, err
	}

	switch route.Kind {
	case types.RouteList, types.RouteArchive:
		posts, err := store.LoadPostSummaries(ctx)
		if err != nil {
			return types.RouteData{}, err
		}
		props := types.AppProps{Route: route, Posts: posts, Post: nil, Config: config}
		return types.RouteData{Props: props, Status: 200}, nil
	case types.RouteDetail:
		if route.Slug == "" {
			return buildNotFound(config), nil
		}
		post, err := store.LoadPost(ctx, route.Slug)
		if err != nil {
			return types.RouteData{}, err
		}
		if post == nil {
			return buildNotFound(config), nil
		}
		props := types.AppProps{Route: route, Posts: []types.PostSummary{}, Post: post, Config: config}
		return types.RouteData{Props: props, Status: 200}, nil
	case types.RouteStatic:
		props := types.AppProps{Route: route, Posts: []types.PostSummary{}, Post: nil, Config: config}
		return types.RouteData{Props: props, Status: 200}, nil
	default:
		return buildNotFound(config), nil
	}
}

func buildNotFound(config types.SiteConfig) types.RouteData {
	props := types.AppProps{
		Route:  types.RouteMatch{Kind: types.RouteNotFound},
		Posts:  []types.PostSummary{},
		Post:   nil,
		Config: config,
	}
	return types.RouteData{Props: props, Status: 404}
}

func ResolveMeta(props types.AppProps) templates.Meta {
	switch props.Route.Kind {
	case types.RouteDetail:
		if props.Post != nil {
			description := "tomslab.dev｜湯編驛 (Tom's lab) - 開發筆記"
			if props.Post.Summary != nil {
				description = *props.Post.Summary
			}
			return templates.Meta{
				Title:       props.Post.Title,
				Description: description,
			}
		}
	case types.RouteStatic:
		if props.Route.StaticPage == "about" {
			return templates.Meta{
				Title:       "關於我 - tomslab.dev｜湯編驛 (Tom's lab)",
				Description: "關於 Tom - 開發筆記，記錄程式碼與想法的實踐過程",
			}
		}
		if props.Route.StaticPage == "works" {
			return templates.Meta{
				Title:       "項目＆Lab - tomslab.dev｜湯編驛 (Tom's lab)",
				Description: "把會上線的項目與湯編驛實驗室的原型分開記錄，快速掌握每個點子的進度",
			}
		}
		return templates.Meta{
			Title:       "靜態頁面 - tomslab.dev｜湯編驛 (Tom's lab)",
			Description: "靜態內容頁面",
		}
	case types.RouteArchive:
		return templates.Meta{
			Title:       "文章列表 - tomslab.dev｜湯編驛 (Tom's lab)",
			Description: "瀏覽全部文章與標籤，快速找到想看的內容",
		}
	}
	return templates.Meta{
		Title:       "tomslab.dev｜湯編驛 (Tom's lab) - 開發筆記",
		Description: "開發筆記，記錄程式碼與想法的實踐過程",
	}
}
