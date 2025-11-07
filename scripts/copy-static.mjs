import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
await fs.mkdir(DIST, { recursive: true });
await copyDir(path.join(ROOT, 'posts'), path.join(DIST, 'posts'));

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
