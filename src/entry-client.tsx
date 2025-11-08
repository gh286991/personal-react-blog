import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import App from './App';
import type { AppProps } from './types';
declare global {
  interface Window {
    __INITIAL_DATA__?: AppProps;
  }
}

// 初始化主題（在 React hydration 之前執行，避免閃爍）
function initTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果用戶明確選擇了主題，使用用戶選擇；否則跟隨系統設定
    const shouldBeDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // 如果 localStorage 不可用，使用系統設定
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
}

// 立即執行主題初始化
initTheme();

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
