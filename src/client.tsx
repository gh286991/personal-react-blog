import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import App, { AppProps } from './App';

declare global {
  interface Window {
    __INITIAL_DATA__?: AppProps;
  }
}

function reviveDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function reviveInitialData(props: AppProps): AppProps {
  const posts = props.posts.map((post) => ({ ...post, date: reviveDate(post.date) }));
  const post = props.post ? { ...props.post, date: reviveDate(props.post.date) } : props.post;
  return { ...props, posts, post };
}

const container = document.getElementById('root');

if (container && window.__INITIAL_DATA__) {
  const props = reviveInitialData(window.__INITIAL_DATA__);
  hydrateRoot(container, <App {...props} />);
}

if (process.env.NODE_ENV !== 'production') {
  const source = new EventSource('/dev/reload');
  let waitingForServer = false;
  let bundleReloadTimer: number | null = null;

  function showReloadBanner(message = '偵測到程式有更新，即將重新整理...') {
    const existing = document.getElementById('dev-reload-banner');
    if (existing) {
      existing.textContent = message;
      return existing;
    }

    const banner = document.createElement('div');
    banner.id = 'dev-reload-banner';
    banner.textContent = message;
    banner.style.position = 'fixed';
    banner.style.bottom = '1rem';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.padding = '0.5rem 1.25rem';
    banner.style.background = 'rgba(0, 0, 0, 0.8)';
    banner.style.color = '#fff';
    banner.style.borderRadius = '999px';
    banner.style.fontSize = '0.9rem';
    banner.style.zIndex = '2147483647';
    banner.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';

    document.body.appendChild(banner);
    return banner;
  }

  function reloadWhenServerReady(message = '程式碼更新中，稍等一下...') {
    if (waitingForServer) {
      return;
    }
    waitingForServer = true;
    const banner = showReloadBanner(message);
    if (bundleReloadTimer) {
      clearTimeout(bundleReloadTimer);
      bundleReloadTimer = null;
    }

    const ping = () => {
      fetch(`/dev/ping?t=${Date.now()}`, { cache: 'no-store' })
        .then(() => {
          waitingForServer = false;
          banner.textContent = '伺服器已就緒，重新載入...';
          setTimeout(() => {
            source.close();
            window.location.reload();
          }, 150);
        })
        .catch(() => {
          setTimeout(ping, 300);
        });
    };

    ping();
  }

  function refreshStylesheet(filename: string) {
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ).filter((link) => link.href.includes(filename));

    if (links.length === 0) {
      reloadWhenServerReady('偵測到樣式更新，重新整理中...');
      return;
    }

    links.forEach((link) => {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('_ts', Date.now().toString());
      link.href = url.toString();
    });
  }

  function queueBundleReload() {
    if (bundleReloadTimer) {
      return;
    }
    showReloadBanner('前端 bundle 更新中，稍等一下...');
    bundleReloadTimer = window.setTimeout(() => {
      bundleReloadTimer = null;
      reloadWhenServerReady();
    }, 600);
  }

  source.addEventListener('message', (event) => {
    if (event.data === 'reload:bundle') {
      queueBundleReload();
      return;
    }

    if (event.data === 'reload' || event.data === 'reload:content') {
      reloadWhenServerReady();
      return;
    }

    if (event.data.startsWith('css:')) {
      const filename = event.data.slice(4);
      refreshStylesheet(filename);
    }
  });

  source.addEventListener('error', () => {
    reloadWhenServerReady('伺服器重新啟動中，等一下...');
  });
}
