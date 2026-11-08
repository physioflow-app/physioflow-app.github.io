import React from 'react';
import { WeekProgram } from '../../types';
import { ExerciseCard } from './ExerciseCard';
import { brand, fonts } from '../../theme';

interface WeekViewProps {
  week: WeekProgram;
  /** Exercises completed in today's session. */
  completedToday: string[];
  sessionsDone: number;
  sessionsTarget: number;
  onToggleExercise: (exerciseId: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ week, completedToday, sessionsDone, sessionsTarget, onToggleExercise }) => {
  const percent = Math.round((Math.min(sessionsDone, sessionsTarget) / sessionsTarget) * 100);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span aria-hidden="true" style={{
              width: 40, height: 40, borderRadius: 12,
              background: brand.forest, color: brand.mint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, fontFamily: fonts.body,
            }}>
              {week.week}
            </span>
            <h2 style={{ fontFamily: fonts.display, fontSize: 20, color: brand.forest, margin: 0 }}>
              Week {week.week}
            </h2>
          </div>
          <span style={{ fontSize: 12, color: brand.stone }}>
            {Math.min(sessionsDone, sessionsTarget)}/{sessionsTarget} sessions this week
          </span>
        </div>
        <p style={{ fontSize: 13, color: brand.stone, margin: '4px 0 12px' }}>{week.focus}</p>
        <div
          role="progressbar"
          aria-label={`Week ${week.week} sessions`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: '100%', height: 6, borderRadius: 100, background: brand.warm }}
        >
          <div style={{
            width: `${percent}%`, height: 6, borderRadius: 100,
            background: percent === 100 ? brand.sage : brand.terracotta,
            transition: 'width 0.5s ease-out',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {week.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={completedToday.includes(exercise.id)}
            onToggleComplete={() => onToggleExercise(exercise.id)}
          />
        ))}
      </div>
    </div>
  );
};
