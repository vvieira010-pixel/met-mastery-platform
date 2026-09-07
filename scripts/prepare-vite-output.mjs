import { access, rename } from 'node:fs/promises';

try {
  await access('dist/index.html');
  await rename('dist/index.html', 'dist/app.html');
  console.log('prepare-vite-output: renamed dist/index.html to dist/app.html');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('prepare-vite-output: dist/index.html was not present; no rename needed');
}
