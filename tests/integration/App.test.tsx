import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { createShareUrl } from '../../src/lib/share';
import { parseProgram } from '../../src/lib/programParser';

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

const storedJson = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  window.history.replaceState(null, '', '/');
  fetchMock = vi.fn().mockResolvedValue(response());
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const generateButton = () => screen.getByRole('button', { name: 'Generate My Program →' });

async function generate() {
  fireEvent.click(screen.getByRole('button', { name: 'Knee pain when going up and down stairs', exact: true }));
  fireEvent.click(generateButton());
  await screen.findByRole('heading', { name: 'Test knee recovery' });
}

describe('complete application flow', () => {
  it('generates, auto-saves, logs a session and pain, survives a reload, resets, and deletes a program', async () => {
    const app = render(<App />);
    expect(screen.getByRole('link', { name: 'Siddharth Choudhary' })).toHaveAttribute('href', 'https://itzsid.github.io/');
    expect(generateButton()).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    expect(generateButton()).toBeDisabled();
    await generate();

    // Saved immediately, with its own URL.
    const [saved] = storedJson('pt-ai-programs');
    expect(window.location.pathname).toBe(`/plan/${saved.id}`);
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.contents[0].parts[0].text).toContain('Knee pain when going up and down stairs');
    expect(screen.getByText('An explanation.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View Steps' }));
    expect(screen.getByText('Slide your heel.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Watch Video' }));
    expect(screen.getByTitle('Heel Slides')).toHaveAttribute('src', expect.stringMatching(/^https:\/\/www.youtube.com\/embed\//));

    fireEvent.click(screen.getByRole('button', { name: 'Mark Heel Slides complete' }));
    expect(screen.getByRole('button', { name: 'Mark Heel Slides complete' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Done for today ✓')).toBeInTheDocument();
    expect(screen.getByText('1/4 sessions this week')).toBeInTheDocument();
    expect(screen.getByText('13%')).toBeInTheDocument();
    expect(screen.getByText(/1-day streak/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pain 8 out of 10' }));
    expect(screen.getByText(/That is high/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Week 2/ }));
    expect(screen.getByRole('heading', { name: 'Quad Sets' })).toBeVisible();

    // A reload keeps the program and its progress.
    app.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Quad Sets' })).toBeInTheDocument();
    expect(screen.getByText('13%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('link', { name: /Test knee recovery Knees · 2 weeks · 13% done/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Test knee recovery/ }));

    vi.mocked(window.confirm).mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Reset', exact: true }));
    expect(screen.getByText('13%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset', exact: true }));
    expect(screen.getByRole('heading', { name: 'Heel Slides' })).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark Heel Slides complete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete this program' }));
    expect(window.location.pathname).toBe('/');
    expect(screen.queryByRole('heading', { name: 'Your Programs' })).not.toBeInTheDocument();
    expect(storedJson('pt-ai-programs')).toEqual([]);
    expect(storedJson('pt-progress').programs[saved.id]).toBeUndefined();
  });

  it('opens programs by URL and reports programs missing from this browser', () => {
    window.history.replaceState(null, '', '/plan/ai-missing');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Program Not Found' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('recovers from malformed AI output and preserves the input for retry', async () => {
    fetchMock.mockResolvedValueOnce(response({ weeks: [{ exercises: [] }] }));
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Synthetic knee example' } });
    fireEvent.click(generateButton());
    await screen.findByText(/Each week must contain/);
    expect(screen.getByRole('textbox')).toHaveValue('Synthetic knee example');
    fireEvent.click(generateButton());
    await screen.findByRole('heading', { name: 'Test knee recovery' });
    fireEvent.click(screen.getByRole('link', { name: 'Generate Another' }));
    expect(screen.getByRole('textbox')).toBeVisible();
  });

  it('shows service errors without retrying a permanent client error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Synthetic input' } });
    fireEvent.click(generateButton());
    await screen.findByText('AI service error (400). Please try again.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends optional intake details with the request', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Stiff lower back' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Pain right now' }), { target: { value: '3' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Time per session' }), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Resistance band' }));
    fireEvent.click(generateButton());
    await screen.findByRole('heading', { name: 'Test knee recovery' });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    const text = payload.contents[0].parts[0].text;
    expect(text).toContain('Current pain: 3/10');
    expect(text).toContain('bodyweight, Resistance band');
    expect(payload.system_instruction.parts[0].text).toContain('Each week should have 2-3 exercises');
  });
});

describe('safety screening', () => {
  it('stops before generating when red-flag symptoms are described, and continues once cleared', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lower back pain with numbness down my left leg' } });
    fireEvent.click(generateButton());
    expect(screen.getByRole('heading', { name: 'Please get this checked first' })).toBeInTheDocument();
    expect(screen.getByText(/Numbness, tingling/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Edit my description' }));
    expect(screen.getByRole('textbox')).toHaveValue('Lower back pain with numbness down my left leg');
    fireEvent.click(generateButton());
    fireEvent.click(screen.getByRole('button', { name: /A clinician has cleared me/ }));
    await screen.findByRole('heading', { name: 'Test knee recovery' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).contents[0].parts[0].text).toContain('cleared them for exercise');
  });

  it('shows the AI explanation when the model declines to build a program', async () => {
    fetchMock.mockResolvedValueOnce(response({ redFlag: true, reason: 'Please see a doctor about this first.' }));
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Something worrying' } });
    fireEvent.click(generateButton());
    await screen.findByText('Please see a doctor about this first.');
    expect(storedJson('pt-ai-programs') ?? []).toEqual([]);
  });
});

describe('library, sharing and legacy URLs', () => {
  it('links to ready-made programs and handles unknown or aliased body parts', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: /Neck Pain Relief/ }));
    expect(window.location.pathname).toBe('/program/neck');
    expect(screen.getByRole('tab', { name: /Week 1/ })).toBeInTheDocument();
    cleanup();

    window.history.replaceState(null, '', '/program/neck-back');
    render(<App />);
    expect(window.location.pathname).toBe('/program/neck');
    cleanup();

    window.history.replaceState(null, '', '/program/does-not-exist');
    render(<App />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Body Part Not Found' })).toBeInTheDocument());
  });

  it('rewrites old hash URLs to real paths', () => {
    window.history.replaceState(null, '', '/#/program/knees');
    render(<App />);
    expect(window.location.pathname).toBe('/program/knees');
    expect(window.location.hash).toBe('');
  });

  it('opens a share link, saves a copy, and shows it', async () => {
    const program = parseProgram(JSON.stringify(rawProgram));
    const url = new URL(await createShareUrl(program, 'https://example.test'));
    window.history.replaceState(null, '', url.pathname + url.hash);
    await act(async () => { render(<App />); });
    await screen.findByRole('heading', { name: 'Test knee recovery' });
    expect(window.location.pathname).toBe(`/plan/${program.id}`);
    expect(storedJson('pt-ai-programs')[0].id).toBe(program.id);
    expect(screen.getByRole('button', { name: 'Watch Video' })).toBeInTheDocument();
  });

  it('reports damaged share links', async () => {
    window.history.replaceState(null, '', '/shared#p=z.not-valid');
    await act(async () => { render(<App />); });
    await screen.findByRole('heading', { name: 'Could Not Open Program' });
  });
});

describe('moving from the old site', () => {
  it('imports programs and progress handed over by the old site, then continues', async () => {
    const { encodeJson } = await import('../../src/lib/encoding');
    const { createBackup } = await import('../../src/lib/backup');
    const program = parseProgram(JSON.stringify(rawProgram));
    const progress = { programs: { 'neck-program': { programId: 'neck-program', completedExercises: {}, currentWeek: 2, startedAt: 'a', lastUpdated: 'b', sessions: [] } } };
    const encoded = await encodeJson(createBackup([program], progress));
    window.history.replaceState(null, '', `/import#b=${encoded}&next=/program/neck`);
    await act(async () => { render(<App />); });
    await waitFor(() => expect(window.location.pathname).toBe('/program/neck'));
    expect(storedJson('pt-ai-programs')[0].id).toBe(program.id);
    expect(screen.getByRole('tab', { name: /Week 2/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('ignores off-site destinations', async () => {
    window.history.replaceState(null, '', '/import#next=//evil.test');
    await act(async () => { render(<App />); });
    await waitFor(() => expect(window.location.pathname).toBe('/'));
  });
});
