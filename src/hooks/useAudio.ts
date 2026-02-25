'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import NoSleep from 'nosleep.js';

export function useAudio(ttsEnabled = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const dingTimeoutRef = useRef<number | null>(null);
  const noSleepRef = useRef<NoSleep | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      noSleepRef.current = new NoSleep();
    }
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
        dingTimeoutRef.current = null;
      }
      if (noSleepRef.current) {
        try {
          noSleepRef.current.disable();
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
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
  }, [initAudio]);

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
    } catch (e) {
      // ignore
    }
  }, [initAudio]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (
        !ttsEnabled ||
        typeof window === 'undefined' ||
        !window.speechSynthesis
      ) {
        if (onEnd) {
          onEnd();
        }
        return;
      }
      // cancel pending and schedule immediately
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(true);
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      msg.onend = () => {
        setIsSpeaking(false);
        playDing();
        if (onEnd) {
          onEnd();
        }
      };
      msg.onerror = () => {
        setIsSpeaking(false);
        if (onEnd) {
          onEnd();
        }
      };
      window.speechSynthesis.speak(msg);
    },
    [playDing, ttsEnabled],
  );

  const scheduleSpeak = useCallback(
    (text: string, delay = 1000, onEnd?: () => void) => {
      // if there is a pending scheduled speak, cancel it and clear speaking state
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
        setIsSpeaking(false);
      }
      // mark as speaking immediately so callers (timers) can pause while waiting
      setIsSpeaking(true);
      speakTimeoutRef.current = window.setTimeout(() => {
        speak(text, onEnd);
        speakTimeoutRef.current = null;
      }, delay);
    },
    [speak],
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
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
      dingTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const enableNoSleep = useCallback(() => {
    if (noSleepRef.current) {
      noSleepRef.current.enable();
    }
  }, []);

  const disableNoSleep = useCallback(() => {
    if (noSleepRef.current) {
      noSleepRef.current.disable();
    }
  }, []);

  return {
    initAudio,
    unlockAudio,
    playDing,
    speak,
    scheduleSpeak,
    playDoubleDing,
    cancelAll,
    enableNoSleep,
    disableNoSleep,
    isSpeaking,
  };
}

export default useAudio;
