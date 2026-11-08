import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Program } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import {
  completedSessionCount, currentStreak, dateKey, findSession, getSessions, isSessionComplete,
  nextWeekIfComplete, painHistory, painTrend, sessionsPerWeek, totalPercent,
} from '../../lib/sessions';
import { PAIN_STOP_THRESHOLD } from '../../lib/safety';
import { WeekView } from './WeekView';
import { PainTracker } from './PainTracker';
import { brand, fonts } from '../../theme';
import { card, primaryButton } from '../common/styles';

interface ProgramViewProps {
  program: Program;
  onBack: () => void;
  /** Extra controls shown under the program, e.g. share or delete. */
  actions?: React.ReactNode;
}

export const ProgramView: React.FC<ProgramViewProps> = ({ program, onBack, actions }) => {
  const { getProgress, toggleExercise, setPain, setCurrentWeek, resetProgress } = useProgress();
  const progress = getProgress(program.id);
  const sessions = getSessions(progress, program);
  const today = dateKey();
  const target = sessionsPerWeek(program);
  const currentWeek = Math.min(Math.max(progress?.currentWeek || 1, 1), program.weeks.length);
  const currentWeekData = program.weeks.find((w) => w.week === currentWeek);
  const todaysSession = findSession(sessions, today, currentWeek);
  const completedToday = todaysSession?.completed ?? [];
  const sessionsThisWeek = completedSessionCount(sessions, program, currentWeek);
  const weekDone = sessionsThisWeek >= target;
  const isLastWeek = currentWeek >= program.weeks.length;
  const streak = currentStreak(sessions, today);
  const history = painHistory(sessions);
  const totalProgress = totalPercent(sessions, program);

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
    <div style={{ minHeight: '100vh', background: brand.cream }}>
      {/* Header */}
      <div className="program-header" style={{
        background: `linear-gradient(170deg, ${brand.forest} 0%, #244836 100%)`,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(27,58,45,0.25)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '14px 16px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', color: brand.mint, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: fonts.body, marginBottom: 10, opacity: 0.8, padding: 0 }}
          >
            <svg aria-hidden="true" style={{ width: 16, height: 16, marginRight: 6 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(19px, 4vw, 22px)', color: brand.cream, margin: 0, lineHeight: 1.2 }}>{program.title}</h1>
              <p style={{ fontSize: 13, color: brand.mint, opacity: 0.8, margin: '4px 0 0' }}>
                {program.duration} weeks &middot; {target} sessions a week
                {streak > 0 && <> &middot; <strong style={{ color: brand.cream }}>{streak}-day streak</strong></>}
              </p>
            </div>
            <button type="button" onClick={handleResetProgress} style={{ fontSize: 12, color: brand.mint, opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
              Reset
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: brand.mint, opacity: 0.8 }}>Program progress</span>
              <span style={{ color: brand.cream, fontWeight: 700 }}>{totalProgress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Program progress"
              aria-valuenow={totalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: '100%', height: 8, borderRadius: 100, background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="shimmer-bar" style={{ width: `${totalProgress}%`, height: 8, borderRadius: 100, background: `linear-gradient(to right, ${brand.terracotta}, #d4855e)`, transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 12px' }}>
        <div role="tablist" aria-label="Program weeks" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {program.weeks.map((week) => {
            const isActive = currentWeek === week.week;
            const done = Math.min(completedSessionCount(sessions, program, week.week), target);
            return (
              <button
                key={week.week}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCurrentWeek(program, week.week)}
                style={{
                  flexShrink: 0,
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: isActive ? 'none' : `1px solid ${brand.warm}`,
                  background: isActive ? brand.terracotta : 'white',
                  color: isActive ? 'white' : brand.forest,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(196,112,75,0.3)' : 'none',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>Week {week.week}</div>
                <div style={{ fontSize: 10, marginTop: 2, opacity: isActive ? 0.85 : 0.6 }}>{done}/{target} sessions</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 16, padding: 16, background: `${brand.sage}15`, borderLeft: `4px solid ${brand.sage}` }}>
          <p style={{ fontSize: 14, color: brand.forest, lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{program.description}</p>
        </div>

        {program.isAIGenerated && program.whyItExists && (
          <div style={{ borderRadius: 16, padding: 16, background: `${brand.terracotta}10`, borderLeft: `4px solid ${brand.terracotta}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: brand.terracotta, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Why this happens</p>
            <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: 0 }}>{program.whyItExists}</p>
          </div>
        )}
        {program.isAIGenerated && program.howExercisesHelp && (
          <div style={{ borderRadius: 16, padding: 16, background: `${brand.forest}08`, borderLeft: `4px solid ${brand.sage}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: brand.forest, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>How these exercises help</p>
            <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: 0 }}>{program.howExercisesHelp}</p>
          </div>
        )}

        <p style={{ fontSize: 13, color: brand.charcoal, lineHeight: 1.6, margin: 0, padding: '10px 14px', borderRadius: 12, background: 'white', border: `1px solid ${brand.warm}` }}>
          <strong>Listen to your body:</strong> mild discomfort (up to 3-4/10) is okay. Stop an exercise if pain goes above {PAIN_STOP_THRESHOLD}/10,
          or if you feel sharp pain, numbness, tingling, or dizziness.
        </p>

        {/* Today's session */}
        {currentWeekData && (
          <section aria-labelledby="todays-session" style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <h2 id="todays-session" style={{ fontFamily: fonts.display, fontSize: 18, color: brand.forest, margin: 0 }}>
                Today&rsquo;s session
              </h2>
              <span style={{ fontSize: 13, color: brand.stone }}>
                {todaysSession && isSessionComplete(todaysSession, program)
                  ? 'Done for today ✓'
                  : `${completedToday.length}/${currentWeekData.exercises.length} exercises done`}
              </span>
            </div>
            <PainTracker
              todayPain={todaysSession?.pain}
              history={history}
              trend={painTrend(history)}
              onChange={(pain) => setPain(program, currentWeek, pain, today)}
            />
          </section>
        )}

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
      </div>

      {/* Week Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 16px 24px' }}>
        {currentWeekData && (
          <WeekView
            week={currentWeekData}
            completedToday={completedToday}
            sessionsDone={sessionsThisWeek}
            sessionsTarget={target}
            onToggleExercise={(exerciseId) => toggleExercise(program, exerciseId, currentWeek, today)}
          />
        )}
      </div>

      {actions && <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 40px' }}>{actions}</div>}
    </div>
  );
};
