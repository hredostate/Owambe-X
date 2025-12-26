import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, 'badge_pack_source');
const destRoot = path.join(repoRoot, 'public', 'badges', 'owambe');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const safeCopy = async (src, dest) => {
  try {
    await fs.copyFile(src, dest);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const copyDir = async (srcDir, destDir) => {
  try {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    await ensureDir(destDir);
    await Promise.all(entries.map(async (entry) => {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const main = async () => {
  await ensureDir(destRoot);

  await safeCopy(path.join(sourceRoot, 'badgeCatalog.json'), path.join(destRoot, 'badgeCatalog.json'));
  await safeCopy(path.join(sourceRoot, 'README.md'), path.join(destRoot, 'README.md'));

  await copyDir(path.join(sourceRoot, 'assets', '1080'), path.join(destRoot, 'assets', '1080'));
  await copyDir(path.join(sourceRoot, 'assets', '512'), path.join(destRoot, 'assets', '512'));
};

main();
