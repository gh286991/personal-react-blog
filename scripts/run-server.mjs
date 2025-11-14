import fs from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MODE = process.argv[2] ?? 'dev';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

// 檢查並清理端口
function checkAndCleanPort(port) {
  try {
    const result = spawnSync('lsof', ['-ti', `:${port}`], { encoding: 'utf-8' });
    if (result.stdout.trim()) {
      const pids = result.stdout.trim().split('\n').filter(Boolean);
      // 過濾掉非服務器進程（如 Chrome 連接）
      const serverPids = pids.filter(pid => {
        try {
          const psResult = spawnSync('ps', ['-p', pid, '-o', 'command='], { encoding: 'utf-8' });
          const cmd = psResult.stdout.trim();
          // 只清理服務器相關進程
          return cmd && (cmd.includes('bun') || cmd.includes('node') || cmd.includes('tsx') || cmd.includes('server'));
        } catch {
          return false;
        }
      });
      
      if (serverPids.length > 0) {
        console.warn(`[dev] Port ${port} is already in use by: ${serverPids.join(', ')}`);
        console.warn(`[dev] Killing existing server processes...`);
        serverPids.forEach(pid => {
          try {
            spawnSync('kill', ['-9', pid], { stdio: 'ignore' });
          } catch {
            // ignore
          }
        });
        // 等待一下讓端口釋放
        spawnSync('sleep', ['1'], { stdio: 'ignore' });
      }
    }
  } catch (error) {
    // lsof 可能不存在或失敗，忽略
  }
}

// 在開發模式下檢查端口
if (MODE === 'dev') {
  const PORT = Number(process.env.PORT) || 3000;
  checkAndCleanPort(PORT);
}

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
  detached: MODE !== 'dev', // dev 模式保持附著，方便 ctrl+c
};

let child = spawn(command, args, spawnOptions);
let hasFallenBack = false;

function attachChildListeners(proc) {
  proc.on('error', handleChildError);
  if (MODE !== 'dev') {
    proc.unref();
  } else {
    proc.on('exit', (code) => {
      if (child === proc) {
        process.exit(code ?? 0);
      }
    });
  }
}

function handleChildError(error) {
  if (shouldUseBun && !hasFallenBack) {
    hasFallenBack = true;
    console.error(`[dev] Failed to start bun (${error.message}). Falling back to Node.`);
    const fallbackCommand = MODE === 'dev' ? binPath('tsx') : 'node';
    const fallbackArgs =
      MODE === 'dev'
        ? ['server/server.ts']
        : ['--max-old-space-size=48', 'dist/server/server.js'];
    const fallbackChild = spawn(fallbackCommand, fallbackArgs, spawnOptions);
    child = fallbackChild;
    attachChildListeners(child);
  } else {
    console.error('[dev] Failed to start server:', error);
    process.exit(1);
  }
}

attachChildListeners(child);

if (MODE === 'dev') {
  // dev 模式保持前景行程，方便觀察與終止
  const forwardSignal = (signal) => {
    try {
      child.kill(signal);
    } catch {
      // ignore
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
}

// 對於 production 模式，立即退出啟動腳本
if (MODE !== 'dev') {
  // 給子進程一點時間啟動，如果立即失敗會觸發 error 事件
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
