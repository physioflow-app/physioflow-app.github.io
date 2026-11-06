import { useCallback } from 'react';
import { Program } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useAIPrograms() {
  // Keep the storage key and array format used by the deployed app.
  const [programs, setPrograms] = useLocalStorage<Program[]>('pt-ai-programs', []);

  const saveProgram = useCallback((program: Program) => {
    setPrograms((previous) => {
      if (!previous.some((saved) => saved.id === program.id)) return [program, ...previous];
      return previous.map((saved) => saved.id === program.id ? program : saved);
    });
  }, [setPrograms]);

  const deleteProgram = useCallback((id: string) => {
    setPrograms((previous) => previous.filter((program) => program.id !== id));
  }, [setPrograms]);

  return { programs, saveProgram, deleteProgram };
}
