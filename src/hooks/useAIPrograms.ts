import { useCallback } from 'react';
import { Program } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useProgress } from './useProgress';

export const PROGRAMS_STORAGE_KEY = 'pt-ai-programs';
const EMPTY: Program[] = [];

export function useAIPrograms() {
  // Keep the storage key and array format used by the deployed app.
  const [programs, setPrograms] = useLocalStorage<Program[]>(PROGRAMS_STORAGE_KEY, EMPTY);
  const { resetProgress } = useProgress();

  const saveProgram = useCallback((program: Program) => {
    setPrograms((previous) => {
      if (!previous.some((saved) => saved.id === program.id)) return [program, ...previous];
      return previous.map((saved) => saved.id === program.id ? program : saved);
    });
  }, [setPrograms]);

  /** Deletes a program and its progress, so no orphaned data is left behind. */
  const deleteProgram = useCallback((id: string) => {
    setPrograms((previous) => previous.filter((program) => program.id !== id));
    resetProgress(id);
  }, [setPrograms, resetProgress]);

  const getProgram = useCallback((id: string) => programs.find((program) => program.id === id), [programs]);

  return { programs, saveProgram, deleteProgram, getProgram };
}
