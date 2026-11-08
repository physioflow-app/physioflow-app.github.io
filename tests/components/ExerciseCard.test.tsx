import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from '../../src/components/Program/ExerciseCard';
import { Exercise } from '../../src/types';

const mockExercise: Exercise = {
  id: 'test-exercise',
  name: 'Test Exercise',
  description: 'A test exercise description',
  instructions: ['Step 1: Do this', 'Step 2: Do that', 'Step 3: Finish'],
  sets: 3,
  reps: 10,
  videoUrl: 'https://www.youtube.com/embed/test123',
  difficulty: 'beginner',
  targetArea: 'Test Area',
};

describe('ExerciseCard', () => {
  const mockOnToggleComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps instructions available when no matching video is available', () => {
    render(<ExerciseCard exercise={{ ...mockExercise, videoUrl: '' }} isCompleted={false} onToggleComplete={mockOnToggleComplete} />);
    expect(screen.queryByRole('button', { name: 'Watch Video' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Steps' }));
    expect(screen.getByText('Step 1: Do this')).toBeVisible();
  });

  it('should render exercise name and description', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.getByText('Test Exercise')).toBeInTheDocument();
    expect(screen.getByText('A test exercise description')).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.getByText('beginner')).toBeInTheDocument();
  });

  it('should display sets and reps', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    // Updated: now uses × instead of "x"
    expect(screen.getByText((_, el) => el?.textContent === '3 × 10')).toBeInTheDocument();
  });

  it('should display target area', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.getByText('Test Area')).toBeInTheDocument();
  });

  it('should show video when Watch Video button is clicked', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    const watchButton = screen.getByText('Watch Video');
    fireEvent.click(watchButton);

    expect(screen.getByText('Hide Video')).toBeInTheDocument();
    expect(screen.getByTitle('Test Exercise')).toBeInTheDocument();
  });

  it('should show instructions when View Steps button is clicked', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    const stepsButton = screen.getByText('View Steps');
    fireEvent.click(stepsButton);

    expect(screen.getByText('Hide Steps')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Do this')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Do that')).toBeInTheDocument();
  });

  it('should call onToggleComplete when checkbox is clicked', () => {
    render(<ExerciseCard exercise={mockExercise} isCompleted={false} onToggleComplete={mockOnToggleComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Test Exercise complete' }));
    expect(mockOnToggleComplete).toHaveBeenCalledTimes(1);
  });

  it('offers a video search when no verified video is available', () => {
    render(<ExerciseCard exercise={{ ...mockExercise, videoUrl: '' }} isCompleted={false} onToggleComplete={mockOnToggleComplete} />);
    const link = screen.getByRole('link', { name: /Find a Video/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('youtube.com/results?search_query=Bob%20and%20Brad%20Test%20Exercise'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('shows sets or reps on their own', () => {
    const { rerender } = render(<ExerciseCard exercise={{ ...mockExercise, reps: undefined }} isCompleted={false} onToggleComplete={mockOnToggleComplete} />);
    expect(screen.getByText('3 sets')).toBeInTheDocument();
    rerender(<ExerciseCard exercise={{ ...mockExercise, sets: undefined }} isCompleted={false} onToggleComplete={mockOnToggleComplete} />);
    expect(screen.getByText('10 reps')).toBeInTheDocument();
  });

  it('should show checkmark when completed', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        isCompleted={true}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    // Completed card has a top strip with sage color and checkbox filled with sage
    const svgCheckmark = document.querySelector('svg path[d="M5 13l4 4L19 7"]');
    expect(svgCheckmark).toBeInTheDocument();
  });

  it('should display duration instead of sets/reps when applicable', () => {
    const exerciseWithDuration: Exercise = {
      ...mockExercise,
      sets: undefined,
      reps: undefined,
      duration: '30 seconds each side',
    };

    render(
      <ExerciseCard
        exercise={exerciseWithDuration}
        isCompleted={false}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.getByText('30 seconds each side')).toBeInTheDocument();
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });
});
