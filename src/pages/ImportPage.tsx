import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decodeJson } from '../lib/encoding';
import { mergeBackup, parseBackup } from '../lib/backup';
import { readLocalStorage, writeLocalStorage } from '../hooks/useLocalStorage';
import { PROGRAMS_STORAGE_KEY } from '../hooks/useAIPrograms';
import { PROGRESS_STORAGE_KEY } from '../hooks/useProgress';
import { usePageMeta } from '../hooks/usePageMeta';
import { Program, UserProgress } from '../types';
import { MessagePage } from './MessagePage';

/** Only same-site paths, so the link cannot send visitors elsewhere. */
function safeNext(value: string | null): string {
  return value && /^\/(?!\/)[\w\-/]*$/.test(value) ? value : '/';
}

/**
 * Receives programs and progress from the old site (itzsid.github.io/physical-therapy),
 * whose browser storage this origin cannot read, then continues to the requested page.
 */
export const ImportPage: React.FC = () => {
  usePageMeta('Moving your programs');
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const next = safeNext(params.get('next'));
    const encoded = params.get('b');
    if (!encoded) {
      navigate(next, { replace: true });
      return;
    }
    decodeJson(encoded)
      .then((raw) => {
        const backup = parseBackup(JSON.stringify(raw));
        const merged = mergeBackup({
          programs: readLocalStorage<Program[]>(PROGRAMS_STORAGE_KEY, []),
          progress: readLocalStorage<UserProgress>(PROGRESS_STORAGE_KEY, { programs: {} }),
        }, backup);
        writeLocalStorage(PROGRAMS_STORAGE_KEY, merged.programs);
        writeLocalStorage(PROGRESS_STORAGE_KEY, merged.progress);
        navigate(next, { replace: true });
      })
      .catch(() => setError('We could not move your saved programs from the old site. Your data is still there.'));
  }, [hash, navigate]);

  if (error) return <MessagePage title="Could Not Move Your Programs">{error}</MessagePage>;
  return <MessagePage title="Moving your programs..." />;
};
