import React from 'react';
import { Program } from '../../types';

const brand = {
  forest: '#1B3A2D',
  sage: '#6B8F71',
  cream: '#FAF6F1',
  warm: '#F0E6D8',
  terracotta: '#C4704B',
  stone: '#8C8577',
};

interface AIProgramHistoryProps {
  programs: Program[];
  onSelect: (program: Program) => void;
  onDelete: (id: string) => void;
}

export const AIProgramHistory: React.FC<AIProgramHistoryProps> = ({
  programs,
  onSelect,
  onDelete,
}) => {
  if (programs.length === 0) return null;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 28, border: `1px solid ${brand.warm}` }}>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: brand.forest, margin: '0 0 16px' }}>
        Saved Programs
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {programs.map((program) => (
          <div
            key={program.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 14, borderRadius: 14,
              background: brand.cream, border: `1px solid ${brand.warm}`,
              transition: 'all 0.2s',
            }}
          >
            <button
              onClick={() => onSelect(program)}
              style={{ flex: 1, textAlign: 'left' as const, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: brand.forest, margin: 0 }}>{program.title}</p>
              <p style={{ fontSize: 12, color: brand.stone, marginTop: 4 }}>
                {program.bodyPart} &middot; {program.duration} weeks
                {program.searchQuery && <span style={{ fontStyle: 'italic' }}> &middot; &ldquo;{program.searchQuery}&rdquo;</span>}
              </p>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(program.id); }}
              style={{ marginLeft: 12, padding: 6, color: brand.stone, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
              title="Delete program"
              aria-label={`Delete ${program.title}`}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
