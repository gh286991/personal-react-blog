import type { Application } from 'express';

import { isLowMemoryMode } from '../shared/content.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

async function start() {
  setupGarbageCollection();

  const app: Application = await createApp({ isProd: IS_PROD });
  app.listen(PORT, () => {
    console.log(`✅ React SSR blog running on http://localhost:${PORT}`);
    if (isLowMemoryMode) {
      console.log('💾 Low memory mode enabled');
    }
  });
}

function setupGarbageCollection() {
  const gc = (global as { gc?: () => void }).gc;
  if (!gc || typeof gc !== 'function') {
    return;
  }

  const interval = isLowMemoryMode ? 10000 : 60000;
  setInterval(() => {
    try {
      gc();
    } catch {
      // ignore
    }
  }, interval);
}

start().catch((error) => {
  console.error('[server] failed to start', error);
  process.exit(1);
});
