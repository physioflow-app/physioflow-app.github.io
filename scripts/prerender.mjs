import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

// Use a temporary server bundle so CommonJS routing dependencies are handled by
// Vite's production bundler. Keep it near node_modules for external React imports.
await mkdir('node_modules/.tmp', { recursive: true });
const directory = await mkdtemp(resolve('node_modules/.tmp/physioflow-prerender-'));
try {
  await build({
    logLevel: 'warn',
    ssr: { noExternal: ['react-router', 'react-router-dom'] },
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: directory,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
  });
  const { render } = await import(pathToFileURL(resolve(directory, 'entry-server.mjs')).href);
  const html = await readFile('dist/index.html', 'utf8');
  const placeholder = '<div id="root"></div>';
  if (!html.includes(placeholder)) throw new Error('Missing root placeholder for homepage prerendering.');
  await writeFile('dist/index.html', html.replace(placeholder, `<div id="root">${render()}</div>`));
} finally {
  await rm(directory, { recursive: true, force: true });
}
