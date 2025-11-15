import type { AppProps, RouteMatch } from '../../shared/types.js';
import { loadPost, loadPostSummaries, loadConfig } from '../content.js';

export interface RouteDataResult {
  props: AppProps;
  status: number;
}

export async function buildRouteData(route: RouteMatch): Promise<RouteDataResult> {
  const config = await loadConfig();

  if (route.kind === 'list' || route.kind === 'archive') {
    const posts = await loadPostSummaries();
    return {
      status: 200,
      props: { route, posts, post: null, config },
    };
  }

  if (route.kind === 'detail') {
    if (!route.slug) {
      return {
        status: 404,
        props: { route: { kind: 'not-found' }, posts: [], post: null, config },
      };
    }
    const post = await loadPost(route.slug);
    if (!post) {
      return {
        status: 404,
        props: { route: { kind: 'not-found' }, posts: [], post: null, config },
      };
    }
    return {
      status: 200,
      props: { route, posts: [], post, config },
    };
  }

  if (route.kind === 'static') {
    return {
      status: 200,
      props: { route, posts: [], post: null, config },
    };
  }

  return {
    status: 404,
    props: { route: { kind: 'not-found' }, posts: [], post: null, config },
  };
}
