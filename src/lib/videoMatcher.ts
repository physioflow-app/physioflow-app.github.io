import { Exercise, Program } from '../types';
import { exerciseCatalog } from './exerciseCatalog';

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/s\b/g, '').replace(/\s+/g, ' ').trim();
}

// Words that do not change which movement is being demonstrated.
const FILLER = new Set(['exercise', 'stretch', 'with', 'the', 'a', 'an', 'of', 'and', 'your', 'for']);

/** Order-insensitive key without filler words, e.g. "Stretch: Hip Flexor" -> "flexor hip". */
function tokenKey(name: string): string {
  return normalizeName(name).split(' ').filter((token) => token && !FILLER.has(token)).sort().join(' ');
}

const exactMatches = new Map(exerciseCatalog.map((entry) => [normalizeName(entry.name), entry.videoUrl] as const));

// Looser matches are only used when they point to a single video.
const looseMatches = (() => {
  const map = new Map<string, string | null>();
  for (const entry of exerciseCatalog) {
    const key = tokenKey(entry.name);
    if (!key) continue;
    const existing = map.get(key);
    map.set(key, existing === undefined || existing === entry.videoUrl ? entry.videoUrl : null);
  }
  return map;
})();

export function findVideo(name: string): string {
  return exactMatches.get(normalizeName(name)) || looseMatches.get(tokenKey(name)) || '';
}

/** A YouTube search for exercises without a verified video. */
export function videoSearchUrl(exercise: Pick<Exercise, 'name'>): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`Bob and Brad ${exercise.name}`)}`;
}

export function matchVideos(program: Program): Program {
  return {
    ...program,
    weeks: program.weeks.map((week) => ({
      ...week,
      exercises: week.exercises.map((exercise) => ({
        ...exercise,
        // A shared muscle group alone does not establish that a video
        // demonstrates this exercise. Match catalog movements by name.
        videoUrl: exercise.videoUrl || findVideo(exercise.name),
      })),
    })),
  };
}
