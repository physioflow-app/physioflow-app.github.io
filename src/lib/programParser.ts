import { Program, WeekProgram, Exercise } from '../types';

type ObjectValue = Record<string, unknown>;

function object(value: unknown): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The AI returned an invalid program. Please try again.');
  }
  return value as ObjectValue;
}

function text(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value !== 'string') throw new Error('The AI returned invalid text. Please try again.');
  return value.trim() || fallback;
}

function count(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error('The AI returned an invalid exercise count. Please try again.');
  }
  return value;
}

export function parseProgram(llmOutput: string): Program {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJSON(llmOutput));
  } catch {
    throw new Error('Failed to parse AI output as JSON. Please try again.');
  }
  const raw = object(parsed);
  if (!Array.isArray(raw.weeks) || raw.weeks.length === 0) {
    throw new Error('Program must contain at least one week of exercises.');
  }
  const programId = `ai-${crypto.randomUUID()}`;
  const weeks: WeekProgram[] = raw.weeks.map((value, weekIdx) => {
    const rawWeek = object(value);
    if (!Array.isArray(rawWeek.exercises) || rawWeek.exercises.length === 0) {
      throw new Error('Each week must contain at least one exercise. Please try again.');
    }
    const exercises: Exercise[] = rawWeek.exercises.map((value, exIdx) => {
      const rawEx = object(value);
      const name = text(rawEx.name);
      if (!name || !Array.isArray(rawEx.instructions) || rawEx.instructions.length === 0 ||
          rawEx.instructions.some((step) => typeof step !== 'string' || !step.trim())) {
        throw new Error('Each exercise must have a name and instruction steps. Please try again.');
      }
      return {
        id: `${programId}-w${weekIdx + 1}-e${exIdx}`,
        name,
        description: text(rawEx.description),
        instructions: rawEx.instructions.map((step: string) => step.trim()),
        sets: count(rawEx.sets),
        reps: count(rawEx.reps),
        duration: text(rawEx.duration) || undefined,
        videoUrl: '',
        difficulty: validateDifficulty(rawEx.difficulty),
        targetArea: text(rawEx.targetArea, 'General'),
      };
    });
    return {
      // Navigation and persisted progress use sequential, one-based weeks.
      week: weekIdx + 1,
      focus: text(rawWeek.focus, `Week ${weekIdx + 1}`),
      exercises,
    };
  });
  return {
    id: programId,
    bodyPart: text(raw.bodyPart, 'Custom'),
    bodyPartId: 'ai-custom',
    title: text(raw.title, 'AI-Generated Program'),
    description: text(raw.description, 'A personalized physical therapy program.'),
    duration: weeks.length,
    weeks,
    isAIGenerated: true,
    searchQuery: '',
    whyItExists: text(raw.whyItExists) || undefined,
    howExercisesHelp: text(raw.howExercisesHelp) || undefined,
  };
}

function extractJSON(value: string): string {
  let cleaned = value.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  return cleaned.trim();
}

function validateDifficulty(value: unknown): Exercise['difficulty'] {
  return value === 'intermediate' || value === 'advanced' ? value : 'beginner';
}
