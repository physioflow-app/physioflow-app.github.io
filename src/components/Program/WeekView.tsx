import React from 'react';
import { WeekProgram } from '../../types';
import { PAIN_STOP_THRESHOLD } from '../../lib/safety';
import { ExerciseCard } from './ExerciseCard';
import { brand, fonts } from '../../theme';

interface WeekViewProps {
  week: WeekProgram;
  /** Exercises completed in today's session. */
  completedToday: string[];
  sessionDone: boolean;
  sessionsDone: number;
  sessionsTarget: number;
  onToggleExercise: (exerciseId: string) => void;
}

/** Today's session for the selected week. */
export const WeekView: React.FC<WeekViewProps> = ({ week, completedToday, sessionDone, sessionsDone, sessionsTarget, onToggleExercise }) => {
  const done = Math.min(sessionsDone, sessionsTarget);
  const doneToday = week.exercises.filter((exercise) => completedToday.includes(exercise.id)).length;
  return (
    <section aria-labelledby="todays-session">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px' }}>
        <h2 id="todays-session" style={{ fontFamily: fonts.display, fontSize: 22, color: brand.forest, margin: 0 }}>
          Today&rsquo;s session
        </h2>
        <span style={{ fontSize: 14, fontWeight: 600, color: sessionDone ? brand.sage : brand.forest }}>
          {sessionDone ? 'Done for today ✓' : `${doneToday}/${week.exercises.length} exercises done`}
        </span>
      </div>
      <p style={{ fontSize: 14, color: brand.stone, margin: '4px 0 10px' }}>
        Week {week.week} &middot; {week.focus}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div
          role="progressbar"
          aria-label={`Week ${week.week} sessions`}
          aria-valuenow={Math.round((done / sessionsTarget) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ display: 'flex', gap: 4, flex: 1 }}
        >
          {Array.from({ length: sessionsTarget }, (_, index) => (
            <span key={index} style={{ flex: 1, height: 6, borderRadius: 100, background: index < done ? brand.sage : brand.warm }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: brand.stone, whiteSpace: 'nowrap' }}>{done}/{sessionsTarget} sessions this week</span>
      </div>

      <p style={{ fontSize: 13, color: brand.charcoal, lineHeight: 1.55, margin: '0 0 14px', padding: '10px 12px', borderRadius: 12, background: '#FFF8EC', border: '1px solid #F3E1C2' }}>
        <strong>Listen to your body:</strong> mild discomfort (up to 3-4/10) is okay. Stop if pain goes above {PAIN_STOP_THRESHOLD}/10,
        or you feel sharp pain, numbness, tingling, or dizziness.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {week.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={completedToday.includes(exercise.id)}
            onToggleComplete={() => onToggleExercise(exercise.id)}
          />
        ))}
      </div>
    </section>
  );
};
