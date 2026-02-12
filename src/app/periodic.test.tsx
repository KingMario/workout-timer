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
import WorkoutTimer from './page';

const mockSpeak = window.speechSynthesis.speak as unknown as Mock;

describe('WorkoutTimer - Periodic Mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeak.mockClear();
    mockSpeak.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
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

  it('switches to periodic mode and starts/stops reminder', async () => {
    await act(async () => {
      render(<WorkoutTimer />);
    });

    const periodicTab = screen.getByText('间歇提醒');
    fireEvent.click(periodicTab);

    expect(screen.getByText('⏰ 办公间歇提醒')).toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();

    const startBtn = screen.getByTitle('开启自动提醒');

    await act(async () => {
      fireEvent.click(startBtn);
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: '间歇提醒已开启。' }),
    );

    await finishSpeech();

    expect(screen.getByTitle('停止提醒')).toBeInTheDocument();

    // Stop
    await act(async () => {
      fireEvent.click(screen.getByTitle('停止提醒'));
    });
    expect(screen.getByTitle('开启自动提醒')).toBeInTheDocument();
  });

  it('triggers break sequence after interval', async () => {
    await act(async () => {
      render(<WorkoutTimer />);
    });

    fireEvent.click(screen.getByText('间歇提醒'));

    // Use standard 15 min interval
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '15' } });

    await act(async () => {
      fireEvent.click(screen.getByTitle('开启自动提醒'));
    });

    await finishSpeech();
    mockSpeak.mockClear();

    // Fast forward 15 min (900s)
    await act(async () => {
      vi.advanceTimersByTime(900000);
    });

    expect(mockSpeak).toHaveBeenCalled();
    expect(mockSpeak.mock.calls[0][0].text).toContain(
      '休息时间到了。第一个动作：',
    );

    // Should show active break UI
    expect(screen.getByText(/正在休息 \(1\/3\)/)).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();

    await finishSpeech();
    mockSpeak.mockClear();

    // Step 1 -> Step 2
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    // Trigger the 1s delay for speak in handleNextBreakStep
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/正在休息 \(2\/3\)/)).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalled();

    await finishSpeech();
    mockSpeak.mockClear();

    // Step 2 -> Step 3
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/正在休息 \(3\/3\)/)).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalled();

    await finishSpeech();
    mockSpeak.mockClear();

    // Step 3 -> Finish
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: '休息结束，继续工作吧。' }),
    );
    expect(screen.queryByText(/正在休息/)).not.toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();
  });
});
