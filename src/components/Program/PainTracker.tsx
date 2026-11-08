import React from 'react';
import { PAIN_HIGH_THRESHOLD, PAIN_STOP_THRESHOLD } from '../../lib/safety';
import { PainTrend } from '../../lib/sessions';
import { brand, fonts } from '../../theme';

interface PainTrackerProps {
  todayPain?: number;
  history: { date: string; pain: number }[];
  trend: PainTrend;
  onChange: (pain: number) => void;
}

function Sparkline({ history }: { history: { date: string; pain: number }[] }) {
  const points = history.slice(-14);
  const width = 300;
  const height = 64;
  const x = (index: number) => (points.length === 1 ? width / 2 : 8 + (index * (width - 16)) / (points.length - 1));
  const y = (pain: number) => 6 + ((10 - pain) * (height - 12)) / 10;
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <figure style={{ margin: '12px 0 0' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`Pain over your last ${points.length} logged days: from ${first.pain}/10 to ${last.pain}/10`}
        preserveAspectRatio="none"
        style={{ display: 'block', background: brand.cream, borderRadius: 10 }}
      >
        <line x1="0" x2={width} y1={y(PAIN_STOP_THRESHOLD)} y2={y(PAIN_STOP_THRESHOLD)} stroke={brand.terracotta} strokeDasharray="4 4" strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke" />
        <polyline
          fill="none"
          stroke={brand.forest}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          points={points.map((point, index) => `${x(index)},${y(point.pain)}`).join(' ')}
        />
        {points.map((point, index) => (
          // A zero-length round-capped line stays circular when the chart is stretched.
          <line
            key={point.date}
            x1={x(index)} x2={x(index)} y1={y(point.pain)} y2={y(point.pain)}
            stroke={point.pain > PAIN_STOP_THRESHOLD ? brand.terracotta : brand.forest}
            strokeWidth="7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: brand.stone, marginTop: 4 }}>
        <span>{first.date}</span>
        <span>dashed line = {PAIN_STOP_THRESHOLD}/10</span>
        <span>{last.date}</span>
      </figcaption>
    </figure>
  );
}

export const PainTracker: React.FC<PainTrackerProps> = ({ todayPain, history, trend, onChange }) => {
  let note: { text: string; tone: 'danger' | 'warn' | 'good' } | null = null;
  if (todayPain !== undefined && todayPain >= PAIN_HIGH_THRESHOLD) {
    note = { tone: 'danger', text: 'That is high. Skip today or do only the gentlest exercises, and talk to a clinician if it does not settle within a day or two.' };
  } else if (trend === 'worsening') {
    note = { tone: 'warn', text: 'Your pain has been rising over recent sessions. Ease off the harder exercises, and check in with a physical therapist or doctor if it keeps climbing.' };
  } else if (trend === 'improving') {
    note = { tone: 'good', text: 'Your pain is trending down. Nice work — keep going.' };
  }
  const tones = {
    danger: { color: brand.danger, background: brand.dangerBg },
    warn: { color: '#92400e', background: '#fef3c7' },
    good: { color: brand.forest, background: `${brand.sage}18` },
  };

  return (
    <div>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ fontFamily: fonts.display, fontSize: 15, color: brand.forest, marginBottom: 8 }}>
          How is your pain today?
        </legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: 11 }, (_, pain) => {
            const selected = todayPain === pain;
            return (
              <button
                key={pain}
                type="button"
                aria-pressed={selected}
                aria-label={`Pain ${pain} out of 10`}
                onClick={() => onChange(pain)}
                style={{
                  width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: fonts.body,
                  border: `1px solid ${selected ? brand.forest : brand.warm}`,
                  background: selected ? (pain > PAIN_STOP_THRESHOLD ? brand.terracotta : brand.forest) : 'white',
                  color: selected ? 'white' : brand.charcoal,
                }}
              >
                {pain}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: brand.stone, margin: '6px 0 0' }}>0 = no pain, 10 = worst imaginable</p>
      </fieldset>
      {note && (
        <p role="status" style={{ fontSize: 13, lineHeight: 1.6, borderRadius: 10, padding: '10px 12px', margin: '12px 0 0', ...tones[note.tone] }}>
          {note.text}
        </p>
      )}
      {history.length >= 2 && <Sparkline history={history} />}
    </div>
  );
};
