import { Equipment, IntakeDetails } from '../types';
import { catalogForPrompt } from './exerciseCatalog';

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export interface PromptOptions {
  /** The user confirmed a clinician has assessed them and cleared them to exercise. */
  clearedByClinician?: boolean;
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'No equipment',
  band: 'Resistance band',
  dumbbells: 'Dumbbells',
  'foam-roller': 'Foam roller',
  step: 'Step or stairs',
  ball: 'Exercise ball',
};

const DURATION_LABELS = {
  days: 'a few days',
  weeks: 'a few weeks',
  months: '1-3 months',
  'long-term': 'more than 3 months',
} as const;

function exercisesPerWeek(minutes?: number): string {
  if (!minutes) return '3-4';
  if (minutes <= 10) return '2-3';
  if (minutes <= 20) return '3-4';
  return '4-5';
}

export function describeDetails(details: IntakeDetails = {}): string[] {
  const lines: string[] = [];
  if (details.painLevel !== undefined) lines.push(`Current pain: ${details.painLevel}/10`);
  if (details.issueDuration) lines.push(`Has had this issue for: ${DURATION_LABELS[details.issueDuration]}`);
  if (details.fitnessLevel) lines.push(`Fitness level: ${details.fitnessLevel}`);
  if (details.minutesPerDay) lines.push(`Time available: about ${details.minutesPerDay} minutes per session`);
  if (details.equipment?.length) {
    const kit = details.equipment.filter((item) => item !== 'none').map((item) => EQUIPMENT_LABELS[item]);
    lines.push(`Equipment available: ${kit.length ? `bodyweight, ${kit.join(', ')}` : 'bodyweight only'}`);
  }
  return lines;
}

export function buildPrompt(userDescription: string, details: IntakeDetails = {}, options: PromptOptions = {}): ChatMessage[] {
  const systemPrompt = `You are a physical therapy program generator. Given a patient's description of their issue, create a structured exercise program as JSON.

SAFETY FIRST: If the description suggests a condition that needs medical assessment before exercise — for example numbness or tingling, changes in bladder or bowel control, saddle numbness, new or progressive weakness, a recent fall or trauma with possible fracture, fever or unexplained weight loss, a history of cancer, constant or night pain, chest pain, shortness of breath, dizziness, a hot red swollen joint or swollen calf, inability to bear weight, or sudden severe pain — and the patient has NOT said a clinician has cleared them, output ONLY:
{"redFlag": true, "reason": "string (1-2 plain-language sentences: which symptom is concerning and what kind of care to seek, e.g. a doctor, physical therapist, or urgent care)"}

Otherwise, output ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "bodyPart": "string (affected body area)",
  "title": "string (program title)",
  "description": "string (1-2 sentence program overview)",
  "whyItExists": "string (2-3 sentences explaining WHY this issue commonly develops — e.g. muscle imbalances, postural habits, overuse patterns, sedentary lifestyle factors. Be specific and educational.)",
  "howExercisesHelp": "string (2-3 sentences explaining HOW the prescribed exercises will address the root cause — e.g. which muscles they strengthen/stretch, how mobility improves, what the progression achieves. Be encouraging and clear.)",
  "duration": number (3 or 4),
  "sessionsPerWeek": number (3 to 6, how many days per week to do the routine),
  "weeks": [
    {
      "week": number,
      "focus": "string (week's focus area)",
      "exercises": [
        {
          "name": "string (exercise name)",
          "description": "string (brief description)",
          "instructions": ["string (step 1)", "string (step 2)", ...],
          "sets": number or null,
          "reps": number or null,
          "duration": "string or null (e.g. '30 seconds')",
          "difficulty": "beginner" | "intermediate" | "advanced",
          "targetArea": "string (target muscle/area)"
        }
      ]
    }
  ]
}

EXERCISE CATALOG (these have video demonstrations):
${catalogForPrompt()}

Rules:
- Create 3-4 weeks of progressive exercises
- Each week should have ${exercisesPerWeek(details.minutesPerDay)} exercises, sized to fit the patient's available time
- IMPORTANT: Copy exercise names from the catalog EXACTLY, character for character. Only invent an exercise when nothing in the catalog fits
- CRITICAL: Every exercise name must be unique across the entire program — do NOT repeat any exercise in different weeks
- Week 1 should be beginner/gentle, progressing to more challenging; match the starting difficulty to the patient's fitness level and pain
- Only use exercises the patient can do with the equipment they have (bodyweight is always available)
- Use real physical therapy exercises (stretches, strengthening, mobility)
- Each exercise needs 3-5 clear instruction steps
- Include either sets+reps OR duration for each exercise, not both
- Output ONLY the JSON object, nothing else`;

  const context = describeDetails(details);
  if (options.clearedByClinician) context.push('A clinician has assessed the patient and cleared them for exercise.');
  const userMessage = `Create a physical therapy program for: ${userDescription}`
    + (context.length ? `\n\nPatient details:\n${context.map((line) => `- ${line}`).join('\n')}` : '');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
}
