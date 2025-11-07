import { spawnSync, spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const MODE = process.argv[2] ?? 'dev';
const ROOT = process.cwd();

const env = { ...process.env };
if (MODE === 'dev') {
  env.NODE_ENV ||= 'development';
} else {
  env.NODE_ENV ||= 'production';
  env.CONTENT_BASE ||= 'dist';
}

const useBunPreference = env.USE_BUN?.toLowerCase();
const forceNode = useBunPreference === 'node' || useBunPreference === 'false';
const forceBun = useBunPreference === 'bun';

function hasBin(bin) {
  const result = spawnSync(bin, ['--version'], { stdio: 'ignore' });
  return !result.error;
}

const bunAvailable = !forceNode && hasBin('bun');
const shouldUseBun = forceBun ? true : bunAvailable;

if (!shouldUseBun && forceBun) {
  console.warn('[dev] bun is not available in PATH, falling back to Node runtime.');
}

function binPath(name) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  return path.resolve(ROOT, 'node_modules', '.bin', `${name}${suffix}`);
}

let command = 'node';
let args = [];

if (MODE === 'dev') {
  if (shouldUseBun) {
    command = 'bun';
    args = ['--watch', 'src/server.ts'];
  } else {
    command = binPath('tsx');
    args = ['src/server.ts'];
  }
} else {
  if (shouldUseBun) {
    command = 'bun';
    args = ['dist/server/server.js'];
  } else {
    command = 'node';
    args = ['dist/server/server.js'];
  }
}

const child = spawn(command, args, {
  stdio: 'inherit',
  env,
});

child.on('error', (error) => {
  if (shouldUseBun) {
    console.error(`[dev] Failed to start bun (${error.message}). Falling back to Node.`);
    if (MODE === 'dev') {
      spawn(binPath('tsx'), ['src/server.ts'], { stdio: 'inherit', env });
    } else {
      spawn('node', ['dist/server/server.js'], { stdio: 'inherit', env });
    }
  } else {
    console.error('[dev] Failed to start server:', error);
  }
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
