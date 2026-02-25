import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WorkoutTimer from './page';

describe('WorkoutTimer page', () => {
  it('renders workout mode by default', async () => {
    await act(async () => {
      render(<WorkoutTimer />);
    });

    // Tabs
    expect(screen.getByText('专注锻炼')).toBeInTheDocument();
    expect(screen.getByText('间歇拉伸')).toBeInTheDocument();

    // Default content comes from WorkoutTab
    expect(screen.getByText('💪 灵动健身 (FlexWorkout)')).toBeInTheDocument();
  });

  it('switches to periodic mode when tab is clicked', async () => {
    await act(async () => {
      render(<WorkoutTimer />);
    });

    const periodicTab = screen.getByText('间歇拉伸');

    await act(async () => {
      fireEvent.click(periodicTab);
    });

    // Header from PeriodicTab should be visible
    expect(screen.getByText('⏰ 办公间歇拉伸')).toBeInTheDocument();
  });
});
