import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Program, UserProgress } from '../../types';
import { createBackup, downloadJson, parseBackup, Backup } from '../../lib/backup';
import { dateKey, findSession, getSessions, totalPercent } from '../../lib/sessions';
import { brand, fonts } from '../../theme';
import { card, textButton } from '../common/styles';

interface BackupControlsProps {
  programs: Program[];
  progress: UserProgress;
  onImport: (backup: Backup) => number;
}

/** Export/import of everything stored in this browser. */
export const BackupControls: React.FC<BackupControlsProps> = ({ programs, progress, onImport }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const hasData = programs.length > 0 || Object.keys(progress.programs).length > 0;

  const handleExport = () => {
    downloadJson(`physioflow-backup-${dateKey()}.json`, createBackup(programs, progress));
    setMessage({ text: 'Backup downloaded. Keep it somewhere safe, or import it on another device.' });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const added = onImport(parseBackup(await file.text()));
      setMessage({ text: added ? `Imported ${added} program${added === 1 ? '' : 's'}.` : 'Backup imported. Your programs were already up to date.' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not import that file.', error: true });
    }
  };

  return (
    <div style={{ fontSize: 13, color: brand.stone }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 16px' }}>
        <span>{hasData ? 'Saved only in this browser.' : 'Used PhysioFlow on another device?'}</span>
        {hasData && <button type="button" onClick={handleExport} style={textButton}>Export backup</button>}
        <button type="button" onClick={() => fileInput.current?.click()} style={textButton}>Import backup</button>
        <input ref={fileInput} type="file" accept="application/json,.json" onChange={handleImport} hidden aria-label="Backup file" />
      </div>
      {message && (
        <p role="status" style={{ fontSize: 13, margin: '8px 0 0', color: message.error ? brand.danger : brand.forest }}>{message.text}</p>
      )}
    </div>
  );
};

interface AIProgramHistoryProps {
  /** Saved AI programs, and ready-made programs the user has started. */
  programs: Program[];
  progress: UserProgress;
  onDelete: (id: string) => void;
  footer?: React.ReactNode;
}

function programLink(program: Program) {
  return program.isAIGenerated ? `/plan/${program.id}` : `/program/${program.bodyPartId}`;
}

export const AIProgramHistory: React.FC<AIProgramHistoryProps> = ({ programs, progress, onDelete, footer }) => {
  if (programs.length === 0) return null;
  const today = dateKey();

  const handleDelete = (program: Program) => {
    if (window.confirm(`Delete "${program.title}" and its progress?`)) onDelete(program.id);
  };

  return (
    <section aria-labelledby="your-programs" style={card}>
      <h2 id="your-programs" style={{ fontFamily: fonts.display, fontSize: 20, color: brand.forest, margin: '0 0 12px' }}>
        Your Programs
      </h2>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
        {programs.map((program) => {
          const entry = progress.programs[program.id];
          const sessions = getSessions(entry, program);
          const percent = totalPercent(sessions, program);
          const week = Math.min(entry?.currentWeek || 1, program.weeks.length);
          const todays = findSession(sessions, today, week);
          const status = todays?.completed.length ? 'Trained today' : `Week ${week} of ${program.duration}`;
          return (
            <li key={program.id} style={{ display: 'flex', alignItems: 'center', borderRadius: 14, background: brand.cream, border: `1px solid ${brand.warm}` }}>
              <Link to={programLink(program)} style={{ flex: 1, minWidth: 0, textDecoration: 'none', padding: '12px 14px' }}>
                <span style={{ display: 'block', fontFamily: fonts.display, fontSize: 16, color: brand.forest }}>{program.title}</span>
                <span style={{ display: 'block', fontSize: 12, color: brand.stone, marginTop: 2 }}>
                  {program.bodyPart} &middot; {program.duration} weeks &middot; {percent}% done
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }} aria-hidden="true">
                  <span style={{ flex: 1, maxWidth: 220, height: 5, borderRadius: 100, background: brand.warm }}>
                    <span style={{ display: 'block', width: `${percent}%`, height: 5, borderRadius: 100, background: brand.sage }} />
                  </span>
                  <span style={{ fontSize: 12, color: brand.forest, fontWeight: 600 }}>{status}</span>
                </span>
              </Link>
              {program.isAIGenerated && (
                <button
                  type="button"
                  onClick={() => handleDelete(program)}
                  style={{ margin: '0 8px', padding: 8, color: brand.stone, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                  title="Delete program"
                  aria-label={`Delete ${program.title}`}
                >
                  <svg aria-hidden="true" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
    </section>
  );
};
