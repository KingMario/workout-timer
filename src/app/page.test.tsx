import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WorkoutTimer from './page';

describe('WorkoutTimer page', () => {
  it('blocks app usage with the disclaimer dialog until agreement', async () => {
    localStorage.clear();

    await act(async () => {
      render(<WorkoutTimer />);
    });

    expect(
      screen.getByRole('dialog', { name: '使用前请确认免责声明' }),
    ).toBeInTheDocument();
    expect(screen.getByText('我已阅读并同意')).toBeInTheDocument();
    expect(
      screen.queryByText('💪 灵动健身 (FlexWorkout)'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('专注锻炼')).toBeDisabled();
    expect(screen.getByText('间歇拉伸')).toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByText('我已阅读并同意'));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('💪 灵动健身 (FlexWorkout)')).toBeInTheDocument();
    expect(localStorage.getItem('disclaimerAgreed')).toBe('true');
    expect(localStorage.getItem('disclaimerAgreedAt')).not.toBeNull();
  });

  it('does not show disclaimer notice after agreement was persisted', async () => {
    localStorage.setItem('disclaimerAgreed', 'true');

    await act(async () => {
      render(<WorkoutTimer />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders workout mode by default', async () => {
    localStorage.setItem('disclaimerAgreed', 'true');

    await act(async () => {
      render(<WorkoutTimer />);
    });

    // Tabs
    expect(screen.getByText('专注锻炼')).toBeInTheDocument();
    expect(screen.getByText('间歇拉伸')).toBeInTheDocument();

    // Default content comes from WorkoutTab
    expect(
      await screen.findByText('💪 灵动健身 (FlexWorkout)'),
    ).toBeInTheDocument();
  });

  it('switches to periodic mode when tab is clicked', async () => {
    localStorage.setItem('disclaimerAgreed', 'true');

    await act(async () => {
      render(<WorkoutTimer />);
    });

    await screen.findByText('💪 灵动健身 (FlexWorkout)');

    const periodicTab = screen.getByRole('tab', { name: '间歇拉伸' });

    await act(async () => {
      fireEvent.click(periodicTab);
    });

    // Header from PeriodicTab should be visible
    expect(await screen.findByText('⏰ 办公间歇拉伸')).toBeInTheDocument();
  });
});
