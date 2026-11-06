import React, { useEffect } from 'react';
import { Program } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import { WeekView } from './WeekView';

const brand = {
  forest: '#1B3A2D',
  sage: '#6B8F71',
  mint: '#A8D5BA',
  cream: '#FAF6F1',
  warm: '#F0E6D8',
  terracotta: '#C4704B',
  charcoal: '#2C2C2C',
  stone: '#8C8577',
};

interface ProgramViewProps {
  program: Program;
  onBack: () => void;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  program,
  onBack,
}) => {
  const {
    getProgress, startProgram, toggleExercise, setCurrentWeek, resetProgress, getTotalProgress,
  } = useProgress();

  const progress = getProgress(program.id);
  const currentWeek = progress?.currentWeek || 1;
  const totalProgress = getTotalProgress(program.id, program);

  useEffect(() => {
    if (!progress) startProgram(program);
  }, [program, progress, startProgram]);

  const handleToggleExercise = (exerciseId: string) => toggleExercise(program.id, exerciseId);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress for this program?')) {
      resetProgress(program.id);
      startProgram(program);
    }
  };

  const currentWeekData = program.weeks.find((w) => w.week === currentWeek);

  return (
    <div style={{ minHeight: '100vh', background: brand.cream }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(170deg, ${brand.forest} 0%, #244836 100%)`,
        position: 'sticky',
        top: 57,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(27,58,45,0.25)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 24px' }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', color: brand.mint, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 12, opacity: 0.8, padding: 0 }}
          >
            <svg style={{ width: 16, height: 16, marginRight: 6 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: brand.cream, margin: 0, lineHeight: 1.2 }}>{program.title}</h1>
              <p style={{ fontSize: 13, color: brand.mint, opacity: 0.7, marginTop: 4 }}>{program.duration} weeks</p>
            </div>
            <button onClick={handleResetProgress} style={{ fontSize: 12, color: brand.mint, opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
              Reset
            </button>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: brand.mint, opacity: 0.7 }}>Progress</span>
              <span style={{ color: brand.cream, fontWeight: 700 }}>{totalProgress}%</span>
            </div>
            <div style={{ width: '100%', height: 8, borderRadius: 100, background: 'rgba(0,0,0,0.2)' }}>
              <div className="shimmer-bar" style={{ width: `${totalProgress}%`, height: 8, borderRadius: 100, background: `linear-gradient(to right, ${brand.terracotta}, #d4855e)`, transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px 12px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {program.weeks.map((week) => {
            const isActive = currentWeek === week.week;
            const weekProgress = progress && week.exercises.length
              ? Math.round((week.exercises.filter((ex) => progress.completedExercises[ex.id]).length / week.exercises.length) * 100)
              : 0;
            return (
              <button
                key={week.week}
                onClick={() => setCurrentWeek(program.id, week.week)}
                style={{
                  flexShrink: 0,
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: isActive ? 'none' : `1px solid ${brand.warm}`,
                  background: isActive ? brand.terracotta : 'white',
                  color: isActive ? 'white' : brand.forest,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(196,112,75,0.3)' : 'none',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>Week {week.week}</div>
                <div style={{ fontSize: 10, marginTop: 2, opacity: isActive ? 0.8 : 0.5 }}>{weekProgress}% done</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Description */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 16px' }}>
        <div style={{
          borderRadius: 16,
          padding: 16,
          background: `${brand.sage}15`,
          borderLeft: `4px solid ${brand.sage}`,
        }}>
          <p style={{ fontSize: 14, color: brand.forest, lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{program.description}</p>
        </div>
      </div>

      {/* AI Explanation Sections */}
      {program.isAIGenerated && (program.whyItExists || program.howExercisesHelp) && (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {program.whyItExists && (
            <div style={{
              borderRadius: 16,
              padding: 16,
              background: `${brand.terracotta}10`,
              borderLeft: `4px solid ${brand.terracotta}`,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: brand.terracotta, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Why this happens</p>
              <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: 0 }}>{program.whyItExists}</p>
            </div>
          )}
          {program.howExercisesHelp && (
            <div style={{
              borderRadius: 16,
              padding: 16,
              background: `${brand.forest}08`,
              borderLeft: `4px solid ${brand.sage}`,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: brand.forest, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>How these exercises help</p>
              <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: 0 }}>{program.howExercisesHelp}</p>
            </div>
          )}
        </div>
      )}

      {/* Week Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 40px' }}>
        {currentWeekData && (
          <WeekView week={currentWeekData} progress={progress} onToggleExercise={handleToggleExercise} />
        )}
      </div>
    </div>
  );
};
