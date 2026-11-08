import React from 'react';
import { RedFlag } from '../../lib/safety';
import { brand, fonts } from '../../theme';
import { primaryButton, secondaryButton } from '../common/styles';

interface SafetyCheckProps {
  flags: RedFlag[];
  /** Explanation from the AI, when it declined to build a program. */
  reason?: string;
  onEdit: () => void;
  onContinue: () => void;
}

export const SafetyCheck: React.FC<SafetyCheckProps> = ({ flags, reason, onEdit, onContinue }) => (
  <section
    role="alert"
    aria-labelledby="safety-check-title"
    style={{ background: brand.dangerBg, border: `1px solid ${brand.dangerBorder}`, borderRadius: 20, padding: 'clamp(18px, 4vw, 28px)' }}
  >
    <h2 id="safety-check-title" style={{ fontFamily: fonts.display, fontSize: 22, color: brand.danger, margin: '0 0 8px' }}>
      Please get this checked first
    </h2>
    <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: 0 }}>
      Some of what you described can be a sign of a problem that a doctor or physical therapist should
      assess before you start exercising.
    </p>
    {reason && <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: '10px 0 0' }}>{reason}</p>}
    {flags.length > 0 && (
      <ul style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: '12px 0 0', paddingLeft: 20 }}>
        {flags.map((flag) => <li key={flag.id}>{flag.label}</li>)}
      </ul>
    )}
    <p style={{ fontSize: 14, color: brand.charcoal, lineHeight: 1.7, margin: '12px 0 0', fontWeight: 600 }}>
      If symptoms are sudden or severe — such as loss of bladder or bowel control, chest pain, or new weakness —
      seek urgent medical care now.
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
      <button type="button" onClick={onEdit} style={primaryButton}>Edit my description</button>
      <button type="button" onClick={onContinue} style={{ ...secondaryButton, fontSize: 13 }}>
        A clinician has cleared me to exercise — continue
      </button>
    </div>
  </section>
);
