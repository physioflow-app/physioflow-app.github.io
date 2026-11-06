interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

// Exercises grouped by body area that have verified video demonstrations.
// Gemini should strongly prefer picking from these so video matching works well.
const EXERCISE_CATALOG = `
NECK: Chin Tucks, Neck Flexion Stretch, Neck Rotation Stretch, Isometric Neck Exercises, Levator Scapulae Stretch, Upper Trapezius Stretch, Side Neck Flexion, Deep Neck Flexor Hold
SHOULDERS: Pendulum Exercises, Wall Slides, Wall Angels, Cross-Body Shoulder Stretch, External Rotation Stretch, Internal Rotation with Band, Side-Lying External Rotation, Shoulder I-Y-T-W Series, Scapular Squeezes, Passive Shoulder Flexion, Sleeper Stretch
CHEST: Doorway Pec Stretch, Corner Pec Stretch, Chest Opener Stretch, Wall Push-Ups, Knee Push-Ups, Incline Push-Ups, Standard Push-Ups, Resistance Band Chest Press
UPPER BACK: Thread the Needle, Thoracic Extension on Foam Roller, Quadruped Thoracic Rotation, Prone Y Raises, Prone T Raises, Prone W Raises, IYT Raises, Face Pulls with Band, Resistance Band Rows
ARMS: Arm Circles, Bicep Curls with Band, Tricep Extensions with Band, Wrist Circles, Forearm Flexor Stretch, Bicep Stretch, Tricep Stretch, Hammer Curls
CORE/ABS: Diaphragmatic Breathing, Pelvic Tilts, Abdominal Bracing, Dead Bug, Partial Curl-Up, Modified Plank, Full Plank, Side Plank (Modified), Bird Dog, Bicycle Crunches, Russian Twists
LOWER BACK: Cat-Cow Stretch, Knee to Chest Stretch, Child's Pose, Supine Twist, Superman Hold, McGill Big 3 - Curl Up, Hip Hinge Practice, Good Mornings
HIPS: Hip Flexor Stretch, Piriformis Stretch, Figure Four Stretch, 90-90 Hip Stretch, Hip Circles, Standing Hip Flexion, Adductor Stretch, Hip Airplanes, Lateral Lunges
GLUTES: Glute Bridge, Glute Squeeze, Clamshells, Banded Clamshells, Fire Hydrants, Lateral Band Walks, Monster Walks, Hip Thrust, Single Leg Glute Bridge, Standing Glute Kickback
QUADRICEPS: Standing Quad Stretch, Quad Sets, Straight Leg Raise, Seated Knee Extension, Wall Sit, Terminal Knee Extension, Spanish Squat, Mini Squats, Single Leg Wall Sit
HAMSTRINGS: Standing Hamstring Stretch, Lying Hamstring Stretch, Seated Hamstring Stretch, Prone Hamstring Curl, Romanian Deadlift, Nordic Hamstring Curl (Assisted), Slider Hamstring Curl
KNEES: Heel Slides, Short Arc Quads, Step-Ups - Low Step, Step Downs, Wall Squat with Ball Squeeze, Forward Lunge, Reverse Lunge, Goblet Squat, Bulgarian Split Squat
ANKLES/FEET: Ankle Alphabet, Ankle Circles, Towel Scrunches, Plantar Fascia Release, Ankle Dorsiflexion Stretch, Resistance Band Dorsiflexion, Band Inversion/Eversion, Heel Walks
CALVES/SHINS: Calf Stretch, Standing Calf Raises, Seated Calf Raises, Eccentric Calf Lowering, Toe Raises, Heel Walks, Single Leg Calf Raise, Soleus Stretch, Tibialis Raises on Step
`.trim();

export function buildPrompt(userDescription: string): ChatMessage[] {
  const systemPrompt = `You are a physical therapy program generator. Given a patient's description of their issue, create a structured exercise program as JSON.

Output ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "bodyPart": "string (affected body area)",
  "title": "string (program title)",
  "description": "string (1-2 sentence program overview)",
  "whyItExists": "string (2-3 sentences explaining WHY this issue commonly develops — e.g. muscle imbalances, postural habits, overuse patterns, sedentary lifestyle factors. Be specific and educational.)",
  "howExercisesHelp": "string (2-3 sentences explaining HOW the prescribed exercises will address the root cause — e.g. which muscles they strengthen/stretch, how mobility improves, what the progression achieves. Be encouraging and clear.)",
  "duration": number (3 or 4),
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

EXERCISE CATALOG (prefer these exact names — matching video demonstrations are included when available):
${EXERCISE_CATALOG}

Rules:
- Create 3-4 weeks of progressive exercises
- Each week should have 3-4 exercises
- CRITICAL: Every exercise name must be unique across the entire program — do NOT repeat any exercise in different weeks
- Week 1 should be beginner/gentle, progressing to more challenging
- Use real physical therapy exercises (stretches, strengthening, mobility)
- Strongly prefer exercises from the catalog above, using the exact names listed
- Each exercise needs 3-5 clear instruction steps
- Include either sets+reps OR duration for each exercise, not both
- Output ONLY the JSON object, nothing else`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Create a physical therapy program for: ${userDescription}` },
  ];
}
