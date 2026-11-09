import React, { useState } from 'react';
import { Exercise } from '../../types';
import { VideoPlayer } from './VideoPlayer';
import { videoSearchUrl } from '../../lib/videoMatcher';
import { brand, fonts } from '../../theme';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

function formatVolume({ sets, reps }: Exercise): string {
  if (sets && reps) return `${sets} × ${reps}`;
  if (sets) return `${sets} ${sets === 1 ? 'set' : 'sets'}`;
  return `${reps} reps`;
}

const DIFFICULTY = {
  beginner: { bg: `${brand.sage}18`, text: brand.forest },
  intermediate: { bg: '#fef3c7', text: '#92400e' },
  advanced: { bg: `${brand.terracotta}18`, text: '#9a4a28' },
} as const;

const chip: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 100, fontSize: 12, background: brand.cream, color: brand.charcoal,
  border: `1px solid ${brand.warm}`, whiteSpace: 'nowrap',
};

const smallButton: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100,
  fontFamily: fonts.body, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', lineHeight: 1.2,
};

const CheckIcon = () => (
  <svg aria-hidden="true" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isCompleted, onToggleComplete }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const difficulty = DIFFICULTY[exercise.difficulty] ?? DIFFICULTY.beginner;

  return (
    <article style={{
      background: isCompleted ? '#F4F8F4' : 'white',
      borderRadius: 18,
      border: `1px solid ${isCompleted ? `${brand.sage}66` : brand.warm}`,
      borderLeft: `4px solid ${isCompleted ? brand.sage : brand.terracotta}`,
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      <div style={{ padding: 'clamp(14px, 3.5vw, 20px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: fonts.display, fontSize: 18, color: brand.forest, margin: 0, lineHeight: 1.3 }}>{exercise.name}</h3>
            {exercise.description && (
              <p style={{ fontSize: 14, color: brand.stone, margin: '4px 0 0', lineHeight: 1.55 }}>{exercise.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleComplete}
            aria-label={`Mark ${exercise.name} complete`}
            aria-pressed={isCompleted}
            style={{
              ...smallButton,
              flexShrink: 0,
              padding: '7px 14px 7px 10px',
              border: `2px solid ${isCompleted ? brand.sage : brand.warm}`,
              background: isCompleted ? brand.sage : 'white',
              color: isCompleted ? 'white' : brand.forest,
              transition: 'all 0.2s',
            }}
          >
            {isCompleted ? <CheckIcon /> : (
              <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${brand.stone}`, boxSizing: 'border-box' }} />
            )}
            {isCompleted ? 'Done' : 'Mark done'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {(exercise.sets || exercise.reps) && <span style={{ ...chip, fontWeight: 600, color: brand.forest }}>{formatVolume(exercise)}</span>}
          {exercise.duration && <span style={{ ...chip, fontWeight: 600, color: brand.forest }}>{exercise.duration}</span>}
          <span style={chip}>{exercise.targetArea}</span>
          <span style={{ ...chip, background: difficulty.bg, color: difficulty.text, borderColor: 'transparent' }}>{exercise.difficulty}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {exercise.videoUrl ? (
            <button
              type="button"
              onClick={() => setShowVideo(!showVideo)}
              aria-expanded={showVideo}
              style={{ ...smallButton, border: 'none', background: brand.terracotta, color: 'white' }}
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1.5v9l8-4.5z" /></svg>
              {showVideo ? 'Hide Video' : 'Watch Video'}
            </button>
          ) : (
            <a
              href={videoSearchUrl(exercise)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...smallButton, border: `1px solid ${brand.warm}`, background: 'white', color: brand.charcoal }}
            >
              Find a Video
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" /></svg>
              <span className="sr-only"> for {exercise.name} on YouTube (opens in a new tab)</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            aria-expanded={showInstructions}
            style={{ ...smallButton, border: `1px solid ${brand.forest}`, background: 'transparent', color: brand.forest }}
          >
            {showInstructions ? 'Hide Steps' : 'View Steps'}
          </button>
        </div>
      </div>

      {showVideo && (
        <div style={{ padding: '0 clamp(14px, 3.5vw, 20px) clamp(14px, 3.5vw, 20px)' }}>
          <VideoPlayer videoUrl={exercise.videoUrl} title={exercise.name} />
        </div>
      )}

      {showInstructions && (
        <div style={{ padding: '0 clamp(14px, 3.5vw, 20px) clamp(14px, 3.5vw, 20px)' }}>
          <div style={{ background: brand.cream, borderRadius: 14, padding: 16, border: `1px solid ${brand.warm}` }}>
            <h4 style={{ fontFamily: fonts.display, fontSize: 15, color: brand.forest, margin: '0 0 12px' }}>Instructions</h4>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercise.instructions.map((instruction, index) => (
                <li key={index} style={{ display: 'flex', gap: 10, fontSize: 14, color: brand.charcoal, lineHeight: 1.6 }}>
                  <span aria-hidden="true" style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: 7, marginTop: 1,
                    background: brand.forest, color: brand.mint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
};
