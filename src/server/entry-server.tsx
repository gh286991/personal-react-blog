import React from 'react';
import { renderToString } from 'react-dom/server';

import App from '../App';
import type { AppProps } from '../types';

export async function render(props: AppProps) {
  const html = renderToString(<App {...props} />);
  return { html };
}
