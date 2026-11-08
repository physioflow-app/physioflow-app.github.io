import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Progress, UserProgress, Program, SessionLog } from '../types';
import { dateKey, getSessions, totalPercent, weekPercent } from '../lib/sessions';

export const PROGRESS_STORAGE_KEY = 'pt-progress';
const EMPTY: UserProgress = { programs: {} };

function newProgress(programId: string): Progress {
  const now = new Date().toISOString();
  return { programId, completedExercises: {}, currentWeek: 1, startedAt: now, lastUpdated: now, sessions: [] };
}

export function useProgress() {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(PROGRESS_STORAGE_KEY, EMPTY);

  const getProgress = useCallback((programId: string): Progress | undefined => userProgress.programs[programId], [userProgress]);

  const updateProgram = useCallback((program: Program, update: (progress: Progress) => Progress) => {
    setUserProgress((prev) => {
      const current = prev.programs[program.id] ?? newProgress(program.id);
      // Migrate legacy progress to session logs on first write.
      const migrated = current.sessions ? current : { ...current, sessions: getSessions(current, program) };
      return {
        ...prev,
        programs: { ...prev.programs, [program.id]: { ...update(migrated), lastUpdated: new Date().toISOString() } },
      };
    });
  }, [setUserProgress]);

  const startProgram = useCallback((program: Program): Progress => {
    const progress = newProgress(program.id);
    setUserProgress((prev) => prev.programs[program.id]
      ? prev
      : { ...prev, programs: { ...prev.programs, [program.id]: progress } });
    return progress;
  }, [setUserProgress]);

  const updateSession = useCallback((program: Program, week: number, date: string, update: (session: SessionLog) => SessionLog) => {
    updateProgram(program, (progress) => {
      const sessions = progress.sessions ?? [];
      const existing = sessions.find((session) => session.date === date && session.week === week);
      const next = update(existing ?? { date, week, completed: [] });
      const rest = sessions.filter((session) => session !== existing);
      const keep = next.completed.length > 0 || next.pain !== undefined;
      return { ...progress, sessions: keep ? [...rest, next] : rest };
    });
  }, [updateProgram]);

  /** Toggle an exercise in the session for `date` (today by default). */
  const toggleExercise = useCallback((program: Program, exerciseId: string, week: number, date: string = dateKey()) => {
    updateSession(program, week, date, (session) => {
      const done = session.completed.includes(exerciseId);
      return { ...session, completed: done ? session.completed.filter((id) => id !== exerciseId) : [...session.completed, exerciseId] };
    });
    updateProgram(program, (progress) => ({
      ...progress,
      completedExercises: {
        ...progress.completedExercises,
        [exerciseId]: (progress.sessions ?? []).some((session) => session.completed.includes(exerciseId)),
      },
    }));
  }, [updateSession, updateProgram]);

  const setPain = useCallback((program: Program, week: number, pain: number, date: string = dateKey()) => {
    updateSession(program, week, date, (session) => ({ ...session, pain }));
  }, [updateSession]);

  const setCurrentWeek = useCallback((program: Program, week: number) => {
    updateProgram(program, (progress) => ({ ...progress, currentWeek: week }));
  }, [updateProgram]);

  const resetProgress = useCallback((programId: string) => {
    setUserProgress((prev) => {
      const { [programId]: _removed, ...programs } = prev.programs;
      return { ...prev, programs };
    });
  }, [setUserProgress]);

  const getWeekProgress = useCallback((programId: string, program: Program, week: number) =>
    weekPercent(getSessions(userProgress.programs[programId], program), program, week), [userProgress]);

  const getTotalProgress = useCallback((programId: string, program: Program) =>
    totalPercent(getSessions(userProgress.programs[programId], program), program), [userProgress]);

  return {
    userProgress,
    getProgress,
    startProgram,
    toggleExercise,
    setPain,
    setCurrentWeek,
    resetProgress,
    getWeekProgress,
    getTotalProgress,
  };
}
