/**
 * Screening for "red flag" symptoms that should be assessed by a clinician
 * before starting a self-guided exercise program. This is intentionally
 * cautious: a false positive costs one extra click, a false negative could
 * delay care.
 */
export interface RedFlag {
  id: string;
  label: string;
}

const RULES: (RedFlag & { pattern: RegExp })[] = [
  {
    id: 'nerve',
    label: 'Numbness, tingling, or "pins and needles"',
    pattern: /\b(numb\w*|tingl\w*|pins and needles|loss of (feeling|sensation)|can'?t feel)\b/i,
  },
  {
    id: 'cauda-equina',
    label: 'Changes in bladder or bowel control, or numbness in the groin or saddle area',
    pattern: /\b(bladder|bowel|incontinen\w*|saddle|groin numb\w*|control (my )?(pee|urine|bowels?))\b/i,
  },
  {
    id: 'weakness',
    label: 'New or worsening weakness, or a limb giving way',
    pattern: /\b((sudden|new|progressive|getting|increasing)(ly)? weak\w*|foot drop|dropping things|(gives?|giving|gave) (way|out))\b/i,
  },
  {
    id: 'trauma',
    label: 'A recent fall, accident, or injury that may have caused a fracture or dislocation',
    pattern: /\b(fell (off|down|on|over|from)|a (bad )?fall|car (accident|crash)|accident|collision|fractur\w*|broken|broke (my|a)|dislocat\w*|(heard|felt) a (pop|snap|crack))\b/i,
  },
  {
    id: 'systemic',
    label: 'Fever, chills, night sweats, unexplained weight loss, or a history of cancer',
    pattern: /\b(fever|chills|night sweats|(unexplained|unintentional|sudden) weight loss|lost weight without|cancer|tumou?r)\b/i,
  },
  {
    id: 'night-pain',
    label: 'Constant pain, or pain that wakes you at night',
    pattern: /\b(worse at night|night pain|(pain|it) (that )?wakes? me|wakes? me up|constant (severe |unrelenting )?pain|unrelenting)\b/i,
  },
  {
    id: 'cardio-neuro',
    label: 'Chest pain, shortness of breath, dizziness, fainting, or vision or speech changes',
    pattern: /\b(chest (pain|tightness|pressure)|short(ness)? of breath|can'?t breathe|dizz\w*|faint\w*|black(ed)? out|vision (loss|changes?)|double vision|slurred|worst headache)\b/i,
  },
  {
    id: 'inflammation',
    label: 'A hot, red, swollen joint or a swollen calf',
    pattern: /\b((swollen|swelling)\W+(\w+\W+){0,6}(hot|warm|red)|(hot|warm|red)\W+(\w+\W+){0,6}(swollen|swelling)|calf\W+(\w+\W+){0,4}(swollen|swelling))/i,
  },
  {
    id: 'weight-bearing',
    label: 'Being unable to put weight on a limb, walk, or stand',
    pattern: /\b(can'?t|cannot|unable to) (put (any )?weight|bear weight|walk|stand)\b/i,
  },
  {
    id: 'sudden-severe',
    label: 'Sudden, severe, or unbearable pain',
    pattern: /\b((sudden(ly)?|out of nowhere)\W+(\w+\W+){0,4}(severe|intense|excruciating|agoni\w*)|excruciating|unbearable|agoni\w*)\b/i,
  },
];

export const SEVERE_PAIN_THRESHOLD = 8;

export function screenForRedFlags(description: string, painLevel?: number): RedFlag[] {
  const flags: RedFlag[] = RULES.filter((rule) => rule.pattern.test(description)).map(({ id, label }) => ({ id, label }));
  if (painLevel !== undefined && painLevel >= SEVERE_PAIN_THRESHOLD && !flags.some((flag) => flag.id === 'sudden-severe')) {
    flags.push({ id: 'severe-pain', label: `Pain rated ${painLevel}/10 or higher` });
  }
  return flags;
}

/** Thrown when the AI declines to build a program because of red-flag symptoms. */
export class SafetyStopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyStopError';
  }
}

/** In-session pain guidance. */
export const PAIN_STOP_THRESHOLD = 5;
export const PAIN_HIGH_THRESHOLD = 7;
