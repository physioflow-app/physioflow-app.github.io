import { describe, expect, it } from 'vitest';
import { parseProgram } from '../../src/lib/programParser';
import { matchVideos } from '../../src/lib/videoMatcher';
import { getAllPrograms } from '../../src/data/exercises';

const exercise = { name: 'Glute Bridge', instructions: ['Lie down.', 'Lift your hips.'] };

describe('AI program validation and video matching', () => {
  it.each([
    null, [], {}, { weeks: [] }, { weeks: [null] }, { weeks: [{ exercises: [] }] },
    { weeks: [{ exercises: [{ ...exercise, name: { invalid: true } }] }] },
    { weeks: [{ exercises: [{ ...exercise, instructions: [{ step: 1 }] }] }] },
    { weeks: [{ exercises: [{ ...exercise, sets: -1 }] }] },
    { weeks: [{ exercises: [{ ...exercise, description: {} }] }] },
  ])('rejects invalid model output: %j', (value) => {
    expect(() => parseProgram(JSON.stringify(value))).toThrow();
  });

  it('normalizes week numbering and duration, and accepts fenced JSON', () => {
    const program = parseProgram('```json\n' + JSON.stringify({ duration: 9, weeks: [
      { week: 4, exercises: [exercise] }, { week: 4, exercises: [exercise] },
    ] }) + '\n```');
    expect(program.weeks.map((week) => week.week)).toEqual([1, 2]);
    expect(program.duration).toBe(2);
    expect(new Set(program.weeks.flatMap((week) => week.exercises.map((ex) => ex.id))).size).toBe(2);
  });

  it('matches singular/plural catalog names and leaves unknown movements without misleading videos', () => {
    const program = parseProgram(JSON.stringify({ weeks: [{ exercises: [exercise,
      { ...exercise, name: 'Unknown movement', targetArea: 'Glutes' },
    ] }] }));
    const matched = matchVideos(program);
    expect(matched.weeks[0].exercises[0].videoUrl).toMatch(/^https:\/\/www.youtube.com\/embed\//);
    expect(matched.weeks[0].exercises[1].videoUrl).toBe('');
    expect(program.weeks[0].exercises[0].videoUrl).toBe('');
  });
});

describe('predefined catalog integrity', () => {
  for (const program of getAllPrograms()) {
    it(`${program.id} has valid navigation, unique IDs, instructions, and YouTube links`, () => {
      expect(program.duration).toBe(program.weeks.length);
      expect(program.weeks.map((week) => week.week)).toEqual(program.weeks.map((_, index) => index + 1));
      const exercises = program.weeks.flatMap((week) => week.exercises);
      expect(new Set(exercises.map((ex) => ex.id)).size).toBe(exercises.length);
      for (const ex of exercises) {
        expect(ex.instructions.length).toBeGreaterThan(0);
        expect(ex.videoUrl).toMatch(/^https:\/\/www.youtube.com\/embed\/[\w-]{11}$/);
      }
    });
  }
});
