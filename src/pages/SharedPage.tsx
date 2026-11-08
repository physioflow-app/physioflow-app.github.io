import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAIPrograms } from '../hooks/useAIPrograms';
import { usePageMeta } from '../hooks/usePageMeta';
import { readSharedProgram } from '../lib/share';
import { MessagePage } from './MessagePage';

/** Opens a program from a share link, saves a copy, and shows it. */
export const SharedPage: React.FC = () => {
  usePageMeta('Shared program');
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { getProgram, saveProgram } = useAIPrograms();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    readSharedProgram(hash)
      .then((program) => {
        if (!getProgram(program.id)) saveProgram(program);
        navigate(`/plan/${program.id}`, { replace: true });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not open this share link.'));
  }, [hash, getProgram, saveProgram, navigate]);

  if (error) return <MessagePage title="Could Not Open Program">{error}</MessagePage>;
  return <MessagePage title="Opening shared program..." />;
};
