import { describe, expect, it } from 'vitest';
import { screenForRedFlags } from '../../src/lib/safety';

describe('red-flag screening', () => {
  it.each([
    ['Lower back pain with numbness down my leg', 'nerve'],
    ['Tingling in my fingers and neck pain', 'nerve'],
    ['Back pain and trouble controlling my bladder', 'cauda-equina'],
    ['My knee keeps giving way on stairs', 'weakness'],
    ['Wrist pain after I fell off my bike', 'trauma'],
    ['Heard a pop in my ankle playing football', 'trauma'],
    ['Back pain with fever and chills', 'systemic'],
    ['Back pain that wakes me up at night', 'night-pain'],
    ['Shoulder pain and chest pain when walking', 'cardio-neuro'],
    ['My calf is swollen and sore', 'inflammation'],
    ['Knee is swollen, hot and red', 'inflammation'],
    ['I cannot put weight on my foot', 'weight-bearing'],
    ['Suddenly severe pain in my lower back', 'sudden-severe'],
  ])('flags "%s"', (description, id) => {
    expect(screenForRedFlags(description).map((flag) => flag.id)).toContain(id);
  });

  it.each([
    'Sharp pain in my right shoulder when lifting overhead',
    'Stiffness in my lower back after sitting all day at work',
    'Knee pain when going up and down stairs',
    'Tight hip flexors from running, limited range of motion',
    'Neck pain and tension headaches from computer work',
    'Weak glutes and sore hips after long walks',
    'I want to fall asleep without a stiff neck',
  ])('does not flag everyday issues: "%s"', (description) => {
    expect(screenForRedFlags(description)).toEqual([]);
  });

  it('flags severe self-reported pain', () => {
    expect(screenForRedFlags('Sore back', 8).map((flag) => flag.id)).toEqual(['severe-pain']);
    expect(screenForRedFlags('Sore back', 7)).toEqual([]);
  });
});
