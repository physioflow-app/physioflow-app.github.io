import { describe, expect, it } from 'vitest';
import {
  currentStreak, dateKey, getSessions, nextWeekIfComplete, painHistory, painTrend, sessionsPerWeek, totalPercent, weekPercent,
} from '../../src/lib/sessions';
import { Program, SessionLog } from '../../src/types';

const exercise = (id: string) => ({ id, name: id, description: '', instructions: ['x'], videoUrl: '', difficulty: 'beginner' as const, targetArea: '' });
const program: Program = {
  id: 'p', bodyPart: 'Knees', bodyPartId: 'knees', title: 'P', description: '', duration: 2, sessionsPerWeek: 2,
  weeks: [{ week: 1, focus: '', exercises: [exercise('a'), exercise('b')] }, { week: 2, focus: '', exercises: [exercise('c')] }],
};
const full = (date: string, week = 1): SessionLog => ({ date, week, completed: week === 1 ? ['a', 'b'] : ['c'] });

describe('session logic', () => {
  it('formats local dates', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('falls back to the default target for missing or invalid values', () => {
    expect(sessionsPerWeek(program)).toBe(2);
    expect(sessionsPerWeek({ ...program, sessionsPerWeek: undefined })).toBe(4);
    expect(sessionsPerWeek({ ...program, sessionsPerWeek: 12 })).toBe(4);
  });

  it('caps weekly progress at the target', () => {
    const sessions = [full('2026-01-01'), full('2026-01-02'), full('2026-01-03'), { date: '2026-01-04', week: 1, completed: ['a'] }];
    expect(weekPercent(sessions, program, 1)).toBe(100);
    expect(totalPercent(sessions, program)).toBe(50);
  });

  it('counts streaks ending today or yesterday', () => {
    const sessions = [full('2026-01-03'), full('2026-01-04'), { date: '2026-01-05', week: 1, completed: ['a'] }];
    expect(currentStreak(sessions, '2026-01-05')).toBe(3);
    expect(currentStreak(sessions, '2026-01-06')).toBe(3);
    expect(currentStreak(sessions, '2026-01-07')).toBe(0);
    expect(currentStreak([{ date: '2026-01-05', week: 1, completed: [], pain: 3 }], '2026-01-05')).toBe(0);
  });

  it('detects pain trends', () => {
    expect(painTrend([{ pain: 3 }])).toBe('unknown');
    expect(painTrend([{ pain: 2 }, { pain: 3 }, { pain: 4 }])).toBe('worsening');
    expect(painTrend([{ pain: 6 }, { pain: 5 }, { pain: 3 }])).toBe('improving');
    expect(painTrend([{ pain: 3 }, { pain: 4 }, { pain: 3 }])).toBe('steady');
    expect(painHistory([{ date: '2026-01-02', week: 1, completed: [], pain: 4 }, { date: '2026-01-01', week: 1, completed: [], pain: 6 }]))
      .toEqual([{ date: '2026-01-01', pain: 6 }, { date: '2026-01-02', pain: 4 }]);
  });

  it('advances only on a fresh day after the weekly target is met', () => {
    const sessions = [full('2026-01-01'), full('2026-01-02')];
    expect(nextWeekIfComplete(sessions, program, 1, '2026-01-02')).toBeNull();
    expect(nextWeekIfComplete(sessions, program, 1, '2026-01-03')).toBe(2);
    expect(nextWeekIfComplete(sessions, program, 2, '2026-01-03')).toBeNull();
    expect(nextWeekIfComplete([full('2026-01-01')], program, 1, '2026-01-03')).toBeNull();
  });

  it('converts legacy completion flags into sessions', () => {
    const legacy = { programId: 'p', completedExercises: { a: true, b: true, c: false }, currentWeek: 1, startedAt: '', lastUpdated: new Date(2026, 0, 2, 12).toISOString() };
    expect(getSessions(legacy, program)).toEqual([{ date: '2026-01-02', week: 1, completed: ['a', 'b'] }]);
  });
});
