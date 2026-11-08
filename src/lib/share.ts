import { Program } from '../types';
import { decodeJson, encodeJson } from './encoding';
import { parseProgram } from './programParser';
import { matchVideos } from './videoMatcher';

/** Only the content needed to rebuild a program; IDs and videos are recreated on open. */
function shareable(program: Program) {
  return {
    id: program.id,
    bodyPart: program.bodyPart,
    title: program.title,
    description: program.description,
    whyItExists: program.whyItExists,
    howExercisesHelp: program.howExercisesHelp,
    sessionsPerWeek: program.sessionsPerWeek,
    weeks: program.weeks.map((week) => ({
      focus: week.focus,
      exercises: week.exercises.map(({ name, description, instructions, sets, reps, duration, difficulty, targetArea }) =>
        ({ name, description, instructions, sets, reps, duration, difficulty, targetArea })),
    })),
  };
}

export const SHARE_PATH = '/shared';

export async function createShareUrl(program: Program, origin: string = window.location.origin): Promise<string> {
  return `${origin}${SHARE_PATH}#p=${await encodeJson(shareable(program))}`;
}

/** Rebuilds and validates a program from the `#p=` fragment of a share link. */
export async function readSharedProgram(hash: string): Promise<Program> {
  const encoded = new URLSearchParams(hash.replace(/^#/, '')).get('p');
  if (!encoded) throw new Error('This share link is incomplete.');
  let raw: unknown;
  try {
    raw = await decodeJson(encoded);
  } catch {
    throw new Error('This share link is damaged or incomplete.');
  }
  const id = raw && typeof raw === 'object' && 'id' in raw && typeof raw.id === 'string' ? raw.id : undefined;
  const program = matchVideos(parseProgram(JSON.stringify(raw), { id }));
  return { ...program, createdAt: new Date().toISOString() };
}
