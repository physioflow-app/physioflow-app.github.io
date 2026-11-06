import React from 'react';
import { WeekProgram, Progress } from '../../types';
import { ExerciseCard } from './ExerciseCard';

const brand = {
  forest: '#1B3A2D',
  sage: '#6B8F71',
  warm: '#F0E6D8',
  terracotta: '#C4704B',
  stone: '#8C8577',
};

interface WeekViewProps {
  week: WeekProgram;
  progress: Progress | undefined;
  onToggleExercise: (exerciseId: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  week,
  progress,
  onToggleExercise,
}) => {
  const completedCount = week.exercises.filter(
    (ex) => progress?.completedExercises[ex.id]
  ).length;
  const progressPercentage = week.exercises.length ? Math.round((completedCount / week.exercises.length) * 100) : 0;

  return (
    <div>
      {/* Week Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 12,
              background: brand.forest, color: '#A8D5BA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>
              {week.week}
            </span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: brand.forest, margin: 0 }}>
              Week {week.week}
            </h3>
          </div>
          <span style={{ fontSize: 12, color: brand.stone }}>
            {completedCount}/{week.exercises.length} completed
          </span>
        </div>
        <p style={{ fontSize: 13, color: brand.stone, margin: '4px 0 12px' }}>{week.focus}</p>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, borderRadius: 100, background: brand.warm }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: 6, borderRadius: 100,
            background: progressPercentage === 100 ? brand.sage : brand.terracotta,
            transition: 'width 0.5s ease-out',
          }} />
        </div>
      </div>

      {/* Exercises */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {week.exercises.map((exercise) => (
          <div key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              isCompleted={progress?.completedExercises[exercise.id] || false}
              onToggleComplete={() => onToggleExercise(exercise.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
