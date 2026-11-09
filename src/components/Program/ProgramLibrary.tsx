import React from 'react';
import { Link } from 'react-router-dom';
import { libraryPrograms } from '../../data/exercises';
import { brand, fonts } from '../../theme';

/** Links to the predefined programs. Always available, even when the AI service is busy. */
export const ProgramLibrary: React.FC = () => (
  <section aria-labelledby="program-library">
    <h2 id="program-library" style={{ fontFamily: fonts.display, fontSize: 24, color: brand.forest, margin: '0 0 6px' }}>
      Browse ready-made programs
    </h2>
    <p style={{ fontSize: 14, color: brand.stone, margin: '0 0 16px' }}>
      Four-week programs with step-by-step instructions and video demonstrations from licensed physical therapists.
    </p>
    <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>
      {libraryPrograms.map((program) => (
        <li key={program.bodyPartId}>
          <Link
            to={`/program/${program.bodyPartId}`}
            style={{
              display: 'block', height: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 16,
              background: 'white', border: `1px solid ${brand.warm}`, textDecoration: 'none',
            }}
          >
            <span style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: brand.terracotta, fontWeight: 600 }}>
              {program.bodyPart}
            </span>
            <span style={{ display: 'block', fontFamily: fonts.display, fontSize: 'clamp(14px, 3.6vw, 16px)', color: brand.forest, marginTop: 4, lineHeight: 1.3 }}>
              {program.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);
