import React from 'react';
import { renderToString } from 'react-dom/server';

import App from '../frontend/App.js';
import type { AppProps } from '../shared/types.js';

export async function render(props: AppProps) {
  const html = renderToString(<App {...props} />);
  return { html };
}
