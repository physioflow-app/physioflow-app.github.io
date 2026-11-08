export interface BodyPart {
  id: string;
  name: string;
  region: 'front' | 'back';
  description: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  sets?: number;
  reps?: number;
  duration?: string;
  videoUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetArea: string;
}

export interface WeekProgram {
  week: number;
  focus: string;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  bodyPart: string;
  bodyPartId: string;
  title: string;
  description: string;
  duration: number; // weeks
  weeks: WeekProgram[];
  /** Target number of sessions per week (defaults to DEFAULT_SESSIONS_PER_WEEK). */
  sessionsPerWeek?: number;
  isAIGenerated?: boolean;
  searchQuery?: string;
  whyItExists?: string;
  howExercisesHelp?: string;
  createdAt?: string;
}

/** One day of training on a program. */
export interface SessionLog {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Program week the session belonged to. */
  week: number;
  /** IDs of exercises completed that day. */
  completed: string[];
  /** Self-reported pain, 0 (none) to 10 (worst). */
  pain?: number;
}

export interface Progress {
  programId: string;
  /**
   * Exercises completed at least once. Kept for backwards compatibility with
   * progress saved before daily sessions existed.
   */
  completedExercises: Record<string, boolean>;
  currentWeek: number;
  startedAt: string;
  lastUpdated: string;
  sessions?: SessionLog[];
}

export interface UserProgress {
  programs: Record<string, Progress>; // programId -> Progress
}

export type Equipment = 'none' | 'band' | 'dumbbells' | 'foam-roller' | 'step' | 'ball';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type IssueDuration = 'days' | 'weeks' | 'months' | 'long-term';

/** Optional structured details that refine the free-text description. */
export interface IntakeDetails {
  equipment?: Equipment[];
  minutesPerDay?: number;
  fitnessLevel?: FitnessLevel;
  painLevel?: number;
  issueDuration?: IssueDuration;
}
