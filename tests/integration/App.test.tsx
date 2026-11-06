import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

const rawProgram = {
  title: 'Test knee recovery', bodyPart: 'Knees', description: 'A progressive program.',
  whyItExists: 'An explanation.', howExercisesHelp: 'How the exercises help.', duration: 4,
  weeks: [
    { week: 1, focus: 'Mobility', exercises: [{ name: 'Heel Slides', description: 'Gentle mobility.', instructions: ['Lie down.', 'Slide your heel.'], sets: 2, reps: 10, targetArea: 'Knees' }] },
    { week: 2, focus: 'Strength', exercises: [{ name: 'Quad Sets', instructions: ['Tighten your quadriceps.'], duration: '30 seconds' }] },
  ],
};

function response(program: unknown = rawProgram) {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(program) }] } }] }) };
}

let stored: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  stored = new Map();
  vi.mocked(localStorage.getItem).mockImplementation((key) => stored.get(key) ?? null);
  vi.mocked(localStorage.setItem).mockImplementation((key, value) => { stored.set(key, value); });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  window.location.hash = '#/';
  fetchMock = vi.fn().mockResolvedValue(response());
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function generate() {
  fireEvent.click(screen.getByRole('button', { name: 'Knee pain when going up and down stairs', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Generate My Program →' }));
  await screen.findByRole('heading', { name: 'Test knee recovery' });
}

describe('complete application flow', () => {
  it('generates, opens steps/video, tracks weeks, saves, reloads, resets, and deletes a program', async () => {
    const app = render(<App />);
    expect(screen.getByRole('link', { name: 'Siddharth Choudhary' })).toHaveAttribute('href', 'https://itzsid.github.io/');
    expect(screen.getByRole('button', { name: 'Generate My Program →' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Generate My Program →' })).toBeDisabled();
    await generate();
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.contents[0].parts[0].text).toContain('Knee pain when going up and down stairs');
    expect(screen.getByText('An explanation.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Steps' }));
    expect(screen.getByText('Slide your heel.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Watch Video' }));
    expect(screen.getByTitle('Heel Slides')).toHaveAttribute('src', expect.stringMatching(/^https:\/\/www.youtube.com\/embed\//));
    fireEvent.click(screen.getByRole('button', { name: 'Mark Heel Slides complete' }));
    expect(screen.getByRole('button', { name: 'Mark Heel Slides complete' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('50%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Week 2/ }));
    expect(screen.getByRole('heading', { name: 'Quad Sets' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save Program', exact: true }));
    expect(screen.getByRole('button', { name: 'Program Saved' })).toBeDisabled();
    expect(JSON.parse(stored.get('pt-ai-programs')!)).toHaveLength(1);
    app.unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Test knee recovery Knees/ }));
    expect(screen.getByRole('heading', { name: 'Quad Sets' })).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Reset', exact: true }));
    expect(screen.getByText('50%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset', exact: true }));
    expect(screen.getByRole('heading', { name: 'Heel Slides' })).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Test knee recovery' }));
    expect(screen.queryByRole('heading', { name: 'Saved Programs' })).not.toBeInTheDocument();
    expect(JSON.parse(stored.get('pt-ai-programs')!)).toEqual([]);
  });

  it('recovers from malformed AI output and preserves the input for retry', async () => {
    fetchMock.mockResolvedValueOnce(response({ weeks: [{ exercises: [] }] }));
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Synthetic knee example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate My Program →' }));
    await screen.findByText(/Each week must contain/);
    expect(screen.getByRole('textbox')).toHaveValue('Synthetic knee example');
    fireEvent.click(screen.getByRole('button', { name: 'Generate My Program →' }));
    await screen.findByRole('heading', { name: 'Test knee recovery' });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Another' }));
    expect(screen.getByRole('textbox')).toBeVisible();
  });

  it('shows service errors without retrying a permanent client error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Synthetic input' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate My Program →' }));
    await screen.findByText('AI service error (400). Please try again.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('opens predefined programs and handles unknown body parts', async () => {
    window.location.hash = '#/program/neck';
    render(<App />);
    expect(screen.getByRole('button', { name: /Week 1/ })).toBeInTheDocument();
    cleanup();
    window.location.hash = '#/program/does-not-exist';
    render(<App />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Body Part Not Found' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
