#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

const entryArg = process.argv[2];
if (!entryArg) {
  console.error('[ssr-worker] Missing entry file path');
  process.exit(1);
}

let renderFn = null;

async function loadEntry() {
  const entryUrl = pathToFileURL(entryArg).href + `?t=${Date.now()}`;
  const mod = await import(entryUrl);
  if (typeof mod.render !== 'function') {
    throw new Error('render export not found in entry module');
  }
  renderFn = mod.render;
}

await loadEntry();
process.stdout.write(JSON.stringify({ type: 'ready' }) + '\n');

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);
    if (line.trim() === '') {
      continue;
    }
    handleMessage(line);
  }
});

async function handleMessage(raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch (error) {
    console.error('[ssr-worker] Invalid JSON payload', error);
    return;
  }

  if (message.type === 'render') {
    try {
      const props = reviveDates(structuredClone(message.props));
      const result = await renderFn(props);
      const html = result && typeof result.html === 'string' ? result.html : '';
      process.stdout.write(JSON.stringify({ id: message.id, html }) + '\n');
    } catch (error) {
      process.stdout.write(
        JSON.stringify({ id: message.id, error: serializeError(error) }) + '\n',
      );
    }
    return;
  }

  if (message.type === 'reload') {
    try {
      await loadEntry();
      process.stdout.write(JSON.stringify({ type: 'reloaded' }) + '\n');
    } catch (error) {
      process.stdout.write(
        JSON.stringify({ type: 'reload-error', error: serializeError(error) }) + '\n',
      );
    }
  }
}

function serializeError(error) {
  if (error && typeof error === 'object') {
    return {
      message: error.message || 'Unknown SSR error',
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

function reviveDates(props) {
  if (!props || typeof props !== 'object') {
    return props;
  }

  const reviveSummary = (summary) => {
    if (!summary || typeof summary !== 'object') {
      return;
    }
    if (summary.date) {
      summary.date = new Date(summary.date);
    }
    if (summary.lastUpdated) {
      summary.lastUpdated = new Date(summary.lastUpdated);
    }
  };

  if (Array.isArray(props.posts)) {
    props.posts.forEach(reviveSummary);
  }

  if (props.post) {
    reviveSummary(props.post);
  }

  return props;
}

process.on('uncaughtException', (error) => {
  console.error('[ssr-worker] uncaught exception', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[ssr-worker] unhandled rejection', reason);
});
