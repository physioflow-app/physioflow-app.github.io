import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { applyMeta } from './meta.mjs';

// Use a temporary server bundle so CommonJS routing dependencies are handled by
// Vite's production bundler. Keep it near node_modules for external React imports.
async function main() {
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
    const { render, getPageMeta, indexableRoutes, SITE_URL } = await import(pathToFileURL(resolve(directory, 'entry-server.mjs')).href);
    const template = await readFile('dist/index.html', 'utf8');
    const placeholder = '<div id="root"></div>';
    if (!template.includes(placeholder)) throw new Error('Missing root placeholder for prerendering.');

    const routes = indexableRoutes();
    for (const route of routes) {
      const html = applyMeta(template, getPageMeta(route)).replace(placeholder, `<div id="root">${render(route)}</div>`);
      // GitHub Pages serves /program/neck from program/neck.html without a redirect.
      const file = route === '/' ? 'dist/index.html' : `dist${route}.html`;
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html);
    }

    // Personal programs (/plan/:id) and share links live only in the browser:
    // serve the app shell, and keep them out of search results.
    const shell = applyMeta(template, getPageMeta('/__app'));
    await writeFile('dist/404.html', shell);
    await writeFile('dist/shared.html', shell);
    await writeFile('dist/import.html', shell);

    const urls = routes.map((route) => `${SITE_URL}${route}`);
    await writeFile('dist/sitemap.xml', [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`),
      '</urlset>',
      '',
    ].join('\n'));
    await writeFile('dist/sitemap.txt', `${urls.join('\n')}\n`);
    console.log(`Prerendered ${routes.length} pages and wrote sitemap.`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

await main();
