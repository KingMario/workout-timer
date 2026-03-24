import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WorkoutTimer from './page';

describe('WorkoutTimer page', () => {
  it('shows disclaimer notice by default and hides it after agreement', async () => {
    localStorage.clear();

    await act(async () => {
      render(<WorkoutTimer />);
    });

    expect(screen.getByText('同意并关闭')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('同意并关闭'));
    });

    expect(screen.queryByText('同意并关闭')).not.toBeInTheDocument();
    expect(localStorage.getItem('disclaimerAgreed')).toBe('true');
    expect(localStorage.getItem('disclaimerAgreedAt')).not.toBeNull();
  });

  it('does not show disclaimer notice after agreement was persisted', async () => {
    localStorage.setItem('disclaimerAgreed', 'true');

    await act(async () => {
      render(<WorkoutTimer />);
    });

    expect(screen.queryByText('同意并关闭')).not.toBeInTheDocument();
  });

  it('renders workout mode by default', async () => {
    localStorage.clear();

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
    localStorage.clear();

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
