import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';
import PeriodicTab from './PeriodicTab';

const mockSpeak = window.speechSynthesis.speak as unknown as Mock;

describe('PeriodicTab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeak.mockClear();
    mockSpeak.mockImplementation(() => {});
  });

  afterEach(() => {
    // Wrap pending timers in act() to avoid "not wrapped in act" warnings
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  // Helper to trigger speech completion
  const finishSpeech = async () => {
    const calls = mockSpeak.mock.calls;
    if (calls.length > 0) {
      const lastCall = calls[calls.length - 1];
      const utterance = lastCall[0];
      if (utterance.onend) {
        await act(async () => {
          utterance.onend(new Event('end'));
        });
      }
    }
  };

  it('starts and stops periodic reminder', async () => {
    await act(async () => {
      render(<PeriodicTab />);
    });

    expect(screen.getByText('⏰ 办公间歇拉伸')).toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();

    const startBtn = screen.getByTitle('开启自动提醒');

    await act(async () => {
      fireEvent.click(startBtn);
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: '间歇拉伸已开启。' }),
    );

    await finishSpeech();

    expect(screen.getByTitle('停止提醒')).toBeInTheDocument();

    // Stop
    await act(async () => {
      fireEvent.click(screen.getByTitle('停止提醒'));
    });
    expect(screen.getByTitle('开启自动提醒')).toBeInTheDocument();
  });

  it('enters break mode and advances break steps with speech', async () => {
    await act(async () => {
      render(
        <PeriodicTab
          initialIntervalMinutes={15}
          initialTimeLeftSeconds={0}
          initialIsRunning={true}
        />,
      );
    });

    // When timeLeft is 0 and running, the effect schedules a 0ms timeout
    // that triggers the first break sequence.
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    // First break state
    expect(screen.getByText(/正在休息 \(1\/3\)/)).toBeInTheDocument();
    expect(screen.getByText(/s$/)).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalled();
    await finishSpeech();
    mockSpeak.mockClear();

    // Step 1 -> Step 2: 30 seconds + 1s speech delay
    await act(async () => {
      vi.advanceTimersByTime(30_000);
      vi.runOnlyPendingTimers();
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText(/正在休息 \(2\/3\)/)).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalled();
    await finishSpeech();
    mockSpeak.mockClear();

    // Step 2 -> Step 3
    await act(async () => {
      vi.advanceTimersByTime(30_000);
      vi.runOnlyPendingTimers();
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText(/正在休息 \(3\/3\)/)).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalled();
    await finishSpeech();
    mockSpeak.mockClear();

    // Step 3 -> Finish
    await act(async () => {
      vi.advanceTimersByTime(30_000);
      vi.runOnlyPendingTimers();
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
      vi.runOnlyPendingTimers();
    });

    // After finishing, break UI disappears and countdown reappears
    expect(screen.queryByText(/正在休息/)).not.toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();
  });
});
