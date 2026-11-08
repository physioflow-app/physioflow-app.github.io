import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../../src/hooks/useProgress';
import { Program } from '../../src/types';

const mockProgram: Program = {
  sessionsPerWeek: 2,
  id: 'test-program',
  bodyPart: 'Test',
  bodyPartId: 'test',
  title: 'Test Program',
  description: 'A test program',
  duration: 4,
  weeks: [
    {
      week: 1,
      focus: 'Test Week 1',
      exercises: [
        {
          id: 'ex-1',
          name: 'Exercise 1',
          description: 'Test exercise 1',
          instructions: ['Step 1', 'Step 2'],
          sets: 3,
          reps: 10,
          videoUrl: 'https://youtube.com/embed/test1',
          difficulty: 'beginner',
          targetArea: 'Test area',
        },
        {
          id: 'ex-2',
          name: 'Exercise 2',
          description: 'Test exercise 2',
          instructions: ['Step 1'],
          duration: '30 seconds',
          videoUrl: 'https://youtube.com/embed/test2',
          difficulty: 'intermediate',
          targetArea: 'Test area 2',
        },
      ],
    },
    {
      week: 2,
      focus: 'Test Week 2',
      exercises: [
        {
          id: 'ex-3',
          name: 'Exercise 3',
          description: 'Test exercise 3',
          instructions: ['Step 1'],
          sets: 2,
          reps: 15,
          videoUrl: 'https://youtube.com/embed/test3',
          difficulty: 'advanced',
          targetArea: 'Test area 3',
        },
      ],
    },
  ],
};

describe('useProgress', () => {
  const day1 = '2026-01-05';
  const day2 = '2026-01-06';

  it('starts with empty progress', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.userProgress.programs).toEqual({});
    expect(result.current.getTotalProgress(mockProgram.id, mockProgram)).toBe(0);
  });

  it('creates progress on start without overwriting existing progress', () => {
    const { result } = renderHook(() => useProgress());
    act(() => { result.current.startProgram(mockProgram); });
    expect(result.current.getProgress('test-program')?.currentWeek).toBe(1);
    act(() => { result.current.setCurrentWeek(mockProgram, 2); });
    act(() => { result.current.startProgram(mockProgram); });
    expect(result.current.getProgress('test-program')?.currentWeek).toBe(2);
  });

  it('logs exercises per day and toggles them off again', () => {
    const { result } = renderHook(() => useProgress());
    act(() => { result.current.toggleExercise(mockProgram, 'ex-1', 1, day1); });
    let progress = result.current.getProgress('test-program')!;
    expect(progress.sessions).toEqual([{ date: day1, week: 1, completed: ['ex-1'] }]);
    expect(progress.completedExercises['ex-1']).toBe(true);
    act(() => { result.current.toggleExercise(mockProgram, 'ex-1', 1, day1); });
    progress = result.current.getProgress('test-program')!;
    expect(progress.sessions).toEqual([]);
    expect(progress.completedExercises['ex-1']).toBe(false);
  });

  it('counts complete sessions toward the weekly target', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.toggleExercise(mockProgram, 'ex-1', 1, day1);
      result.current.toggleExercise(mockProgram, 'ex-2', 1, day1);
    });
    expect(result.current.getWeekProgress('test-program', mockProgram, 1)).toBe(50);
    // A partial session does not count.
    act(() => { result.current.toggleExercise(mockProgram, 'ex-1', 1, day2); });
    expect(result.current.getWeekProgress('test-program', mockProgram, 1)).toBe(50);
    act(() => { result.current.toggleExercise(mockProgram, 'ex-2', 1, day2); });
    expect(result.current.getWeekProgress('test-program', mockProgram, 1)).toBe(100);
    // 2 of 4 target sessions across both weeks.
    expect(result.current.getTotalProgress('test-program', mockProgram)).toBe(50);
  });

  it('records pain without needing completed exercises', () => {
    const { result } = renderHook(() => useProgress());
    act(() => { result.current.setPain(mockProgram, 1, 4, day1); });
    expect(result.current.getProgress('test-program')?.sessions).toEqual([{ date: day1, week: 1, completed: [], pain: 4 }]);
  });

  it('shares state between hook instances and persists it', () => {
    const first = renderHook(() => useProgress());
    const second = renderHook(() => useProgress());
    act(() => { first.result.current.setCurrentWeek(mockProgram, 2); });
    expect(second.result.current.getProgress('test-program')?.currentWeek).toBe(2);
    expect(JSON.parse(localStorage.getItem('pt-progress')!).programs['test-program'].currentWeek).toBe(2);
  });

  it('migrates progress saved before daily sessions existed', () => {
    localStorage.setItem('pt-progress', JSON.stringify({ programs: { 'test-program': {
      programId: 'test-program', completedExercises: { 'ex-1': true, 'ex-2': true }, currentWeek: 1,
      startedAt: '2026-01-01T10:00:00.000Z', lastUpdated: '2026-01-02T10:00:00.000Z',
    } } }));
    const { result } = renderHook(() => useProgress());
    expect(result.current.getWeekProgress('test-program', mockProgram, 1)).toBe(50);
    act(() => { result.current.toggleExercise(mockProgram, 'ex-3', 2, day1); });
    expect(result.current.getProgress('test-program')?.sessions).toHaveLength(2);
  });

  it('resets progress', () => {
    const { result } = renderHook(() => useProgress());
    act(() => { result.current.toggleExercise(mockProgram, 'ex-1', 1, day1); });
    act(() => { result.current.resetProgress('test-program'); });
    expect(result.current.getProgress('test-program')).toBeUndefined();
  });
});
