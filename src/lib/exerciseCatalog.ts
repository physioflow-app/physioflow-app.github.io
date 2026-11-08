import { getAllPrograms } from '../data/exercises';

export interface CatalogEntry {
  name: string;
  videoUrl: string;
  area: string;
}

/**
 * Every predefined exercise that has a verified video demonstration.
 * Derived from the program data so the AI prompt and video matching can
 * never drift out of sync with the catalog.
 */
export const exerciseCatalog: CatalogEntry[] = (() => {
  const seen = new Set<string>();
  const entries: CatalogEntry[] = [];
  for (const program of getAllPrograms()) {
    for (const week of program.weeks) {
      for (const exercise of week.exercises) {
        const key = exercise.name.toLowerCase();
        if (!exercise.videoUrl || seen.has(key)) continue;
        seen.add(key);
        entries.push({ name: exercise.name, videoUrl: exercise.videoUrl, area: program.bodyPart });
      }
    }
  }
  return entries;
})();

/** Catalog formatted for the AI prompt, one body area per line. */
export function catalogForPrompt(): string {
  const byArea = new Map<string, string[]>();
  for (const entry of exerciseCatalog) {
    byArea.set(entry.area, [...(byArea.get(entry.area) ?? []), entry.name]);
  }
  return [...byArea].map(([area, names]) => `${area.toUpperCase()}: ${names.join(', ')}`).join('\n');
}
