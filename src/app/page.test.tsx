import { render, screen, fireEvent, act } from '@testing-library/react';
import WorkoutTimer from './page';
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';

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

  it('retains remaining time when pausing immediately after play', async () => {
    render(<WorkoutTimer />);

    // Start the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech to start timer countdown
    finishSpeech();

    // Advance time by 5 seconds (60s - 5s = 55s remaining)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Pause the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });

    // Check remaining time - should be 55 seconds
    const remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toContain('55"');

    // Resume the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish speech again
    finishSpeech();

    // Advance time by 5 more seconds (55s - 5s = 50s)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Time should now be around 50s
    const newRemainingText = screen.getByText(/剩余：/).textContent;
    expect(newRemainingText).toContain('50"');
  });

  it('correctly handles switching steps while paused', async () => {
    render(<WorkoutTimer />);

    // Start the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech
    finishSpeech();

    // Advance time by 10 seconds
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Pause the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });

    // Jump to step 2 (肩部时钟) while paused
    const step2Elements = screen.getAllByText('肩部时钟');
    const step2Name = step2Elements.find(
      (el) => el.tagName === 'SPAN' && el.className.includes('font-medium'),
    );

    await act(async () => {
      if (step2Name) {
        fireEvent.click(step2Name);
      } else {
        fireEvent.click(step2Elements[step2Elements.length - 1]);
      }
    });

    // When jumping to a new step while paused, it should load the new step's duration
    // because prev will be 0 (different step), so it falls back to steps[idx].duration
    const remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toMatch(/1'|60"/); // Either 1 minute or 60 seconds

    // Now resume playing
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Should speak the new step name
    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('肩部时钟') }),
    );
  });

  it('handles repeated pause-resume operations correctly', async () => {
    render(<WorkoutTimer />);

    // Start the timer
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech
    finishSpeech();

    // First pause-resume cycle (60s - 3s = 57s left)
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });

    let remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toContain('57"');

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    finishSpeech();

    // Second pause-resume cycle (57s - 7s = 50s left)
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });

    remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toContain('50"');

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    finishSpeech();

    // Third pause-resume cycle (50s - 10s = 40s left)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('暂停'));
    });

    remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toContain('40"');

    // Final resume (40s - 5s = 35s left)
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    finishSpeech();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    remainingText = screen.getByText(/剩余：/).textContent;
    expect(remainingText).toContain('35"');
  });
});
