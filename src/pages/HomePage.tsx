import React, { useState, useCallback } from 'react';
import { Program } from '../types';
import { useWebLLM } from '../hooks/useWebLLM';
import { useAIPrograms } from '../hooks/useAIPrograms';
import { AIInputForm } from '../components/AIProgram/AIInputForm';
import { ModelLoadingProgress } from '../components/AIProgram/ModelLoadingProgress';
import { AIProgramHistory } from '../components/AIProgram/AIProgramHistory';
import { ProgramView } from '../components/Program';

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

type PageState = 'input' | 'loading' | 'result';

export const HomePage: React.FC = () => {
  const { status, progress, progressText, generate } = useWebLLM();
  const { programs: savedPrograms, saveProgram, deleteProgram } = useAIPrograms();
  const [pageState, setPageState] = useState<PageState>('input');
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (description: string) => {
    setGenerationError(null);
    setPageState('loading');
    try {
      const program = await generate(description);
      setCurrentProgram(program);
      setPageState('result');
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate program');
      setPageState('input');
    }
  }, [generate]);

  const handleSave = useCallback(() => {
    if (currentProgram) saveProgram(currentProgram);
  }, [currentProgram, saveProgram]);

  const handleGenerateAnother = useCallback(() => {
    setCurrentProgram(null);
    setPageState('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectSaved = useCallback((program: Program) => {
    setCurrentProgram(program);
    setPageState('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackFromResult = useCallback(() => {
    setCurrentProgram(null);
    setPageState('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isLoading = pageState === 'loading';
  const isSaved = savedPrograms.some((program) => program.id === currentProgram?.id);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ padding: '48px 24px 24px' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
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
          fontFamily: "'DM Serif Display', serif",
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

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
        {/* Result state */}
        {pageState === 'result' && currentProgram && (
          <div className="animate-fade-in">
            <ProgramView
              program={currentProgram}
              onBack={handleBackFromResult}
            />
            <div style={{ padding: '16px 0', display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={isSaved}
                style={{ flex: 1, padding: '14px 32px', borderRadius: 100, border: 'none', background: brand.forest, color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                {isSaved ? 'Program Saved' : 'Save Program'}
              </button>
              <button
                onClick={handleGenerateAnother}
                style={{ flex: 1, padding: '14px 32px', borderRadius: 100, border: `2px solid ${brand.forest}`, background: 'transparent', color: brand.forest, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Generate Another
              </button>
            </div>
          </div>
        )}

        {isLoading && <ModelLoadingProgress status={status} progress={progress} progressText={progressText} />}

        {pageState !== 'result' && (
          <div hidden={isLoading}>
            {generationError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 16, color: '#b91c1c', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                {generationError}
              </div>
            )}
            <AIInputForm onSubmit={handleSubmit} isDisabled={isLoading} />
          </div>
        )}

        {pageState === 'input' && (
          <AIProgramHistory programs={savedPrograms} onSelect={handleSelectSaved} onDelete={deleteProgram} />
        )}
      </div>

    </div>
  );
};
