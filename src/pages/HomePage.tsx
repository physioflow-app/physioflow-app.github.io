import React, { useCallback, useState } from 'react';
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
import { AIProgramHistory } from '../components/AIProgram/AIProgramHistory';
import { SafetyCheck } from '../components/AIProgram/SafetyCheck';
import { ProgramLibrary } from '../components/Program/ProgramLibrary';
import { RedFlag, SafetyStopError, screenForRedFlags } from '../lib/safety';
import { Backup, mergeBackup } from '../lib/backup';
import { PromptOptions } from '../lib/promptBuilder';
import { brand, fonts } from '../theme';

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
          AI-Powered Recovery
        </div>
        <h1 style={{
          fontFamily: fonts.display,
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: brand.forest,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          What's bothering you?
        </h1>
        <p style={{ fontSize: 15, color: brand.stone, lineHeight: 1.7, marginTop: 12, maxWidth: 480 }}>
          Describe your pain, stiffness, or mobility issue &mdash; and get a personalized exercise program.
        </p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
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
          {generationError && (
            <div role="alert" style={{ background: brand.dangerBg, border: `1px solid ${brand.dangerBorder}`, borderRadius: 16, padding: 16, color: brand.danger, fontSize: 14, fontFamily: fonts.body, marginBottom: 20 }}>
              {generationError}
              <span style={{ display: 'block', marginTop: 6, color: brand.charcoal }}>
                While you wait, you can start one of the ready-made programs below.
              </span>
            </div>
          )}
          <AIInputForm onSubmit={handleSubmit} isDisabled={pageState === 'loading'} />
        </div>

        <AIProgramHistory programs={savedPrograms} progress={userProgress} onDelete={deleteProgram} onImport={handleImport} />

        <ProgramLibrary />

        <section aria-labelledby="about-physioflow" style={{ padding: '16px 0 36px', color: brand.charcoal, fontSize: 14, lineHeight: 1.8 }}>
          <h2 id="about-physioflow" style={{ fontFamily: fonts.display, fontSize: 26, color: brand.forest, lineHeight: 1.3 }}>
            Free personalized exercise programs
          </h2>
          <p>
            PhysioFlow helps you build a stretching, strengthening, and mobility routine
            around the issue you describe. Get a progressive, multi-week program for
            everyday stiffness or movement limitations in areas such as your neck,
            shoulders, back, hips, and knees.
          </p>
          <h3 style={{ fontSize: 20, color: brand.forest }}>How PhysioFlow works</h3>
          <ol style={{ paddingLeft: 22 }}>
            <li>Describe your issue, and optionally your pain level, equipment, and available time.</li>
            <li>Review your AI-generated program, step-by-step instructions, and video demonstrations.</li>
            <li>Log each session and your pain level. Weeks advance as you hit your session goal, and your progress stays in your browser.</li>
          </ol>
          <p>
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
