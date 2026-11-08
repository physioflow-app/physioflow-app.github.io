import { Program, Progress, SessionLog } from '../types';

export const DEFAULT_SESSIONS_PER_WEEK = 4;

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  return dateKey(new Date(year, month - 1, day + days));
}

export function sessionsPerWeek(program: Program): number {
  const target = program.sessionsPerWeek;
  return target && Number.isInteger(target) && target >= 1 && target <= 7 ? target : DEFAULT_SESSIONS_PER_WEEK;
}

/**
 * Session history for a program. Progress saved before daily sessions existed
 * only recorded "completed at least once", which is treated as one session
 * per week on the day of the last update.
 */
export function getSessions(progress: Progress | undefined, program: Program): SessionLog[] {
  if (!progress) return [];
  if (progress.sessions) return progress.sessions;
  const legacyDate = dateKey(new Date(progress.lastUpdated));
  return program.weeks.flatMap((week) => {
    const completed = week.exercises.filter((exercise) => progress.completedExercises[exercise.id]).map((exercise) => exercise.id);
    return completed.length ? [{ date: legacyDate, week: week.week, completed }] : [];
  });
}

export function findSession(sessions: SessionLog[], date: string, week: number): SessionLog | undefined {
  return sessions.find((session) => session.date === date && session.week === week);
}

export function isSessionComplete(session: SessionLog, program: Program): boolean {
  const week = program.weeks.find((candidate) => candidate.week === session.week);
  if (!week || week.exercises.length === 0) return false;
  return week.exercises.every((exercise) => session.completed.includes(exercise.id));
}

export function completedSessionCount(sessions: SessionLog[], program: Program, week: number): number {
  return sessions.filter((session) => session.week === week && isSessionComplete(session, program)).length;
}

export function weekPercent(sessions: SessionLog[], program: Program, week: number): number {
  const target = sessionsPerWeek(program);
  return Math.round((Math.min(completedSessionCount(sessions, program, week), target) / target) * 100);
}

export function totalPercent(sessions: SessionLog[], program: Program): number {
  const target = sessionsPerWeek(program);
  if (program.weeks.length === 0) return 0;
  const done = program.weeks.reduce(
    (sum, week) => sum + Math.min(completedSessionCount(sessions, program, week.week), target), 0,
  );
  return Math.round((done / (target * program.weeks.length)) * 100);
}

/** Consecutive days, ending today or yesterday, with at least one exercise completed. */
export function currentStreak(sessions: SessionLog[], today: string = dateKey()): number {
  const active = new Set(sessions.filter((session) => session.completed.length > 0).map((session) => session.date));
  let day = active.has(today) ? today : shiftDays(today, -1);
  let streak = 0;
  while (active.has(day)) {
    streak += 1;
    day = shiftDays(day, -1);
  }
  return streak;
}

/** Pain scores by date (latest score per day), oldest first. */
export function painHistory(sessions: SessionLog[]): { date: string; pain: number }[] {
  const byDate = new Map<string, number>();
  for (const session of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    if (session.pain !== undefined) byDate.set(session.date, session.pain);
  }
  return [...byDate].map(([date, pain]) => ({ date, pain }));
}

export type PainTrend = 'improving' | 'steady' | 'worsening' | 'unknown';

export function painTrend(history: { pain: number }[]): PainTrend {
  if (history.length < 2) return 'unknown';
  const recent = history.slice(-3);
  const first = recent[0].pain;
  const last = recent[recent.length - 1].pain;
  const rising = recent.every((entry, index) => index === 0 || entry.pain > recent[index - 1].pain);
  if ((recent.length >= 3 && rising) || last - first >= 2) return 'worsening';
  if (first - last >= 2 || (history[0].pain - last >= 2)) return 'improving';
  return 'steady';
}

/** The week the user should be on once the target for the current week is met. */
export function nextWeekIfComplete(sessions: SessionLog[], program: Program, currentWeek: number, today: string = dateKey()): number | null {
  if (currentWeek >= program.weeks.length) return null;
  if (completedSessionCount(sessions, program, currentWeek) < sessionsPerWeek(program)) return null;
  // Do not move the user mid-session: only advance on a day they have not started yet.
  const todays = findSession(sessions, today, currentWeek);
  if (todays && todays.completed.length > 0) return null;
  return currentWeek + 1;
}
