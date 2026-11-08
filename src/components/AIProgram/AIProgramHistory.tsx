import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Program, UserProgress } from '../../types';
import { createBackup, downloadJson, parseBackup, Backup } from '../../lib/backup';
import { dateKey, getSessions, totalPercent } from '../../lib/sessions';
import { brand, fonts } from '../../theme';
import { card, textButton } from '../common/styles';

interface AIProgramHistoryProps {
  programs: Program[];
  progress: UserProgress;
  onDelete: (id: string) => void;
  onImport: (backup: Backup) => number;
}

export const AIProgramHistory: React.FC<AIProgramHistoryProps> = ({ programs, progress, onDelete, onImport }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

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

  const handleDelete = (program: Program) => {
    if (window.confirm(`Delete "${program.title}" and its progress?`)) onDelete(program.id);
  };

  return (
    <section aria-labelledby="your-programs" style={card}>
      {programs.length > 0 && (
        <>
          <h2 id="your-programs" style={{ fontFamily: fonts.display, fontSize: 20, color: brand.forest, margin: '0 0 16px' }}>
            Your Programs
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
            {programs.map((program) => {
              const percent = totalPercent(getSessions(progress.programs[program.id], program), program);
              return (
                <li
                  key={program.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 14, borderRadius: 14, background: brand.cream, border: `1px solid ${brand.warm}`,
                  }}
                >
                  <Link to={`/plan/${program.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <span style={{ display: 'block', fontFamily: fonts.display, fontSize: 15, color: brand.forest }}>{program.title}</span>
                    <span style={{ display: 'block', fontSize: 12, color: brand.stone, marginTop: 4 }}>
                      {program.bodyPart} &middot; {program.duration} weeks &middot; {percent}% done
                      {program.searchQuery && <span style={{ fontStyle: 'italic' }}> &middot; &ldquo;{program.searchQuery}&rdquo;</span>}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(program)}
                    style={{ marginLeft: 12, padding: 6, color: brand.stone, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                    title="Delete program"
                    aria-label={`Delete ${program.title}`}
                  >
                    <svg aria-hidden="true" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: programs.length ? 16 : 0, fontSize: 13, color: brand.stone }}>
        <span>Your programs are stored only in this browser.</span>
        {programs.length > 0 && <button type="button" onClick={handleExport} style={textButton}>Export backup</button>}
        <button type="button" onClick={() => fileInput.current?.click()} style={textButton}>Import backup</button>
        <input ref={fileInput} type="file" accept="application/json,.json" onChange={handleImport} hidden aria-label="Backup file" />
      </div>
      {message && (
        <p role="status" style={{ fontSize: 13, margin: '10px 0 0', color: message.error ? brand.danger : brand.forest }}>{message.text}</p>
      )}
    </section>
  );
};
