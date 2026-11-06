import { getAllPrograms } from '../data/exercises';
import { Program } from '../types';

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/s\b/g, '').replace(/\s+/g, ' ').trim();
}

const videoCatalog = new Map(
  getAllPrograms().flatMap((program) => program.weeks.flatMap((week) =>
    week.exercises.filter((exercise) => exercise.videoUrl).map((exercise) =>
      [normalizeName(exercise.name), exercise.videoUrl] as const
    )
  ))
);

export function matchVideos(program: Program): Program {
  return {
    ...program,
    weeks: program.weeks.map((week) => ({
      ...week,
      exercises: week.exercises.map((exercise) => ({
        ...exercise,
        // A shared muscle group alone does not establish that a video
        // demonstrates this exercise. Match catalog movements by name.
        videoUrl: exercise.videoUrl || videoCatalog.get(normalizeName(exercise.name)) || '',
      })),
    })),
  };
}
