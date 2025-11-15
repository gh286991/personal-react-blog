import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
await fs.mkdir(DIST, { recursive: true });
await copyDir(path.join(ROOT, 'posts'), path.join(DIST, 'posts'));

// 複製 public 目錄（包含圖片）到 dist/client 和 dist/public
const publicDir = path.join(ROOT, 'public');
const distClientDir = path.join(DIST, 'client');
const distPublicDir = path.join(DIST, 'public');
if (await fs.access(publicDir).then(() => true).catch(() => false)) {
  // 複製到 dist/public（用於 Node.js 服務器）
  await copyDir(publicDir, distPublicDir);
  // 複製到 dist/client（用於 Go 服務器，因為它從 clientDir 提供靜態文件）
  await copyDir(publicDir, distClientDir);
}

async function copyDir(source, target, exclude = new Set()) {
  try {
    const entries = await fs.readdir(source, { withFileTypes: true });
    await fs.mkdir(target, { recursive: true });

    for (const entry of entries) {
      if (exclude.has(entry.name)) continue;
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath, exclude);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    if (
      (error instanceof Error && 'code' in error && error.code === 'ENOENT') ||
      (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT')
    ) {
      return;
    }
    throw error;
  }
}
