import fs from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MODE = process.argv[2] ?? 'dev';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const env = { ...process.env };
if (MODE === 'dev') {
  env.NODE_ENV ||= 'development';
} else {
  env.NODE_ENV ||= 'production';
  env.CONTENT_BASE ||= 'dist';
  env.LOW_MEMORY_MODE ||= 'true';
  // Set NODE_PATH to help node find dependencies in pnpm workspace
  const nodePaths = [
    path.resolve(ROOT, 'node_modules'),
    path.resolve(ROOT, 'server', 'node_modules'),
  ].filter(p => fs.existsSync(p));
  if (nodePaths.length > 0) {
    env.NODE_PATH = nodePaths.join(path.delimiter);
  }
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
  const candidates = [
    path.resolve(ROOT, 'node_modules', '.bin', `${name}${suffix}`),
    path.resolve(ROOT, 'server', 'node_modules', '.bin', `${name}${suffix}`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return name;
}

let command = 'node';
let args = [];

if (MODE === 'dev') {
  if (shouldUseBun) {
    command = 'bun';
    args = ['--watch', 'server/server.ts'];
  } else {
    command = binPath('tsx');
    args = ['server/server.ts'];
  }
} else {
  // Production mode: Use pnpm exec to ensure dependencies are resolved correctly
  // This works better with pnpm workspace's symlink structure
  command = 'pnpm';
  args = ['exec', 'node', '--max-old-space-size=48', 'dist/server/server.js'];
}

const spawnOptions = {
  stdio: 'inherit',
  env,
  cwd: ROOT,
  detached: true, // 讓子進程獨立運行
};

const child = spawn(command, args, spawnOptions);

child.on('error', (error) => {
  if (shouldUseBun) {
    console.error(`[dev] Failed to start bun (${error.message}). Falling back to Node.`);
    const fallbackCommand = MODE === 'dev' ? binPath('tsx') : 'node';
    const fallbackArgs = MODE === 'dev' ? ['server/server.ts'] : ['--max-old-space-size=48', 'dist/server/server.js'];
    const fallbackChild = spawn(fallbackCommand, fallbackArgs, spawnOptions);
    fallbackChild.unref(); // 讓主進程可以退出
  } else {
    console.error('[dev] Failed to start server:', error);
    process.exit(1);
  }
});

// 讓子進程獨立運行，主進程可以退出
child.unref();

// 對於 production 模式，立即退出啟動腳本
if (MODE !== 'dev') {
  // 給子進程一點時間啟動，如果立即失敗會觸發 error 事件
  setTimeout(() => {
    process.exit(0);
  }, 100);
} else {
  // dev 模式：如果子進程立即失敗，等待一小段時間後檢查
  setTimeout(() => {
    if (child.killed || (child.exitCode !== null && child.exitCode !== 0)) {
      process.exit(child.exitCode ?? 1);
    }
  }, 1000);
}
