import React, { useState } from 'react';
import { Exercise } from '../../types';
import { VideoPlayer } from './VideoPlayer';
import { videoSearchUrl } from '../../lib/videoMatcher';
import { brand } from '../../theme';


interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

function formatVolume({ sets, reps }: Exercise): string {
  if (sets && reps) return `${sets} \u00d7 ${reps}`;
  if (sets) return `${sets} ${sets === 1 ? 'set' : 'sets'}`;
  return `${reps} reps`;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isCompleted,
  onToggleComplete,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return { bg: `${brand.sage}18`, text: brand.sage, border: `${brand.sage}40` };
      case 'intermediate': return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
      case 'advanced': return { bg: `${brand.terracotta}15`, text: brand.terracotta, border: `${brand.terracotta}40` };
      default: return { bg: brand.warm, text: brand.stone, border: brand.warm };
    }
  };

  const diff = getDifficultyColor(exercise.difficulty);

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      overflow: 'hidden',
      border: `1px solid ${brand.warm}`,
      transition: 'all 0.2s',
    }}>
      {/* Top color strip */}
      <div style={{ height: 4, background: isCompleted ? brand.sage : brand.terracotta }} />

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: brand.forest, margin: 0, lineHeight: 1.3 }}>{exercise.name}</h3>
            <p style={{ fontSize: 13, color: brand.stone, marginTop: 6, lineHeight: 1.6 }}>{exercise.description}</p>
          </div>
          <button
            onClick={onToggleComplete}
            aria-label={`Mark ${exercise.name} complete`}
            aria-pressed={isCompleted}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
              border: `2px solid ${isCompleted ? brand.sage : brand.warm}`,
              background: isCompleted ? brand.sage : 'transparent',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {isCompleted && (
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Metadata badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}>
            {exercise.difficulty}
          </span>
          {(exercise.sets || exercise.reps) && (
            <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: brand.cream, color: brand.forest, border: `1px solid ${brand.warm}` }}>
              {formatVolume(exercise)}
            </span>
          )}
          {exercise.duration && (
            <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: brand.cream, color: brand.stone, border: `1px solid ${brand.warm}` }}>
              {exercise.duration}
            </span>
          )}
          <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 11, background: brand.cream, color: brand.stone, border: `1px solid ${brand.warm}` }}>
            {exercise.targetArea}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {exercise.videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              aria-expanded={showVideo}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 100, border: 'none',
                background: brand.terracotta, color: 'white',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {showVideo ? 'Hide Video' : 'Watch Video'}
            </button>
          )}
          {!exercise.videoUrl && (
            <a
              href={videoSearchUrl(exercise)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 100, border: `2px solid ${brand.terracotta}`,
                color: brand.terracotta, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
              }}
            >
              Find a Video<span className="sr-only"> for {exercise.name} on YouTube (opens in a new tab)</span>
            </a>
          )}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            aria-expanded={showInstructions}
            style={{
              flex: 1, padding: '10px 20px', borderRadius: 100,
              border: `2px solid ${brand.forest}`, background: 'transparent',
              color: brand.forest, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {showInstructions ? 'Hide Steps' : 'View Steps'}
          </button>
        </div>
      </div>

      {/* Video Section */}
      {showVideo && (
        <div style={{ padding: '0 20px 20px' }}>
          <VideoPlayer videoUrl={exercise.videoUrl} title={exercise.name} />
        </div>
      )}

      {/* Instructions Section */}
      {showInstructions && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ background: brand.cream, borderRadius: 14, padding: 16, border: `1px solid ${brand.warm}` }}>
            <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: brand.forest, margin: '0 0 12px' }}>Instructions</h4>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercise.instructions.map((instruction, index) => (
                <li key={index} style={{ display: 'flex', gap: 10, fontSize: 13, color: brand.charcoal, lineHeight: 1.6 }}>
                  <span style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: 7,
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
    </div>
  );
};
