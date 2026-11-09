import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntakeDetails } from '../types';
import { useProgramGenerator } from '../hooks/useProgramGenerator';
import { useAIPrograms } from '../hooks/useAIPrograms';
import { useProgress } from '../hooks/useProgress';
import { writeLocalStorage } from '../hooks/useLocalStorage';
import { PROGRESS_STORAGE_KEY } from '../hooks/useProgress';
import { PROGRAMS_STORAGE_KEY } from '../hooks/useAIPrograms';
import { usePageMeta } from '../hooks/usePageMeta';
import { AIInputForm } from '../components/AIProgram/AIInputForm';
import { GeneratingIndicator } from '../components/AIProgram/GeneratingIndicator';
import { AIProgramHistory, BackupControls } from '../components/AIProgram/AIProgramHistory';
import { SafetyCheck } from '../components/AIProgram/SafetyCheck';
import { ProgramLibrary } from '../components/Program/ProgramLibrary';
import { RedFlag, SafetyStopError, screenForRedFlags } from '../lib/safety';
import { Backup, mergeBackup } from '../lib/backup';
import { PromptOptions } from '../lib/promptBuilder';
import { libraryPrograms } from '../data/exercises';
import { Program } from '../types';
import { brand, fonts } from '../theme';
import { card } from '../components/common/styles';

type PageState = 'input' | 'loading' | 'safety';

interface Request {
  description: string;
  details: IntakeDetails;
}

export const HomePage: React.FC = () => {
  usePageMeta();
  const navigate = useNavigate();
  const { generate } = useProgramGenerator();
  const { programs: savedPrograms, saveProgram, deleteProgram } = useAIPrograms();
  const { userProgress } = useProgress();
  const [pageState, setPageState] = useState<PageState>('input');
  const [request, setRequest] = useState<Request | null>(null);
  const [safety, setSafety] = useState<{ flags: RedFlag[]; reason?: string }>({ flags: [] });
  const [generationError, setGenerationError] = useState<string | null>(null);

  const run = useCallback(async ({ description, details }: Request, options: PromptOptions = {}) => {
    setGenerationError(null);
    setPageState('loading');
    try {
      const program = await generate(description, details, options);
      // Programs are saved as soon as they are created, so a refresh or the Back button never loses one.
      saveProgram(program);
      navigate(`/plan/${program.id}`);
    } catch (err) {
      if (err instanceof SafetyStopError) {
        setSafety({ flags: [], reason: err.message });
        setPageState('safety');
        return;
      }
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate program');
      setPageState('input');
    }
  }, [generate, saveProgram, navigate]);

  const handleSubmit = useCallback((description: string, details: IntakeDetails) => {
    const next = { description, details };
    setRequest(next);
    const flags = screenForRedFlags(description, details.painLevel);
    if (flags.length) {
      setSafety({ flags });
      setPageState('safety');
      return;
    }
    run(next);
  }, [run]);

  // Saved AI programs plus ready-made programs the user has started, most recently used first.
  const yourPrograms = useMemo(() => {
    const started = libraryPrograms.filter((program) => userProgress.programs[program.id]?.sessions?.length);
    const lastUsed = (program: Program) => userProgress.programs[program.id]?.lastUpdated ?? program.createdAt ?? '';
    return [...savedPrograms, ...started].sort((a, b) => lastUsed(b).localeCompare(lastUsed(a)));
  }, [savedPrograms, userProgress]);

  const handleImport = useCallback((backup: Backup) => {
    const merged = mergeBackup({ programs: savedPrograms, progress: userProgress }, backup);
    writeLocalStorage(PROGRAMS_STORAGE_KEY, merged.programs);
    writeLocalStorage(PROGRESS_STORAGE_KEY, merged.progress);
    return merged.added;
  }, [savedPrograms, userProgress]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ padding: 'clamp(28px, 6vw, 48px) 16px 24px' }}>
        <div style={{
          fontFamily: fonts.body,
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: brand.terracotta,
          marginBottom: 12,
          fontWeight: 600,
        }}>
          {yourPrograms.length ? 'Your recovery' : 'AI-Powered Recovery'}
        </div>
        <h1 style={{
          fontFamily: fonts.display,
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: brand.forest,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {yourPrograms.length ? 'Welcome back' : "What's bothering you?"}
        </h1>
        <p style={{ fontSize: 15, color: brand.stone, lineHeight: 1.7, marginTop: 12, maxWidth: 480 }}>
          {yourPrograms.length
            ? 'Pick up where you left off, or describe something new to get another program.'
            : 'Describe your pain, stiffness, or mobility issue and get a free, personalized exercise program in seconds.'}
        </p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
        {pageState === 'input' && (
          <AIProgramHistory
            programs={yourPrograms}
            progress={userProgress}
            onDelete={deleteProgram}
            footer={<BackupControls programs={savedPrograms} progress={userProgress} onImport={handleImport} />}
          />
        )}

        {pageState === 'loading' && <GeneratingIndicator />}

        {pageState === 'safety' && request && (
          <SafetyCheck
            flags={safety.flags}
            reason={safety.reason}
            onEdit={() => setPageState('input')}
            onContinue={() => run(request, { clearedByClinician: true })}
          />
        )}

        {/* Kept mounted while hidden so the description is preserved for a retry. */}
        <div hidden={pageState !== 'input'}>
          {yourPrograms.length > 0 && (
            <h2 style={{ fontFamily: fonts.display, fontSize: 20, color: brand.forest, margin: '4px 0 12px' }}>Start a new program</h2>
          )}
          {generationError && (
            <div role="alert" style={{ background: brand.dangerBg, border: `1px solid ${brand.dangerBorder}`, borderRadius: 16, padding: 16, color: brand.danger, fontSize: 14, fontFamily: fonts.body, marginBottom: 16 }}>
              {generationError}
              <span style={{ display: 'block', marginTop: 6, color: brand.charcoal }}>
                While you wait, you can start one of the ready-made programs below.
              </span>
            </div>
          )}
          <AIInputForm
            onSubmit={handleSubmit}
            isDisabled={pageState === 'loading'}
            footer={yourPrograms.length === 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${brand.warm}` }}>
                <BackupControls programs={savedPrograms} progress={userProgress} onImport={handleImport} />
              </div>
            )}
          />
        </div>

        <ProgramLibrary />

        <section aria-labelledby="how-it-works" style={{ padding: '8px 0 0' }}>
          <h2 id="how-it-works" style={{ fontFamily: fonts.display, fontSize: 24, color: brand.forest, margin: '0 0 14px' }}>
            How PhysioFlow works
          </h2>
          <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              ['Describe it', 'Tell us what hurts, and optionally your pain level, equipment, and available time.'],
              ['Get your program', 'A 3-4 week plan that builds from gentle mobility to strength, with steps and videos.'],
              ['Track each session', 'Check off exercises and log your pain. Weeks advance as you hit your session goal.'],
            ].map(([title, text], index) => (
              <li key={title} style={{ ...card, padding: 18 }}>
                <span aria-hidden="true" style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: 9, background: brand.forest, color: brand.mint, alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                  {index + 1}
                </span>
                <h3 style={{ fontFamily: fonts.display, fontSize: 17, color: brand.forest, margin: '10px 0 4px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.6, margin: 0 }}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="about-physioflow" style={{ padding: '0 0 36px', color: brand.charcoal, fontSize: 14, lineHeight: 1.8 }}>
          <h2 id="about-physioflow" style={{ fontFamily: fonts.display, fontSize: 24, color: brand.forest, lineHeight: 1.3, margin: '8px 0' }}>
            Free personalized exercise programs
          </h2>
          <p style={{ margin: '0 0 10px' }}>
            PhysioFlow helps you build a stretching, strengthening, and mobility routine
            around the issue you describe. Get a progressive, multi-week program for
            everyday stiffness or movement limitations in areas such as your neck,
            shoulders, back, hips, and knees.
          </p>
          <p style={{ margin: 0 }}>
            PhysioFlow is free to use and does not require an account. It provides
            educational exercise guidance and does not diagnose conditions or replace
            a healthcare professional. Consult a qualified professional before starting
            an exercise program.
          </p>
        </section>
      </div>
    </div>
  );
};
