/* eslint-disable react-refresh/only-export-components -- server-only entry, never hot-reloaded */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import AppShell from './AppShell';

export { getPageMeta, indexableRoutes, SITE_URL } from './seo';

export function render(url = '/') {
  return renderToString(<StaticRouter location={url}><AppShell /></StaticRouter>);
}
