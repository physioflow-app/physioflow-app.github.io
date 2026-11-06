import React, { useState } from 'react';

const brand = {
  forest: '#1B3A2D',
  sage: '#6B8F71',
  cream: '#FAF6F1',
  warm: '#F0E6D8',
  terracotta: '#C4704B',
  charcoal: '#2C2C2C',
  stone: '#8C8577',
};

interface AIInputFormProps {
  onSubmit: (description: string) => void;
  isDisabled: boolean;
}

const EXAMPLE_PROMPTS = [
  'Sharp pain in my right shoulder when lifting overhead',
  'Stiffness in my lower back after sitting all day at work',
  'Knee pain when going up and down stairs',
  'Tight hip flexors from running, limited range of motion',
  'Neck pain and tension headaches from computer work',
];

export const AIInputForm: React.FC<AIInputFormProps> = ({ onSubmit, isDisabled }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) onSubmit(description.trim());
  };

  const canSubmit = !isDisabled && description.trim();

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 28, border: `1px solid ${brand.warm}` }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: brand.forest, margin: '0 0 6px' }}>
        Describe Your Issue
      </h2>
      <p style={{ fontSize: 13, color: brand.stone, marginBottom: 16 }}>
        Tell us about your pain, stiffness, or mobility issue and our AI will create a personalized program.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          aria-label="Describe your issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I have pain in my lower back when bending forward, especially in the morning..."
          disabled={isDisabled}
          style={{
            width: '100%', minHeight: 100, borderRadius: 12,
            border: `2px solid ${brand.warm}`, padding: 16,
            fontSize: 14, color: brand.charcoal, background: brand.cream,
            fontFamily: "'DM Sans', sans-serif", resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: 12, width: '100%', padding: '14px 32px',
            borderRadius: 100, border: 'none',
            background: canSubmit ? brand.forest : brand.warm,
            color: canSubmit ? 'white' : brand.stone,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            letterSpacing: '0.02em',
            transition: 'all 0.2s',
          }}
        >
          Generate My Program &rarr;
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 11, color: brand.stone, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Try an example</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setDescription(prompt)}
              disabled={isDisabled}
              style={{
                padding: '6px 14px', borderRadius: 100,
                border: `1px solid ${brand.warm}`, background: 'white',
                fontSize: 12, color: brand.stone, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
