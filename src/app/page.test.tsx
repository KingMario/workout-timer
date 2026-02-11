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

// Access the global mocks setup in vitest.setup.ts
const mockSpeak = window.speechSynthesis.speak as unknown as Mock;
const mockCancel = window.speechSynthesis.cancel as unknown as Mock;

describe('WorkoutTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeak.mockClear();
    mockCancel.mockClear();
    // Reset implementations to default (empty mock)
    mockSpeak.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Helper to trigger speech completion
  const finishSpeech = () => {
    const calls = mockSpeak.mock.calls;
    if (calls.length > 0) {
      const lastCall = calls[calls.length - 1];
      const utterance = lastCall[0];
      if (utterance.onend) {
        act(() => {
          utterance.onend(new Event('end'));
        });
      }
    }
  };

  it('renders initial state correctly', () => {
    render(<WorkoutTimer />);
    expect(screen.getByText('💪 灵动健身 (FlexWorkout)')).toBeInTheDocument();
    expect(screen.getByText('✨ 定制计划')).toBeInTheDocument();
    expect(screen.getByText('热身阶段')).toBeInTheDocument();
    // It appears in header and list, so getAll
    expect(screen.getAllByText('颈部画圆').length).toBeGreaterThan(0);
    expect(screen.getByText(/已用时：/)).toBeInTheDocument();
  });

  it('starts and pauses the timer', async () => {
    render(<WorkoutTimer />);
    const toggleButton = screen.getByTitle('开始');

    // Start
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    expect(mockSpeak).toHaveBeenCalled(); // Speaks first item

    // Check if icon changed to pause (title becomes '暂停')
    expect(screen.getByTitle('暂停')).toBeInTheDocument();

    // Advance time by 1s
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Pause
    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });
    expect(screen.getByTitle('开始')).toBeInTheDocument();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('handles item transition with ding and speech delay', async () => {
    render(<WorkoutTimer />);
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech to start timer
    finishSpeech();

    mockSpeak.mockClear(); // Clear the initial speak call

    // Fast forward to end of first item (60s)
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    // Now timeLeft is 0. handleNextStep triggered.
    // It calls playDoubleDing()...
    // AND it schedules setTimeout(speak, 1000)

    // Wait for the delay
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockSpeak).toHaveBeenCalled();
    expect(mockSpeak.mock.calls[0][0].text).toContain('肩部时钟');
  });

  it('resets the timer', async () => {
    render(<WorkoutTimer />);
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    finishSpeech();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('重置'));
    });
    expect(screen.getByTitle('开始')).toBeInTheDocument();
  });

  it('toggles TTS', async () => {
    render(<WorkoutTimer />);
    const ttsBtn = screen.getByTitle('语音播报开关');

    await act(async () => {
      fireEvent.click(ttsBtn);
    });
    // Now disabled

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('allows jumping to a step', async () => {
    render(<WorkoutTimer />);
    // Find step 2 in the list. List items have text "2." and "肩部时钟"
    const step2Name = screen
      .getAllByText('肩部时钟')
      .find(
        (el) => el.tagName === 'SPAN' && el.className.includes('font-medium'),
      );

    if (step2Name) {
      await act(async () => {
        fireEvent.click(step2Name);
      });
    } else {
      // Fallback if structure is different
      const allSteps = screen.getAllByText('肩部时钟');
      await act(async () => {
        fireEvent.click(allSteps[allSteps.length - 1]);
      });
    }

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('肩部时钟') }),
    );
  });

  it('adjusts rounds', async () => {
    render(<WorkoutTimer />);
    const selects = screen.getAllByRole('combobox');

    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '1' } });
    });

    expect(screen.getByTitle('开始')).toBeInTheDocument();
  });

  it('completes the workout', async () => {
    render(<WorkoutTimer />);

    const items = screen.getAllByText('腹式深呼吸');
    await act(async () => {
      fireEvent.click(items[items.length - 1]);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech
    finishSpeech();

    // Finish duration (30s)
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Transition to finish
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/恭喜完成全部锻炼/)).toBeInTheDocument();
  });
});
