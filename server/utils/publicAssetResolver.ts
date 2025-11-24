import fs from 'node:fs';
import path from 'node:path';

type AssetMap = Map<string, string>;

export interface PublicAssetResolver {
  resolve: (fileName: string) => string | null;
  refresh: () => void;
}

export function createPublicAssetResolver(
  rootDirs: string | string[],
): PublicAssetResolver {
  const roots = Array.isArray(rootDirs) ? rootDirs : [rootDirs];
  let cache: AssetMap = new Map();
  let initialized = false;

  const normalize = (name: string) => name.toLowerCase();

  const scanDirectory = (dir: string, map: AssetMap) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(entryPath, map);
        continue;
      }
      const normalizedName = normalize(entry.name);
      if (map.has(normalizedName)) {
        continue;
      }
      map.set(normalizedName, entryPath);
    }
  };

  const rebuildCache = () => {
    const map: AssetMap = new Map();
    for (const root of roots) {
      if (!fs.existsSync(root)) {
        continue;
      }
      scanDirectory(root, map);
    }
    cache = map;
    initialized = true;
  };

  const resolve = (fileName: string) => {
    if (!initialized) {
      rebuildCache();
    }
    const normalized = normalize(fileName);
    let resolved: string | undefined = cache.get(normalized);
    if (!resolved) {
      rebuildCache();
      resolved = cache.get(normalized);
    }
    return resolved ?? null;
  };

  return {
    resolve,
    refresh: rebuildCache,
  };
}
