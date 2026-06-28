'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:|^\//i;
const RECORDED_AUDIO_START_TIMEOUT_MS = 8000;
const preloadedAudioPaths = new Set<string>();

type NoSleepLike = {
  enable: () => Promise<void> | void;
  disable: () => void;
};

// Module-level NoSleep singleton — shared across all useAudio consumers
// (WorkoutTab, PeriodicTab, etc.) so a disable from any hook can cancel
// any in-flight or completed enable, regardless of which instance owns
// the underlying NoSleep object.
const noSleepModule: {
  importPromise: Promise<typeof import('nosleep.js').default> | null;
  instance: NoSleepLike | null;
  generation: number;
  desiredEnabled: boolean;
} = {
  importPromise: null,
  instance: null,
  generation: 0,
  desiredEnabled: false,
};

const loadNoSleep = () => {
  if (!noSleepModule.importPromise) {
    noSleepModule.importPromise = import('nosleep.js').then(
      (mod) => mod.default,
    );
  }
  return noSleepModule.importPromise;
};

const enableNoSleepModule = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  const generation = ++noSleepModule.generation;
  noSleepModule.desiredEnabled = true;
  if (!noSleepModule.instance) {
    try {
      const NoSleepCtor = await loadNoSleep();
      // A disable that arrived during import — abort before creating the
      // NoSleep instance so we don't leak one.
      if (generation !== noSleepModule.generation) {
        return;
      }
      noSleepModule.instance = new NoSleepCtor();
    } catch {
      return;
    }
  }

  if (generation !== noSleepModule.generation) {
    return;
  }

  try {
    await noSleepModule.instance.enable();
    // Post-await defensive disable: if a disable arrived during
    // instance.enable(), disable() already ran synchronously and is the
    // primary fix. The rollback here covers the narrow race where
    // disable() completed before enable() actually toggled media state.
    if (
      generation !== noSleepModule.generation &&
      !noSleepModule.desiredEnabled
    ) {
      try {
        noSleepModule.instance.disable();
      } catch {}
    }
  } catch {}
};

const disableNoSleepModule = () => {
  noSleepModule.generation += 1;
  noSleepModule.desiredEnabled = false;
  if (noSleepModule.instance) {
    try {
      noSleepModule.instance.disable();
    } catch {}
  }
};

const isAbortError = (error: unknown) => {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }

  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'name' in error && (error as { name?: unknown }).name === 'AbortError';
};

const resolveAudioPath = (filePath: string) => {
  if (ABSOLUTE_URL_PATTERN.test(filePath) || typeof window === 'undefined') {
    return filePath;
  }

  const nextScript = Array.from(document.scripts).find((script) =>
    script.src.includes('/_next/'),
  );
  if (nextScript) {
    const nextIndex = nextScript.src.indexOf('/_next/');
    if (nextIndex > -1) {
      return `${nextScript.src.slice(0, nextIndex)}/${filePath}`;
    }
  }

  const [basePath = ''] = window.location.pathname.split('/').filter(Boolean);
  const pathPrefix = basePath ? `/${basePath}` : '';
  return `${window.location.origin}${pathPrefix}/${filePath}`;
};

export interface SpeechSegment {
  text: string;
  audio?: string | string[];
}

interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
}

export function useAudio(ttsEnabled = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const dingTimeoutRef = useRef<number | null>(null);
  const endCallbackTimeoutRef = useRef<number | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackIdRef = useRef(0);
  const currentAudioCancelRef = useRef<(() => void) | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getRecordedAudio = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!recordedAudioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.setAttribute?.('playsinline', 'true');
      recordedAudioRef.current = audio;
    }

    return recordedAudioRef.current;
  }, []);

  const preloadRecordedAudio = useCallback((audioPath: string | string[]) => {
    if (typeof document === 'undefined') {
      return;
    }

    const audioPaths = Array.isArray(audioPath) ? audioPath : [audioPath];
    audioPaths.filter(Boolean).forEach((path) => {
      const resolvedPath = resolveAudioPath(path);
      if (preloadedAudioPaths.has(resolvedPath)) {
        return;
      }

      preloadedAudioPaths.add(resolvedPath);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'audio';
      link.href = resolvedPath;
      document.head.appendChild(link);
    });
  }, []);

  const cancelCurrentAudio = useCallback(() => {
    if (currentAudioCancelRef.current) {
      currentAudioCancelRef.current();
      currentAudioCancelRef.current = null;
    }
  }, []);

  const beginPlayback = useCallback(() => {
    playbackIdRef.current += 1;
    cancelCurrentAudio();
    if (endCallbackTimeoutRef.current) {
      clearTimeout(endCallbackTimeoutRef.current);
      endCallbackTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return playbackIdRef.current;
  }, [cancelCurrentAudio]);

  const isCurrentPlayback = useCallback(
    (playbackId: number) => playbackIdRef.current === playbackId,
    [],
  );

  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
        dingTimeoutRef.current = null;
      }
      if (endCallbackTimeoutRef.current) {
        clearTimeout(endCallbackTimeoutRef.current);
        endCallbackTimeoutRef.current = null;
      }
      disableNoSleepModule();
      playbackIdRef.current += 1;
      cancelCurrentAudio();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [cancelCurrentAudio]);

  // Page-close fallback. The unmount cleanup above handles mode-switch
  // (page.tsx mounts tabs conditionally on the active mode). This
  // listener covers the case where the tab is closed while a hook is
  // still mounted. Listeners are removed on unmount and the body is
  // idempotent, so per-mount registration is safe.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleBeforeUnload = () => {
      disableNoSleepModule();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined' || audioCtxRef.current) {
      return;
    }
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }
  }, []);

  const unlockAudio = useCallback(async () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current;
    if (ctx) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
      } catch {}
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      try {
        source.start(0);
      } catch {}
    }

    getRecordedAudio();
  }, [getRecordedAudio, initAudio]);

  const playDing = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (!audioCtxRef.current) {
        initAudio();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) {
        return;
      }
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          return;
        }
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      window.setTimeout(() => {
        try {
          osc.disconnect();
        } catch {}
        try {
          gain.disconnect();
        } catch {}
      }, 800);
    } catch {
      // ignore
    }
  }, [initAudio]);

  const tryPlayFile = useCallback(
    async (
      filePath: string,
      playbackId: number,
    ): Promise<'played' | 'failed' | 'cancelled'> => {
      return new Promise((resolve) => {
        if (!isCurrentPlayback(playbackId)) {
          resolve('cancelled');
          return;
        }

        const resolvedPath = resolveAudioPath(filePath);
        const audio = getRecordedAudio();
        if (!audio) {
          resolve('failed');
          return;
        }
        let settled = false;
        let timeoutId: number | null = null;

        const stopAudio = () => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {}
        };

        const onEnded = () => {
          cleanup();
          resolve(isCurrentPlayback(playbackId) ? 'played' : 'cancelled');
        };

        const onError = () => {
          cleanup();
          stopAudio();
          resolve(isCurrentPlayback(playbackId) ? 'failed' : 'cancelled');
        };

        const cleanup = () => {
          if (settled) {
            return;
          }
          settled = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
          }
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          if (currentAudioCancelRef.current === cancelAudio) {
            currentAudioCancelRef.current = null;
          }
        };

        const cancelAudio = () => {
          cleanup();
          stopAudio();
          resolve('cancelled');
        };

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        currentAudioCancelRef.current = cancelAudio;

        timeoutId = window.setTimeout(() => {
          cleanup();
          stopAudio();
          resolve(isCurrentPlayback(playbackId) ? 'failed' : 'cancelled');
        }, RECORDED_AUDIO_START_TIMEOUT_MS);

        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = resolvedPath;
        } catch {
          cleanup();
          resolve(isCurrentPlayback(playbackId) ? 'failed' : 'cancelled');
          return;
        }

        audio
          .play()
          .then(() => {
            if (settled) {
              stopAudio();
              return;
            }
            if (timeoutId !== null) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          })
          .catch((e) => {
            const wasAbort = isAbortError(e);
            if (!wasAbort) {
              console.warn(`Failed to play audio file ${resolvedPath}:`, e);
            }
            cleanup();
            stopAudio();
            resolve(
              isCurrentPlayback(playbackId) && !wasAbort
                ? 'failed'
                : 'cancelled',
            );
          });
      });
    },
    [getRecordedAudio, isCurrentPlayback],
  );

  const tryPlayFiles = useCallback(
    async (
      filePaths: string[],
      playbackId: number,
    ): Promise<'played' | 'failed' | 'cancelled'> => {
      if (filePaths.length === 0) {
        return 'failed';
      }

      for (const filePath of filePaths) {
        const status = await tryPlayFile(filePath, playbackId);
        if (status !== 'played') {
          return status;
        }
      }

      return 'played';
    },
    [tryPlayFile],
  );

  // Function to play a pre-recorded MP3 file if available
  const playRecordedAudio = useCallback(
    async (
      audioPath: string | string[] | undefined,
      playbackId: number,
    ): Promise<'played' | 'failed' | 'cancelled'> => {
      if (typeof window === 'undefined') {
        return 'failed';
      }

      try {
        if (audioPath) {
          const audioPaths = Array.isArray(audioPath) ? audioPath : [audioPath];
          return tryPlayFiles(audioPaths.filter(Boolean), playbackId);
        }

        return 'failed';
      } catch (e) {
        console.warn('Error in playRecordedAudio:', e);
        return isCurrentPlayback(playbackId) ? 'failed' : 'cancelled';
      }
    },
    [isCurrentPlayback, tryPlayFiles],
  );

  const speakText = useCallback(async (text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    await new Promise<void>((resolve) => {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      msg.onend = () => resolve();
      msg.onerror = () => resolve();
      window.speechSynthesis.speak(msg);
    });
  }, []);

  const speakSegments = useCallback(
    async (segments: SpeechSegment[], callbacks: SpeechCallbacks = {}) => {
      const { onStart, onEnd } = callbacks;

      if (!ttsEnabled || typeof window === 'undefined') {
        beginPlayback();
        setIsSpeaking(false);
        if (onEnd) {
          onEnd();
        }
        return;
      }

      const playableSegments = segments.filter(
        (segment) => segment.text || segment.audio,
      );
      if (playableSegments.length === 0) {
        setIsSpeaking(false);
        if (onEnd) {
          onEnd();
        }
        return;
      }

      const playbackId = beginPlayback();
      setIsSpeaking(true);
      if (onStart) {
        onStart();
      }
      playableSegments.forEach((segment) => {
        if (segment.audio) {
          preloadRecordedAudio(segment.audio);
        }
      });
      for (const segment of playableSegments) {
        if (!isCurrentPlayback(playbackId)) {
          return;
        }

        const audioStatus = await playRecordedAudio(segment.audio, playbackId);
        if (audioStatus === 'cancelled' || !isCurrentPlayback(playbackId)) {
          return;
        }

        if (!segment.audio && audioStatus === 'failed') {
          await speakText(segment.text);
          if (!isCurrentPlayback(playbackId)) {
            return;
          }
        }
      }
      setIsSpeaking(false);
      playDing();
      if (onEnd) {
        if (endCallbackTimeoutRef.current) {
          clearTimeout(endCallbackTimeoutRef.current);
        }
        endCallbackTimeoutRef.current = window.setTimeout(() => {
          endCallbackTimeoutRef.current = null;
          onEnd();
        }, 300);
      }
    },
    [
      beginPlayback,
      isCurrentPlayback,
      playDing,
      playRecordedAudio,
      preloadRecordedAudio,
      speakText,
      ttsEnabled,
    ],
  );

  const speak = useCallback(
    async (
      text: string,
      audioPathOrOnEnd?: string | string[] | (() => void),
      onEnd?: () => void,
    ) => {
      let actualAudioPath: string | string[] | undefined;
      let actualOnEnd = onEnd;

      if (typeof audioPathOrOnEnd === 'function') {
        actualOnEnd = audioPathOrOnEnd;
        actualAudioPath = undefined;
      } else {
        actualAudioPath = audioPathOrOnEnd;
      }

      await speakSegments([{ text, audio: actualAudioPath }], {
        onEnd: actualOnEnd,
      });
    },
    [speakSegments],
  );

  const scheduleSpeak = useCallback(
    (
      textOrSegments: string | SpeechSegment[],
      delayOrAudioPath: number | string | string[] = 1000,
      onEnd?: () => void,
      onStart?: () => void,
    ) => {
      let delay = 1000;
      let audioPath: string | string[] | undefined;

      if (
        typeof delayOrAudioPath === 'string' ||
        Array.isArray(delayOrAudioPath)
      ) {
        audioPath = delayOrAudioPath;
      } else {
        delay = delayOrAudioPath;
      }

      // if there is a pending scheduled speak, cancel it and clear speaking state
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
        setIsSpeaking(false);
      }
      // mark as speaking immediately so callers (timers) can pause while waiting
      setIsSpeaking(true);
      speakTimeoutRef.current = window.setTimeout(() => {
        if (Array.isArray(textOrSegments)) {
          speakSegments(textOrSegments, { onEnd, onStart });
        } else {
          speak(textOrSegments, audioPath, onEnd);
        }
        speakTimeoutRef.current = null;
      }, delay);
    },
    [speak, speakSegments],
  );

  const playDoubleDing = useCallback(() => {
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
      dingTimeoutRef.current = null;
    }
    playDing();
    dingTimeoutRef.current = window.setTimeout(() => {
      playDing();
      dingTimeoutRef.current = null;
    }, 300);
  }, [playDing]);

  const cancelAll = useCallback(() => {
    playbackIdRef.current += 1;
    cancelCurrentAudio();
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
      dingTimeoutRef.current = null;
    }
    if (endCallbackTimeoutRef.current) {
      clearTimeout(endCallbackTimeoutRef.current);
      endCallbackTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [cancelCurrentAudio]);

  const enableNoSleep = useCallback(() => enableNoSleepModule(), []);

  const disableNoSleep = useCallback(() => {
    disableNoSleepModule();
  }, []);

  return {
    initAudio,
    unlockAudio,
    playDing,
    speak,
    speakSegments,
    scheduleSpeak,
    playDoubleDing,
    cancelAll,
    enableNoSleep,
    disableNoSleep,
    isSpeaking,
  };
}

export default useAudio;
