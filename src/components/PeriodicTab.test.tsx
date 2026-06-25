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
const mockAudioSources: string[] = [];
let mockAudioMode: 'error' | 'play-success' = 'error';

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

  constructor(src = '') {
    this.src = src;
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
    if (mockAudioMode === 'play-success' && event === 'ended') {
      queueMicrotask(callback);
    }
    if (mockAudioMode === 'error' && event === 'error') {
      queueMicrotask(callback);
    }
  }

  removeEventListener(event: string) {
    this.listeners.delete(event);
  }
}
// Backwards-compat helper for tests that still use getByTitle
// Avoid using `any` to satisfy @typescript-eslint/no-explicit-any
type ScreenWithGetByTitle = typeof screen & {
  getByTitle: (t: string) => HTMLElement;
};
(screen as unknown as ScreenWithGetByTitle).getByTitle = (t: string) =>
  screen.getByRole('button', { name: new RegExp(t) });

describe('PeriodicTab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeak.mockClear();
    mockAudioSources.length = 0;
    mockAudioMode = 'error';
    vi.stubGlobal('Audio', AudioMock);
    mockSpeak.mockImplementation(() => {});
  });

  afterEach(() => {
    // Wrap pending timers in act() to avoid "not wrapped in act" warnings
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const flushAudioQueue = async () => {
    for (let i = 0; i < 8; i += 1) {
      await act(async () => {});
    }
  };

  it('starts and stops periodic reminder', async () => {
    mockAudioMode = 'play-success';

    await act(async () => {
      render(<PeriodicTab />);
    });

    expect(screen.getByText('⏰ 办公间歇拉伸')).toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', {
      name: /开启自动提醒|停止提醒|停止自动提醒/,
    });

    await act(async () => {
      fireEvent.click(startBtn);
    });

    await flushAudioQueue();

    expect(mockAudioSources[0]).toContain(
      '/audio/built-in-plans/yunxi/periodic-enabled.mp3',
    );
    expect(mockSpeak).not.toHaveBeenCalled();

    expect(
      screen.getByRole('button', { name: /停止(?:自动)?提醒/ }),
    ).toBeInTheDocument();

    // Stop
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /停止(?:自动)?提醒/ }),
      );
    });
    expect(
      screen.getByRole('button', { name: /开启自动提醒/ }),
    ).toBeInTheDocument();
  });

  it('enters break mode and advances break steps with speech', async () => {
    mockAudioMode = 'play-success';

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
      vi.advanceTimersByTime(0);
    });

    // First break state
    expect(screen.getByText(/正在休息 \(1\/3\)/)).toBeInTheDocument();
    expect(screen.getByText(/s$/)).toBeInTheDocument();
    await flushAudioQueue();
    expect(mockAudioSources[0]).toContain(
      '/audio/built-in-plans/yunxi/periodic-break-start.mp3',
    );
    expect(mockAudioSources[1]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+-name\.mp3$/,
    );
    expect(mockAudioSources[2]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+\.mp3$/,
    );
    expect(mockSpeak).not.toHaveBeenCalled();
    mockAudioSources.length = 0;
    mockSpeak.mockClear();

    // Step 1 -> Step 2: 30 seconds + 1s speech delay
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
    });

    expect(screen.getByText(/正在休息 \(2\/3\)/)).toBeInTheDocument();
    await flushAudioQueue();
    expect(mockAudioSources[0]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+-name\.mp3$/,
    );
    expect(mockAudioSources[1]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+\.mp3$/,
    );
    expect(mockSpeak).not.toHaveBeenCalled();
    mockAudioSources.length = 0;
    mockSpeak.mockClear();

    // Step 2 -> Step 3
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
    });

    expect(screen.getByText(/正在休息 \(3\/3\)/)).toBeInTheDocument();
    await flushAudioQueue();
    expect(mockAudioSources[0]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+-name\.mp3$/,
    );
    expect(mockAudioSources[1]).toMatch(
      /\/audio\/built-in-plans\/yunxi\/planC-s\d+-e\d+\.mp3$/,
    );
    expect(mockSpeak).not.toHaveBeenCalled();
    mockAudioSources.length = 0;
    mockSpeak.mockClear();

    // Step 3 -> Finish
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    await act(async () => {
      vi.advanceTimersByTime(1_500);
    });

    // After finishing, break UI disappears and countdown reappears
    expect(screen.queryByText(/正在休息/)).not.toBeInTheDocument();
    expect(screen.getByText('下次提醒倒计时')).toBeInTheDocument();
    await flushAudioQueue();
    expect(mockAudioSources[0]).toContain(
      '/audio/built-in-plans/yunxi/periodic-break-end.mp3',
    );
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
