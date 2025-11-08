import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import App from './App';
import type { AppProps } from './types';
declare global {
  interface Window {
    __INITIAL_DATA__?: AppProps;
  }
}

function reviveDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function reviveInitialData(props: AppProps): AppProps {
  for (const post of props.posts) {
    post.date = reviveDate(post.date);
    post.lastUpdated = reviveDate(post.lastUpdated);
  }
  if (props.post) {
    props.post.date = reviveDate(props.post.date);
    props.post.lastUpdated = reviveDate(props.post.lastUpdated);
  }
  return props;
}

const container = document.getElementById('root');

if (container && window.__INITIAL_DATA__) {
  const props = reviveInitialData(window.__INITIAL_DATA__);
  hydrateRoot(container, <App {...props} />);
}
