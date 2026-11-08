import { canonicalBodyPartId, getProgramForBodyPart, libraryPrograms } from './data/exercises';

export const SITE_URL = 'https://physioflow-app.github.io';
export const SITE_NAME = 'PhysioFlow';
export const DEFAULT_TITLE = 'PhysioFlow | Free AI Exercise & Mobility Programs';
export const DEFAULT_DESCRIPTION = 'Create free, personalized exercise programs for mobility, stretching and strengthening. Follow step-by-step instructions, watch videos and track your progress.';

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL, or null for pages that should not be indexed. */
  canonical: string | null;
}

export function getPageMeta(pathname: string): PageMeta {
  const match = pathname.match(/^\/program\/([^/]+)\/?$/);
  if (match) {
    const program = getProgramForBodyPart(match[1]);
    if (program) {
      return {
        title: `${program.title} | Free ${program.duration}-Week ${program.bodyPart} Program | ${SITE_NAME}`,
        description: `${program.description} Step-by-step instructions, video demonstrations, and progress tracking. Free, no account needed.`,
        canonical: `${SITE_URL}/program/${canonicalBodyPartId(match[1])}`,
      };
    }
  }
  if (pathname === '/' || pathname === '') {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, canonical: `${SITE_URL}/` };
  }
  // Personal programs and unknown pages live only in the visitor's browser.
  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, canonical: null };
}

/** Public, indexable routes; used for prerendering and the sitemap. */
export function indexableRoutes(): string[] {
  return ['/', ...libraryPrograms.map((program) => `/program/${program.bodyPartId}`)];
}
