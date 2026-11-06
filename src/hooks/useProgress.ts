import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Progress, UserProgress, Program } from '../types';

const STORAGE_KEY = 'pt-progress';

export function useProgress() {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(STORAGE_KEY, {
    programs: {},
  });

  const getProgress = (programId: string): Progress | undefined => {
    return userProgress.programs[programId];
  };

  const startProgram = useCallback((program: Program): Progress => {
    const progress: Progress = {
      programId: program.id,
      completedExercises: {},
      currentWeek: 1,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setUserProgress((prev) => ({
      ...prev,
      programs: {
        ...prev.programs,
        [program.id]: progress,
      },
    }));

    return progress;
  }, [setUserProgress]);

  const toggleExercise = (programId: string, exerciseId: string): void => {
    setUserProgress((prev) => {
      const programProgress = prev.programs[programId];
      if (!programProgress) return prev;

      const isCompleted = !programProgress.completedExercises[exerciseId];

      return {
        ...prev,
        programs: {
          ...prev.programs,
          [programId]: {
            ...programProgress,
            completedExercises: {
              ...programProgress.completedExercises,
              [exerciseId]: isCompleted,
            },
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    });
  };

  const setCurrentWeek = (programId: string, week: number): void => {
    setUserProgress((prev) => {
      const programProgress = prev.programs[programId];
      if (!programProgress) return prev;

      return {
        ...prev,
        programs: {
          ...prev.programs,
          [programId]: {
            ...programProgress,
            currentWeek: week,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    });
  };

  const resetProgress = (programId: string): void => {
    setUserProgress((prev) => {
      const { [programId]: _, ...remainingPrograms } = prev.programs;
      return {
        ...prev,
        programs: remainingPrograms,
      };
    });
  };

  const getWeekProgress = (programId: string, program: Program, week: number): number => {
    const progress = userProgress.programs[programId];
    if (!progress) return 0;

    const weekProgram = program.weeks.find((w) => w.week === week);
    if (!weekProgram) return 0;

    const totalExercises = weekProgram.exercises.length;
    const completedCount = weekProgram.exercises.filter(
      (ex) => progress.completedExercises[ex.id]
    ).length;

    return totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  };

  const getTotalProgress = (programId: string, program: Program): number => {
    const progress = userProgress.programs[programId];
    if (!progress) return 0;

    const totalExercises = program.weeks.reduce(
      (sum, week) => sum + week.exercises.length,
      0
    );
    const completedCount = Object.values(progress.completedExercises).filter(Boolean).length;

    return totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  };

  return {
    userProgress,
    getProgress,
    startProgram,
    toggleExercise,
    setCurrentWeek,
    resetProgress,
    getWeekProgress,
    getTotalProgress,
  };
}
