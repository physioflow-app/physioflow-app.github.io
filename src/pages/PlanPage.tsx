import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProgramView } from '../components/Program';
import { useAIPrograms } from '../hooks/useAIPrograms';
import { usePageMeta } from '../hooks/usePageMeta';
import { createShareUrl } from '../lib/share';
import { brand, fonts } from '../theme';
import { primaryButton, secondaryButton, textButton } from '../components/common/styles';
import { MessagePage } from './MessagePage';

export const PlanPage: React.FC = () => {
  const { planId = '' } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { getProgram, deleteProgram } = useAIPrograms();
  const program = getProgram(planId);
  const [shareState, setShareState] = useState<{ status: 'idle' | 'copied' | 'manual' | 'error'; url?: string }>({ status: 'idle' });
  usePageMeta(program?.title ?? 'Program not found');

  if (!program) {
    return (
      <MessagePage title="Program Not Found">
        This program is not saved in this browser. Programs are stored on the device where they were created —
        open it there, or import a backup from the home page.
      </MessagePage>
    );
  }

  const handleShare = async () => {
    try {
      const url = await createShareUrl(program);
      if (navigator.share) {
        try {
          await navigator.share({ title: program.title, text: `My PhysioFlow program: ${program.title}`, url });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setShareState({ status: 'copied', url });
      } catch {
        setShareState({ status: 'manual', url });
      }
    } catch {
      setShareState({ status: 'error' });
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${program.title}" and its progress?`)) return;
    deleteProgram(program.id);
    navigate('/');
  };

  return (
    <ProgramView
      program={program}
      onBack={() => navigate('/')}
      actions={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button type="button" onClick={handleShare} style={{ ...primaryButton, flex: 1 }}>Share Program</button>
            <Link to="/" style={{ ...secondaryButton, flex: 1 }}>Generate Another</Link>
          </div>
          {shareState.status === 'copied' && <p role="status" style={{ fontSize: 13, color: brand.forest, margin: 0 }}>Link copied. Anyone with it can open a copy of this program (not your progress).</p>}
          {shareState.status === 'error' && <p role="alert" style={{ fontSize: 13, color: brand.danger, margin: 0 }}>Could not create a share link in this browser.</p>}
          {shareState.status === 'manual' && (
            <label style={{ fontSize: 13, color: brand.forest, display: 'flex', flexDirection: 'column', gap: 6 }}>
              Copy this link to share the program:
              <input readOnly value={shareState.url} onFocus={(e) => e.target.select()} style={{ fontFamily: fonts.body, fontSize: 12, padding: 8, borderRadius: 8, border: `1px solid ${brand.warm}` }} />
            </label>
          )}
          <button type="button" onClick={handleDelete} style={{ ...textButton, alignSelf: 'flex-start', color: brand.stone }}>Delete this program</button>
        </div>
      }
    />
  );
};
