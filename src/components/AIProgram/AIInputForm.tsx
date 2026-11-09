import React, { useState } from 'react';
import { Equipment, FitnessLevel, IntakeDetails, IssueDuration } from '../../types';
import { EQUIPMENT_LABELS } from '../../lib/promptBuilder';
import { brand, fonts } from '../../theme';

interface AIInputFormProps {
  onSubmit: (description: string, details: IntakeDetails) => void;
  isDisabled: boolean;
  /** Restores a previous description, e.g. after an error or a safety check. */
  initialDescription?: string;
  initialDetails?: IntakeDetails;
  /** Shown under the form, e.g. a backup import link. */
  footer?: React.ReactNode;
}

const EXAMPLE_PROMPTS = [
  'Sharp pain in my right shoulder when lifting overhead',
  'Stiffness in my lower back after sitting all day at work',
  'Knee pain when going up and down stairs',
  'Tight hip flexors from running, limited range of motion',
  'Neck pain and tension headaches from computer work',
];

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: brand.forest };
const selectStyle: React.CSSProperties = {
  borderRadius: 10, border: `2px solid ${brand.warm}`, padding: '8px 10px', fontSize: 13,
  color: brand.charcoal, background: brand.cream, fontFamily: fonts.body,
};

export const AIInputForm: React.FC<AIInputFormProps> = ({ onSubmit, isDisabled, initialDescription = '', initialDetails = {}, footer }) => {
  const [description, setDescription] = useState(initialDescription);
  const [details, setDetails] = useState<IntakeDetails>(initialDetails);

  const update = <K extends keyof IntakeDetails>(key: K, value: IntakeDetails[K]) =>
    setDetails((previous) => ({ ...previous, [key]: value }));

  const toggleEquipment = (item: Equipment) => {
    const current = details.equipment ?? [];
    let next = current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
    // "No equipment" and specific equipment are mutually exclusive.
    next = item === 'none' ? next.filter((value) => value === 'none') : next.filter((value) => value !== 'none');
    update('equipment', next.length ? next : undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) onSubmit(description.trim(), details);
  };

  const canSubmit = !isDisabled && description.trim();
  const detailCount = Object.values(details).filter((value) => value !== undefined && (!Array.isArray(value) || value.length)).length;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(18px, 4vw, 28px)', border: `1px solid ${brand.warm}` }}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="issue-description" className="sr-only">Describe your issue</label>
        <textarea
          id="issue-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. My lower back hurts when I bend forward, especially in the morning"
          disabled={isDisabled}
          maxLength={2000}
          style={{
            width: '100%', minHeight: 100, borderRadius: 12,
            border: `2px solid ${brand.warm}`, padding: 16,
            fontSize: 14, color: brand.charcoal, background: brand.cream,
            fontFamily: fonts.body, resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12, color: brand.stone, margin: '0 0 6px' }}>Or try an example:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setDescription(prompt)}
                disabled={isDisabled}
                style={{
                  padding: '6px 14px', borderRadius: 16,
                  border: `1px solid ${brand.warm}`, background: 'white',
                  fontSize: 12, color: brand.stone, cursor: 'pointer',
                  fontFamily: fonts.body,
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'all 0.2s',
                  textAlign: 'left' as const,
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <details style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${brand.warm}`, padding: '10px 14px' }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: brand.forest }}>
            Add details for a better fit (optional){detailCount ? ` · ${detailCount} added` : ''}
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 14 }}>
            <label style={labelStyle}>
              Pain right now
              <select
                style={selectStyle}
                value={details.painLevel ?? ''}
                disabled={isDisabled}
                onChange={(e) => update('painLevel', e.target.value === '' ? undefined : Number(e.target.value))}
              >
                <option value="">Not specified</option>
                {Array.from({ length: 11 }, (_, value) => (
                  <option key={value} value={value}>{value}/10{value === 0 ? ' (none)' : value === 10 ? ' (worst)' : ''}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              How long have you had it?
              <select
                style={selectStyle}
                value={details.issueDuration ?? ''}
                disabled={isDisabled}
                onChange={(e) => update('issueDuration', (e.target.value || undefined) as IssueDuration | undefined)}
              >
                <option value="">Not specified</option>
                <option value="days">A few days</option>
                <option value="weeks">A few weeks</option>
                <option value="months">1-3 months</option>
                <option value="long-term">More than 3 months</option>
              </select>
            </label>
            <label style={labelStyle}>
              Fitness level
              <select
                style={selectStyle}
                value={details.fitnessLevel ?? ''}
                disabled={isDisabled}
                onChange={(e) => update('fitnessLevel', (e.target.value || undefined) as FitnessLevel | undefined)}
              >
                <option value="">Not specified</option>
                <option value="beginner">Beginner / not very active</option>
                <option value="intermediate">Moderately active</option>
                <option value="advanced">Very active</option>
              </select>
            </label>
            <label style={labelStyle}>
              Time per session
              <select
                style={selectStyle}
                value={details.minutesPerDay ?? ''}
                disabled={isDisabled}
                onChange={(e) => update('minutesPerDay', e.target.value === '' ? undefined : Number(e.target.value))}
              >
                <option value="">Not specified</option>
                <option value="10">About 10 minutes</option>
                <option value="20">About 20 minutes</option>
                <option value="30">About 30 minutes</option>
                <option value="45">45+ minutes</option>
              </select>
            </label>
          </div>
          <fieldset style={{ border: 'none', padding: 0, margin: '14px 0 4px' }}>
            <legend style={{ fontSize: 12, fontWeight: 600, color: brand.forest, marginBottom: 8 }}>Equipment you have</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((item) => {
                const selected = details.equipment?.includes(item) ?? false;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    disabled={isDisabled}
                    onClick={() => toggleEquipment(item)}
                    style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 12, cursor: 'pointer', fontFamily: fonts.body,
                      border: `1px solid ${selected ? brand.forest : brand.warm}`,
                      background: selected ? brand.forest : 'white',
                      color: selected ? 'white' : brand.stone,
                    }}
                  >
                    {EQUIPMENT_LABELS[item]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </details>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: 12, width: '100%', padding: '14px 32px',
            borderRadius: 100, border: 'none',
            background: canSubmit ? brand.forest : brand.warm,
            color: canSubmit ? 'white' : brand.stone,
            fontFamily: fonts.body, fontSize: 14, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            letterSpacing: '0.02em',
            transition: 'all 0.2s',
          }}
        >
          Generate My Program &rarr;
        </button>
      </form>

      {footer}
    </div>
  );
};
