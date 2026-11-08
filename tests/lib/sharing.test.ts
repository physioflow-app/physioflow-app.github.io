import { describe, expect, it } from 'vitest';
import { createShareUrl, readSharedProgram } from '../../src/lib/share';
import { createBackup, mergeBackup, parseBackup } from '../../src/lib/backup';
import { parseProgram } from '../../src/lib/programParser';
import { matchVideos } from '../../src/lib/videoMatcher';

const program = matchVideos(parseProgram(JSON.stringify({
  title: 'Shared knees', sessionsPerWeek: 3,
  weeks: [{ focus: 'Start', exercises: [{ name: 'Heel Slides', instructions: ['Slide.'], sets: 2, reps: 10 }] }],
})));

describe('share links', () => {
  it('round-trips a program through a URL', async () => {
    const url = await createShareUrl(program, 'https://example.test');
    expect(url).toMatch(/^https:\/\/example\.test\/shared#p=z\./);
    const opened = await readSharedProgram(new URL(url).hash);
    expect(opened.id).toBe(program.id);
    expect(opened.title).toBe('Shared knees');
    expect(opened.sessionsPerWeek).toBe(3);
    expect(opened.weeks[0].exercises[0].videoUrl).toBe(program.weeks[0].exercises[0].videoUrl);
  });

  it('rejects damaged links', async () => {
    await expect(readSharedProgram('#p=z.abc')).rejects.toThrow('damaged');
    await expect(readSharedProgram('')).rejects.toThrow('incomplete');
  });
});

describe('backups', () => {
  const progress = { programs: { [program.id]: { programId: program.id, completedExercises: {}, currentWeek: 1, startedAt: 'a', lastUpdated: '2026-01-02', sessions: [] } } };

  it('round-trips programs and progress, keeping IDs', () => {
    const backup = parseBackup(JSON.stringify(createBackup([program], progress)));
    expect(backup.programs[0].id).toBe(program.id);
    expect(backup.programs[0].weeks[0].exercises[0].id).toBe(program.weeks[0].exercises[0].id);
    expect(backup.progress).toEqual(progress);
  });

  it('rejects other files', () => {
    expect(() => parseBackup('{"hello":1}')).toThrow('not a PhysioFlow backup');
    expect(() => parseBackup('nope')).toThrow('not a PhysioFlow backup');
  });

  it('merges without duplicating programs and keeps the newest progress', () => {
    const backup = parseBackup(JSON.stringify(createBackup([program], progress)));
    const older = { programs: { [program.id]: { ...progress.programs[program.id], lastUpdated: '2026-01-01', currentWeek: 3 } } };
    const merged = mergeBackup({ programs: [program], progress: older }, backup);
    expect(merged.added).toBe(0);
    expect(merged.programs).toHaveLength(1);
    expect(merged.progress.programs[program.id].currentWeek).toBe(1);
    expect(mergeBackup({ programs: [], progress: { programs: {} } }, backup).added).toBe(1);
  });
});
