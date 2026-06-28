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
import WorkoutTab from './WorkoutTab';

const { mockNoSleepEnable, mockNoSleepDisable } = vi.hoisted(() => ({
  mockNoSleepEnable: vi.fn(),
  mockNoSleepDisable: vi.fn(),
}));

vi.mock('nosleep.js', () => ({
  default: class NoSleep {
    enable = mockNoSleepEnable;
    disable = mockNoSleepDisable;
  },
}));

// Access the global mocks setup in vitest.setup.ts
// Backwards-compat: some components switched from title->aria-label. Provide a small
// compatibility helper so legacy tests using screen.getByTitle continue to work.
// Avoid using `any` to satisfy @typescript-eslint/no-explicit-any
type ScreenWithGetByTitle = typeof screen & {
  getByTitle: (t: string) => HTMLElement;
};
(screen as unknown as ScreenWithGetByTitle).getByTitle = (t: string) =>
  screen.getByRole('button', { name: new RegExp(t) });
const mockSpeak = window.speechSynthesis.speak as unknown as Mock;
const mockCancel = window.speechSynthesis.cancel as unknown as Mock;
const mockAudioSources: string[] = [];
const mockAudioInstances: AudioMock[] = [];
let mockAudioMode: 'abort' | 'error' | 'play-success' | 'slow-start' = 'error';
let mockDingStartCount = 0;

class AudioContextMock {
  state = 'running';
  currentTime = 0;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  createBuffer = vi.fn(() => ({}));
  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
  }));
  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(() => {
      mockDingStartCount += 1;
    }),
    stop: vi.fn(),
    type: '',
    frequency: { setValueAtTime: vi.fn() },
  }));
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }));
}

class AudioMock {
  private currentSrc = '';
  currentTime = 0;
  muted = false;
  preload = '';
  listeners = new Map<string, () => void>();
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  setAttribute = vi.fn();
  removeAttribute = vi.fn((name: string) => {
    if (name === 'src') {
      this.src = '';
    }
  });
  resolvePlay: (() => void) | null = null;

  constructor(src = '') {
    this.src = src;
    this.play.mockImplementation(() => {
      if (mockAudioMode === 'abort') {
        return Promise.reject(
          new DOMException('The operation was aborted.', 'AbortError'),
        );
      }

      if (mockAudioMode === 'slow-start') {
        return new Promise<void>((resolve) => {
          this.resolvePlay = resolve;
        });
      }

      return Promise.resolve();
    });
    mockAudioInstances.push(this);
  }

  get src() {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
    if (value && !value.startsWith('data:audio/')) {
      mockAudioSources.push(value);
    }
  }

  addEventListener(event: string, callback: () => void) {
    this.listeners.set(event, callback);
    if (event === 'error') {
      if (mockAudioMode === 'error') {
        queueMicrotask(callback);
      }
    }
  }

  removeEventListener(event: string) {
    this.listeners.delete(event);
  }

  finish() {
    this.listeners.get('ended')?.();
  }
}

describe('WorkoutTab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    mockSpeak.mockClear();
    mockCancel.mockClear();
    mockNoSleepEnable.mockClear();
    mockNoSleepDisable.mockClear();
    mockAudioSources.length = 0;
    mockAudioInstances.length = 0;
    mockDingStartCount = 0;
    mockAudioMode = 'error';
    vi.stubGlobal('Audio', AudioMock);
    const audioWindow = window as unknown as {
      AudioContext: typeof AudioContext;
      webkitAudioContext: typeof AudioContext;
    };
    audioWindow.AudioContext =
      AudioContextMock as unknown as typeof AudioContext;
    audioWindow.webkitAudioContext =
      AudioContextMock as unknown as typeof AudioContext;
    // Reset implementations to default (empty mock)
    mockSpeak.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Flush any pending timers inside React's act() to avoid
    // "not wrapped in act(...)" warnings from state updates
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  // Helper to trigger speech completion
  const finishSpeech = async () => {
    let index = 0;
    while (index < mockSpeak.mock.calls.length) {
      const utterance = mockSpeak.mock.calls[index][0];
      if (utterance.onend) {
        act(() => {
          utterance.onend(new Event('end'));
        });
      }
      index += 1;
      await act(async () => {});
    }
  };

  const finishInitialRecordedSpeech = async () => {
    await act(async () => {
      mockAudioInstances[0]?.finish();
    });
    await act(async () => {
      mockAudioInstances[0]?.finish();
    });
    await act(async () => {
      mockAudioInstances[0]?.finish();
    });
  };

  it('uses recorded audio without falling back to browser speech synthesis', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });

    expect(mockAudioInstances[0]?.play).toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(mockAudioSources[0]).toMatch(
      /audio\/built-in-plans\/yunxi\/planA-s1\.mp3$/,
    );

    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(mockSpeak).not.toHaveBeenCalled();

    await act(async () => {
      mockAudioInstances[0]?.finish();
    });

    expect(mockAudioInstances[0]?.play).toHaveBeenCalledTimes(2);
    expect(mockAudioSources[1]).toMatch(
      /audio\/built-in-plans\/yunxi\/planA-s1-e1-name\.mp3$/,
    );
    expect(mockSpeak).not.toHaveBeenCalled();

    await act(async () => {
      mockAudioInstances[0]?.finish();
    });

    expect(mockAudioInstances[0]?.play).toHaveBeenCalledTimes(3);
    expect(mockAudioSources[2]).toMatch(
      /audio\/built-in-plans\/yunxi\/planA-s1-e1\.mp3$/,
    );
    expect(mockSpeak).not.toHaveBeenCalled();

    await act(async () => {
      mockAudioInstances[0]?.finish();
    });

    expect(mockDingStartCount).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /暂停/ })).toBeInTheDocument();
  });

  it('keeps NoSleep disabled while built-in AI MP3 starts because NoSleep media can conflict on mobile Safari', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });

    expect(mockNoSleepEnable).not.toHaveBeenCalled();
    expect(mockNoSleepDisable).toHaveBeenCalledTimes(1);

    await finishInitialRecordedSpeech();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockNoSleepEnable).toHaveBeenCalledTimes(1);
  });

  it('does not use browser speech when built-in recorded audio times out', async () => {
    mockAudioMode = 'slow-start';

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });

    expect(mockAudioSources[0]).toMatch(
      /audio\/built-in-plans\/yunxi\/planA-s1\.mp3$/,
    );

    await act(async () => {
      vi.advanceTimersByTime(8000);
    });

    expect(mockAudioInstances[0]?.pause).toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('treats aborted recorded audio playback as cancellation', async () => {
    mockAudioMode = 'abort';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });
    await act(async () => {});

    expect(mockAudioInstances[0]?.play).toHaveBeenCalled();
    expect(mockAudioInstances[0]?.pause).toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('enables NoSleep immediately for custom TTS plans without built-in AI MP3 media', async () => {
    localStorage.setItem(
      'mario_workout_timer_active_plan',
      JSON.stringify({
        id: 'custom-plan',
        plan: [
          {
            name: '自定义阶段',
            tips: '',
            allowRounds: false,
            defaultRounds: 1,
            maxRounds: 1,
            steps: [
              {
                name: '自定义动作',
                desc: '自定义动作说明',
                duration: 10,
              },
            ],
          },
        ],
      }),
    );

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });

    expect(mockAudioSources).toHaveLength(0);
    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('自定义动作') }),
    );
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(1);
    expect(mockNoSleepDisable).not.toHaveBeenCalled();
  });

  it('renders initial state correctly', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });
    expect(screen.getByText('💪 灵动健身 (FlexWorkout)')).toBeInTheDocument();
    expect(screen.getByText('✨ 计划库')).toBeInTheDocument();
    expect(screen.getByText('热身阶段')).toBeInTheDocument();
    // It appears in header and list, so getAll
    expect(screen.getAllByText('颈部画圆').length).toBeGreaterThan(0);
    expect(screen.getByText(/已用时：/)).toBeInTheDocument();
  });

  it('starts and pauses the timer', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });
    const toggleButton = screen.getByRole('button', { name: /开始/ });

    // Start
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(
      mockAudioSources.some((source) =>
        source.endsWith('audio/built-in-plans/yunxi/planA-s1.mp3'),
      ),
    ).toBe(true);

    // Check if icon changed to pause (aria-label becomes '暂停')
    expect(screen.getByRole('button', { name: /暂停/ })).toBeInTheDocument();

    // Advance time by 1s
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Pause
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /暂停/ }));
    });
    expect(screen.getByRole('button', { name: /开始/ })).toBeInTheDocument();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('handles item transition with ding and speech delay', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /开始/ }));
    });

    // Finish initial recorded speech to start timer
    await finishInitialRecordedSpeech();

    mockSpeak.mockClear();
    mockAudioSources.length = 0;

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

    expect(mockSpeak).not.toHaveBeenCalled();
    expect(
      mockAudioSources.some((source) =>
        source.endsWith('audio/built-in-plans/yunxi/planA-s1-e2-name.mp3'),
      ),
    ).toBe(true);
  });

  it('resets the timer', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    await finishInitialRecordedSpeech();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /重置/ }));
    });
    expect(screen.getByTitle('开始')).toBeInTheDocument();
  });

  it('toggles TTS', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });
    const ttsBtn = screen.getByRole('button', { name: /语音播报/ });

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
    await act(async () => {
      render(<WorkoutTab />);
    });
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
    expect(
      mockAudioSources.some((source) =>
        source.endsWith('audio/built-in-plans/yunxi/planA-s1-e2-name.mp3'),
      ),
    ).toBe(true);
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('cancels the current recorded audio queue when jumping to another step', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    const firstAudio = mockAudioInstances[0];
    expect(firstAudio.src).toMatch(/planA-s1\.mp3$/);

    await act(async () => {});

    const step2Name = screen
      .getAllByText('肩部时钟')
      .find(
        (el) => el.tagName === 'SPAN' && el.className.includes('font-medium'),
      );

    await act(async () => {
      fireEvent.click(step2Name ?? screen.getAllByText('肩部时钟')[0]);
    });

    expect(firstAudio.pause).toHaveBeenCalled();
    expect(mockAudioSources.at(-1)).toMatch(/planA-s1-e2-name\.mp3$/);

    await act(async () => {
      firstAudio.finish();
    });

    expect(
      mockAudioSources.some((source) =>
        source.endsWith('planA-s1-e1-name.mp3'),
      ),
    ).toBe(false);
    expect(mockDingStartCount).toBe(0);
    expect(screen.getAllByText('肩部时钟').length).toBeGreaterThan(0);
  });

  it('manual jump pauses timer until speech ends', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });

    // Start playback and finish initial speech
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    await finishInitialRecordedSpeech();

    // Advance 2s to let timer decrement
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    const remainingEl = screen.getByText(/剩余：/);
    const parseLeftSec = (text: string) => {
      // parse the left side (current step timeLeft)
      const parts = (text || '').split('/');
      const target = parts[0] || '';
      const m = target.match(/(\d+)'/);
      const s = target.match(/(\d+)"/);
      const minutes = m ? parseInt(m[1], 10) : 0;
      const seconds = s ? parseInt(s[1], 10) : 0;
      return minutes * 60 + seconds;
    };

    // Click another step while playing -> should speak and PAUSE countdown
    const stepEls = screen.getAllByText('肩部时钟');
    await act(async () => {
      fireEvent.click(stepEls[0]);
    });

    // capture the left-side time immediately after click
    const afterClick = parseLeftSec(remainingEl.textContent || '');

    // Advance time while recorded audio is ongoing.
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const during = parseLeftSec(remainingEl.textContent || '');
    expect(during).toBe(afterClick);

    // Finish recorded speech and advance, timer should resume
    await act(async () => {
      mockAudioInstances[0]?.finish();
    });
    await act(async () => {
      mockAudioInstances[0]?.finish();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    const after = parseLeftSec(remainingEl.textContent || '');
    expect(after).toBeLessThan(during);
  });

  it('auto transition pauses during scheduled speech and resumes immediately after', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });

    // Start playback and finish initial speech
    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });
    await finishSpeech();

    // Fast forward to the end of the first item (60s)
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    // After transition, a speech is scheduled. Grab remaining now.
    const remainingEl = screen.getByText(/剩余：/);
    const parseSec = (text: string) => {
      const parts = (text || '').split('/');
      const target = parts[1] || parts[0] || '';
      const m = target.match(/(\d+)'/);
      const s = target.match(/(\d+)"/);
      const minutes = m ? parseInt(m[1], 10) : 0;
      const seconds = s ? parseInt(s[1], 10) : 0;
      return minutes * 60 + seconds;
    };

    const before = parseSec(remainingEl.textContent || '');

    // While speech hasn't ended, timer must be paused
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    const during = parseSec(remainingEl.textContent || '');
    expect(during).toBe(before);

    // Finish speech and then timer should resume
    await finishSpeech();
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    const after = parseSec(remainingEl.textContent || '');
    expect(after).toBeLessThan(during);
  });

  it('adjusts rounds', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });
    const selects = screen.getAllByRole('combobox');

    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '1' } });
    });

    expect(screen.getByTitle('开始')).toBeInTheDocument();
  });

  it('completes the workout', async () => {
    await act(async () => {
      render(<WorkoutTab />);
    });

    const items = screen.getAllByText('腹式深呼吸');
    await act(async () => {
      fireEvent.click(items[items.length - 1]);
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('开始'));
    });

    // Finish initial speech
    await finishSpeech();

    // Finish duration (30s)
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Transition to finish
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/恭喜完成锻炼/)).toBeInTheDocument();
  });

  it('supports keyboard shortcuts (Space to toggle, Esc to reset)', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<WorkoutTab />);
    });

    // 1. Space to Start
    await act(async () => {
      fireEvent.keyDown(window, { code: 'Space' });
    });
    expect(screen.getByTitle('暂停')).toBeInTheDocument();
    expect(mockAudioSources[0]).toMatch(
      /audio\/built-in-plans\/yunxi\/planA-s1\.mp3$/,
    );

    await finishInitialRecordedSpeech();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 2. Space to Pause
    await act(async () => {
      fireEvent.keyDown(window, { code: 'Space' });
    });
    expect(screen.getByTitle('开始')).toBeInTheDocument();

    // 3. Resume and advance
    await act(async () => {
      fireEvent.keyDown(window, { code: 'Space' });
    });
    await finishInitialRecordedSpeech();
    // Advance enough to move to next step or deplete timer
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // 4. Esc to Reset
    await act(async () => {
      fireEvent.keyDown(window, { code: 'Escape' });
    });
    // Should be paused and reset
    expect(screen.getByTitle('开始')).toBeInTheDocument();
    // Timer should be reset check?
    // "已用时：0""
    expect(screen.getByText(/已用时：0"/)).toBeInTheDocument();

    // 5. Verify ignored when focused on input/select
    const selects = screen.getAllByRole('combobox');
    if (selects.length > 0) {
      const select = selects[0];
      select.focus(); // Focus the select element

      // Press Space while focused on select
      await act(async () => {
        fireEvent.keyDown(select, { code: 'Space', bubbles: true });
      });

      // Should still be paused (Start button visible), i.e. togglePlay NOT called
      expect(screen.getByTitle('开始')).toBeInTheDocument();
    }
  });
});
