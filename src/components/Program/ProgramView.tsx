import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Program } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import {
  completedSessionCount, currentStreak, dateKey, findSession, getSessions, isSessionComplete,
  nextWeekIfComplete, painHistory, painTrend, sessionsPerWeek, totalPercent,
} from '../../lib/sessions';
import { WeekView } from './WeekView';
import { PainTracker } from './PainTracker';
import { brand, fonts } from '../../theme';
import { card, primaryButton, textButton } from '../common/styles';

interface ProgramViewProps {
  program: Program;
  onBack: () => void;
  /** Extra controls shown under the program, e.g. share or delete. */
  actions?: React.ReactNode;
}

const wrap: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '0 16px' };

export const ProgramView: React.FC<ProgramViewProps> = ({ program, onBack, actions }) => {
  const { getProgress, toggleExercise, setPain, setCurrentWeek, resetProgress } = useProgress();
  const progress = getProgress(program.id);
  const sessions = getSessions(progress, program);
  const today = dateKey();
  const target = sessionsPerWeek(program);
  const currentWeek = Math.min(Math.max(progress?.currentWeek || 1, 1), program.weeks.length);
  const currentWeekData = program.weeks.find((w) => w.week === currentWeek);
  const todaysSession = findSession(sessions, today, currentWeek);
  const sessionsThisWeek = completedSessionCount(sessions, program, currentWeek);
  const weekDone = sessionsThisWeek >= target;
  const isLastWeek = currentWeek >= program.weeks.length;
  const streak = currentStreak(sessions, today);
  const history = painHistory(sessions);
  const totalProgress = totalPercent(sessions, program);
  const hasExplanation = program.isAIGenerated && (program.whyItExists || program.howExercisesHelp);

  // Move on to the next week when the user returns after meeting this week's target.
  const checkedAdvance = useRef<string | null>(null);
  useEffect(() => {
    if (checkedAdvance.current === program.id) return;
    checkedAdvance.current = program.id;
    const next = nextWeekIfComplete(sessions, program, currentWeek, today);
    if (next) setCurrentWeek(program, next);
  }, [program, sessions, currentWeek, today, setCurrentWeek]);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress for this program?')) resetProgress(program.id);
  };

  return (
    <div style={{ background: brand.cream, paddingBottom: 40 }}>
      {/* Header */}
      <div className="program-header" style={{
        background: `linear-gradient(170deg, ${brand.forest} 0%, #244836 100%)`,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(27,58,45,0.2)',
      }}>
        <div style={{ ...wrap, paddingTop: 12, paddingBottom: 14 }}>
          <button
            type="button"
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', color: brand.mint, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: fonts.body, marginBottom: 8, padding: '4px 0' }}
          >
            <svg aria-hidden="true" style={{ width: 16, height: 16, marginRight: 4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(20px, 4.5vw, 26px)', color: brand.cream, margin: 0, lineHeight: 1.2 }}>{program.title}</h1>
          <p style={{ fontSize: 13, color: brand.mint, margin: '6px 0 0' }}>
            {program.duration} weeks &middot; {target} sessions a week
            {streak > 0 && <> &middot; <strong style={{ color: brand.cream }}>{streak}-day streak</strong></>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <div
              role="progressbar"
              aria-label="Program progress"
              aria-valuenow={totalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ flex: 1, height: 8, borderRadius: 100, background: 'rgba(0,0,0,0.25)' }}
            >
              <div style={{ width: `${totalProgress}%`, height: 8, borderRadius: 100, background: `linear-gradient(to right, ${brand.terracotta}, #d4855e)`, transition: 'width 0.5s ease-out' }} />
            </div>
            <span style={{ color: brand.cream, fontWeight: 700, fontSize: 13, minWidth: 36, textAlign: 'right' }}>{totalProgress}%</span>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ ...wrap, paddingTop: 16 }}>
        <div role="tablist" aria-label="Program weeks" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {program.weeks.map((week) => {
            const isActive = currentWeek === week.week;
            const done = Math.min(completedSessionCount(sessions, program, week.week), target);
            const complete = done >= target;
            return (
              <button
                key={week.week}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCurrentWeek(program, week.week)}
                style={{
                  flex: '1 0 72px',
                  padding: '8px 6px',
                  borderRadius: 12,
                  whiteSpace: 'nowrap',
                  border: `1px solid ${isActive ? brand.forest : brand.warm}`,
                  background: isActive ? brand.forest : 'white',
                  color: isActive ? 'white' : brand.forest,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>Week {week.week}{complete ? ' ✓' : ''}</div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: isActive ? 0.85 : 0.65 }}>{done}/{target} sessions</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...wrap, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14 }}>
        {/* About: open on the first visit, collapsed once the user has started. */}
        <details open={sessions.length === 0} style={{ ...card, padding: 0 }}>
          <summary style={{ cursor: 'pointer', padding: '14px 18px', fontSize: 14, fontWeight: 600, color: brand.forest }}>
            About this program
          </summary>
          <div style={{ padding: '0 18px 16px', fontSize: 14, color: brand.charcoal, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0 }}>{program.description}</p>
            {hasExplanation && program.whyItExists && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: brand.terracotta, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Why this happens</p>
                <p style={{ margin: 0 }}>{program.whyItExists}</p>
              </div>
            )}
            {hasExplanation && program.howExercisesHelp && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: brand.forest, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>How these exercises help</p>
                <p style={{ margin: 0 }}>{program.howExercisesHelp}</p>
              </div>
            )}
          </div>
        </details>

        {weekDone && (
          <div role="status" style={{ ...card, background: `${brand.sage}18`, borderColor: `${brand.sage}55` }}>
            {isLastWeek ? (
              <>
                <p style={{ fontFamily: fonts.display, fontSize: 18, color: brand.forest, margin: 0 }}>Program complete — well done!</p>
                <p style={{ fontSize: 14, color: brand.charcoal, margin: '6px 0 12px' }}>
                  Keep up the exercises you found most helpful a few times a week, or create a follow-up program.
                </p>
                <Link to="/" style={primaryButton}>Create a follow-up program</Link>
              </>
            ) : (
              <>
                <p style={{ fontFamily: fonts.display, fontSize: 18, color: brand.forest, margin: 0 }}>Week {currentWeek} complete!</p>
                <p style={{ fontSize: 14, color: brand.charcoal, margin: '6px 0 12px' }}>
                  You hit {target} sessions this week. Week {currentWeek + 1} starts automatically on your next visit.
                </p>
                <button type="button" style={primaryButton} onClick={() => setCurrentWeek(program, currentWeek + 1)}>
                  Start week {currentWeek + 1} now
                </button>
              </>
            )}
          </div>
        )}

        {currentWeekData && (
          <WeekView
            week={currentWeekData}
            completedToday={todaysSession?.completed ?? []}
            sessionDone={!!todaysSession && isSessionComplete(todaysSession, program)}
            sessionsDone={sessionsThisWeek}
            sessionsTarget={target}
            onToggleExercise={(exerciseId) => toggleExercise(program, exerciseId, currentWeek, today)}
          />
        )}

        {currentWeekData && (
          <section aria-label="Pain check-in" style={card}>
            <PainTracker
              todayPain={todaysSession?.pain}
              history={history}
              trend={painTrend(history)}
              onChange={(pain) => setPain(program, currentWeek, pain, today)}
            />
          </section>
        )}

        {actions}

        <button type="button" onClick={handleResetProgress} style={{ ...textButton, alignSelf: 'flex-start', color: brand.stone }}>
          Reset progress
        </button>
      </div>
    </div>
  );
};
