import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const renderUseAudio = async () => {
  const { default: useAudio } = await import('./useAudio');
  const result = renderHook(() => useAudio());
  return { ...result, api: result.result.current };
};

const createDeferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
};

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
};

describe('useAudio NoSleep lazy loading', () => {
  beforeEach(() => {
    vi.resetModules();
    mockNoSleepEnable.mockClear();
    mockNoSleepDisable.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('does not enable NoSleep when disable is called while the lazy import is in flight', async () => {
    const { api } = await renderUseAudio();

    void api.enableNoSleep();
    api.disableNoSleep();
    await flushMicrotasks();

    expect(mockNoSleepEnable).not.toHaveBeenCalled();
    expect(mockNoSleepDisable).not.toHaveBeenCalled();
  });

  it('enables and disables NoSleep on the happy path', async () => {
    const { api } = await renderUseAudio();

    await act(async () => {
      await api.enableNoSleep();
    });
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(1);

    api.disableNoSleep();
    expect(mockNoSleepDisable).toHaveBeenCalledTimes(1);
  });

  it("lets one consumer's disable cancel another consumer's in-flight enable", async () => {
    const first = await renderUseAudio();
    const second = await renderUseAudio();

    void first.api.enableNoSleep();
    second.api.disableNoSleep();
    await flushMicrotasks();

    expect(mockNoSleepEnable).not.toHaveBeenCalled();
    expect(mockNoSleepDisable).not.toHaveBeenCalled();
  });

  it('does not let an older enable completion disable a newer enable request', async () => {
    const firstEnable = createDeferred();
    const secondEnable = createDeferred();
    mockNoSleepEnable
      .mockImplementationOnce(() => firstEnable.promise)
      .mockImplementationOnce(() => secondEnable.promise);

    const { api } = await renderUseAudio();

    const firstRequest = api.enableNoSleep();
    await flushMicrotasks();
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(1);

    const secondRequest = api.enableNoSleep();
    await flushMicrotasks();
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(2);

    secondEnable.resolve();
    await act(async () => {
      await secondRequest;
    });
    expect(mockNoSleepDisable).not.toHaveBeenCalled();

    firstEnable.resolve();
    await act(async () => {
      await firstRequest;
    });
    expect(mockNoSleepDisable).not.toHaveBeenCalled();
  });

  it('disables the shared NoSleep instance when a consumer unmounts', async () => {
    const first = await renderUseAudio();

    await act(async () => {
      await first.api.enableNoSleep();
    });
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(1);

    first.unmount();
    expect(mockNoSleepDisable).toHaveBeenCalledTimes(1);

    const second = await renderUseAudio();
    await act(async () => {
      await second.api.enableNoSleep();
    });
    expect(mockNoSleepEnable).toHaveBeenCalledTimes(2);
  });
});
