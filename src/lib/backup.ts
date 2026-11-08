import { Program, UserProgress } from '../types';
import { parseProgram } from './programParser';

export interface Backup {
  app: 'physioflow';
  version: 1;
  exportedAt: string;
  programs: Program[];
  progress: UserProgress;
}

export function createBackup(programs: Program[], progress: UserProgress): Backup {
  return { app: 'physioflow', version: 1, exportedAt: new Date().toISOString(), programs, progress };
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Validates a backup file, keeping each program's ID so its progress stays attached. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not a PhysioFlow backup.');
  }
  const value = raw as Partial<Backup> | null;
  if (!value || value.app !== 'physioflow' || value.version !== 1 || !Array.isArray(value.programs)) {
    throw new Error('That file is not a PhysioFlow backup.');
  }
  const programs = value.programs.map((program) => {
    const parsed = parseProgram(JSON.stringify(program), { id: program?.id });
    // Keep the saved exercise IDs and videos, which progress refers to.
    return { ...parsed, weeks: program.weeks, searchQuery: program.searchQuery, createdAt: program.createdAt };
  });
  const progress = value.progress && typeof value.progress === 'object' && value.progress.programs && typeof value.progress.programs === 'object'
    ? value.progress
    : { programs: {} };
  return { app: 'physioflow', version: 1, exportedAt: value.exportedAt ?? '', programs, progress };
}

/** Merges a backup into existing data. Existing items win on conflicts unless the backup is newer. */
export function mergeBackup(current: { programs: Program[]; progress: UserProgress }, backup: Backup) {
  const ids = new Set(current.programs.map((program) => program.id));
  const programs = [...current.programs, ...backup.programs.filter((program) => !ids.has(program.id))];
  const merged = { ...current.progress.programs };
  for (const [id, incoming] of Object.entries(backup.progress.programs)) {
    const existing = merged[id];
    if (!existing || (incoming.lastUpdated ?? '') > (existing.lastUpdated ?? '')) merged[id] = incoming;
  }
  return { programs, progress: { ...current.progress, programs: merged }, added: programs.length - current.programs.length };
}
