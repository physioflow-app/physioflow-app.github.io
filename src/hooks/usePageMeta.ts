import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMeta } from '../seo';

function setMeta(selector: string, attribute: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attribute, value);
}

/** Keeps the document title, description and canonical URL in step with client-side navigation. */
export function usePageMeta(title?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = title ? `${title} | PhysioFlow` : meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (meta.canonical) {
      canonical?.setAttribute('href', meta.canonical);
      setMeta('meta[property="og:url"]', 'content', meta.canonical);
    }
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta.canonical) {
      if (!robots) {
        robots = Object.assign(document.createElement('meta'), { name: 'robots' });
        document.head.appendChild(robots);
      }
      robots.content = 'noindex';
    } else {
      robots?.remove();
    }
  }, [pathname, title]);
}
