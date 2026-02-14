'use client';

import NoSleep from 'nosleep.js';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CustomPlanWizard from '../components/CustomPlanWizard';
import { BREAK_PLAN } from '../schemas/break-plan';
import { DEFAULT_PLAN } from '../schemas/default-plan';
import type { WorkoutPlan } from '../schemas/workout-plan';
import {
  clearActivePlan,
  getActivePlan,
  saveActivePlan,
} from '../utils/planStorage';

// --- Types ---
interface Step {
  name: string;
  desc: string;
  duration: number;
  section: string;
}

type Section = WorkoutPlan[number];

// --- Helper ---
const formatTime = (sec: number) => {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  let str = '';
  if (m > 0) {
    str += m + "'";
  }
  if (s > 0 || m === 0) {
    str += s + '"';
  }
  return str;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function WorkoutTimer() {
  const [mode, setMode] = useState<'workout' | 'periodic'>('workout');
  const [planSections, setPlanSections] = useState<Section[]>(DEFAULT_PLAN);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | undefined>(
    undefined,
  );

  // --- Workout Mode States ---
  const [sectionRounds, setSectionRounds] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      DEFAULT_PLAN.forEach((s) => {
        initial[s.name] = s.defaultRounds;
      });
      return initial;
    },
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // --- Periodic Mode States ---
  const [periodicInterval, setPeriodicInterval] = useState(30); // minutes
  const [periodicTimeLeft, setPeriodicTimeLeft] = useState(30 * 60);
  const [isPeriodicRunning, setIsPeriodicRunning] = useState(false);
  const [shuffledStretches, setShuffledStretches] = useState<
    WorkoutPlan[number]['steps']
  >(() => {
    const allSteps = BREAK_PLAN.flatMap((s) => s.steps);
    return shuffleArray(allSteps);
  });
  const [lastSuggested, setLastSuggested] = useState<
    WorkoutPlan[number]['steps']
  >([]);
  const [activeBreakSteps, setActiveBreakSteps] = useState<
    WorkoutPlan[number]['steps']
  >([]);
  const [activeBreakIdx, setActiveBreakIdx] = useState(0);
  const [breakStepTimeLeft, setBreakStepTimeLeft] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);

  const noSleepRef = useRef<NoSleep | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breakStepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const dingTimeoutRef = useRef<number | null>(null);
  const planListRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const steps = useMemo(() => {
    let newSteps: Step[] = [];
    planSections.forEach((section) => {
      const rounds = section.allowRounds
        ? sectionRounds[section.name] || section.defaultRounds
        : 1;
      for (let i = 0; i < rounds; i++) {
        newSteps = newSteps.concat(
          section.steps.map((s) => ({ ...s, section: section.name })),
        );
      }
    });
    return newSteps;
  }, [sectionRounds, planSections]);

  const stepsRef = useRef<Step[]>(steps);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setIsSpeaking(false);
    setCurrentIdx(0);
    setIsBreakActive(false);
    setActiveBreakSteps([]);
    if (stepsRef.current.length > 0) {
      setTimeLeft(stepsRef.current[0].duration);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
      dingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const active = getActivePlan();
    if (active) {
      setPlanSections(active.plan);

      setHasActivePlan(true);

      setActivePlanId(active.id);
    } else {
      setHasActivePlan(false);

      setActivePlanId(undefined);
    }
  }, []);

  useEffect(() => {
    const initial: Record<string, number> = {};
    planSections.forEach((s) => {
      initial[s.name] = s.defaultRounds;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSectionRounds(initial);
    handleReset();
  }, [planSections, handleReset]);

  const handlePlanLoaded = (newPlan: WorkoutPlan, id?: string) => {
    setPlanSections(newPlan);
    saveActivePlan(newPlan, id);
    setHasActivePlan(true);
    setActivePlanId(id);
  };

  const handleRestoreDefault = () => {
    if (confirm('确定要恢复默认计划吗？')) {
      setPlanSections(DEFAULT_PLAN);
      clearActivePlan();
      setHasActivePlan(false);
      setActivePlanId(undefined);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      noSleepRef.current = new NoSleep();
    }
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
      } catch {
        // ignore resume errors
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      try {
        source.start(0);
      } catch {
        // ignore start errors on some mobile browsers
      }
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
          // if resume fails, bail out
          return;
        }
      }
      // play ding tone
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
      // schedule disconnect to avoid accumulating nodes
      window.setTimeout(() => {
        try {
          osc.disconnect();
        } catch {
          // ignore
        }
        try {
          gain.disconnect();
        } catch {
          // ignore
        }
      }, 800);
    } catch (e) {
      console.error('Audio play failed', e);
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
      // Cancel previous utterances and clear pending speak timers
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
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
    [ttsEnabled, playDing],
  );

  const playDoubleDing = useCallback(() => {
    // clear any pending ding
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

  const handleNextStep = useCallback(() => {
    if (currentIdx < steps.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(steps[nextIdx].duration);
      if (isRunning) {
        setIsSpeaking(true);
        playDoubleDing();
        if (ttsEnabled) {
          if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = null;
          }
          speakTimeoutRef.current = window.setTimeout(() => {
            speak(`${steps[nextIdx].name}。${steps[nextIdx].desc}`);
            speakTimeoutRef.current = null;
          }, 1000);
        } else {
          if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = null;
          }
          speakTimeoutRef.current = window.setTimeout(() => {
            setIsSpeaking(false);
            speakTimeoutRef.current = null;
          }, 1000);
        }
      }
    } else {
      playDoubleDing();
      setIsRunning(false);
      setIsFinished(true);
      if (noSleepRef.current) {
        noSleepRef.current.disable();
      }
    }
  }, [currentIdx, steps, isRunning, speak, playDoubleDing, ttsEnabled]);

  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isSpeaking) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !isSpeaking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleNextStep();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, handleNextStep, isSpeaking]);

  useEffect(() => {
    const currentEl = planListRef.current?.querySelector('.current-step');
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIdx]);

  const togglePlay = useCallback(() => {
    unlockAudio();
    if (!isRunning) {
      if (isFinished) {
        handleReset();
        return;
      }
      setIsRunning(true);
      if (noSleepRef.current) {
        noSleepRef.current.enable();
      }
      speak(`${steps[currentIdx].name}。${steps[currentIdx].desc}`);
    } else {
      setIsRunning(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // ensure speaking state and pending timers cleared
      setIsSpeaking(false);
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
        dingTimeoutRef.current = null;
      }
    }
  }, [
    unlockAudio,
    isRunning,
    isFinished,
    handleReset,
    speak,
    steps,
    currentIdx,
  ]);

  const handleNextBreakStep = useCallback(() => {
    if (activeBreakIdx < 2) {
      const nextIdx = activeBreakIdx + 1;
      setActiveBreakIdx(nextIdx);
      setBreakStepTimeLeft(30);
      playDoubleDing();
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      speakTimeoutRef.current = window.setTimeout(() => {
        speak(
          `${activeBreakSteps[nextIdx].name}。${activeBreakSteps[nextIdx].desc}`,
        );
        speakTimeoutRef.current = null;
      }, 1000);
    } else {
      // Finished all 3
      setIsBreakActive(false);
      setActiveBreakSteps([]);
      setPeriodicTimeLeft(periodicInterval * 60);
      speak('休息结束，继续工作吧。');
    }
  }, [
    activeBreakIdx,
    activeBreakSteps,
    periodicInterval,
    speak,
    playDoubleDing,
  ]);

  const triggerPeriodicBreak = useCallback(() => {
    playDoubleDing();

    // Pick 3 from pool
    const toSuggest = shuffledStretches.slice(0, 3);
    setLastSuggested(toSuggest);
    setActiveBreakSteps(toSuggest);
    setActiveBreakIdx(0);
    setBreakStepTimeLeft(30);
    setIsBreakActive(true);

    // Move to end
    setShuffledStretches((prev) => {
      const next = prev.slice(3);
      return [...next, ...toSuggest];
    });

    // speak immediately for periodic trigger
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    speak(
      `休息时间到了。第一个动作：${toSuggest[0].name}。${toSuggest[0].desc}`,
    );
  }, [shuffledStretches, speak, playDoubleDing]);

  // Periodic Timer Effect
  useEffect(() => {
    if (
      isPeriodicRunning &&
      !isBreakActive &&
      periodicTimeLeft > 0 &&
      !isSpeaking
    ) {
      periodicTimerRef.current = setInterval(() => {
        setPeriodicTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      periodicTimeLeft === 0 &&
      isPeriodicRunning &&
      !isBreakActive &&
      !isSpeaking
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      triggerPeriodicBreak();
    }
    return () => {
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, [
    isPeriodicRunning,
    periodicTimeLeft,
    triggerPeriodicBreak,
    isSpeaking,
    isBreakActive,
  ]);

  // Break Step Timer Effect
  useEffect(() => {
    if (
      isPeriodicRunning &&
      isBreakActive &&
      breakStepTimeLeft > 0 &&
      !isSpeaking
    ) {
      breakStepTimerRef.current = setInterval(() => {
        setBreakStepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      breakStepTimeLeft === 0 &&
      isPeriodicRunning &&
      isBreakActive &&
      !isSpeaking
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleNextBreakStep();
    }
    return () => {
      if (breakStepTimerRef.current) {
        clearInterval(breakStepTimerRef.current);
      }
    };
  }, [
    isPeriodicRunning,
    isBreakActive,
    breakStepTimeLeft,
    handleNextBreakStep,
    isSpeaking,
  ]);

  const togglePeriodic = useCallback(() => {
    unlockAudio();
    if (!isPeriodicRunning) {
      setIsPeriodicRunning(true);
      if (noSleepRef.current) {
        noSleepRef.current.enable();
      }
      speak('间歇拉伸已开启。');
    } else {
      setIsPeriodicRunning(false);
      setIsBreakActive(false);
      setActiveBreakSteps([]);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
        dingTimeoutRef.current = null;
      }
    }
  }, [unlockAudio, isPeriodicRunning, speak]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (isTyping) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (mode === 'workout') {
          togglePlay();
        } else {
          togglePeriodic();
        }
      } else if (e.key === 'Escape') {
        if (!isWizardOpen) {
          if (mode === 'workout') {
            handleReset();
          } else {
            setIsBreakActive(false);
            setActiveBreakSteps([]);
            setPeriodicTimeLeft(periodicInterval * 60);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    handleReset,
    isWizardOpen,
    mode,
    togglePeriodic,
    periodicInterval,
  ]);

  const jumpToStep = (idx: number) => {
    unlockAudio();
    setCurrentIdx(idx);
    setTimeLeft(steps[idx].duration);
    if (isRunning) {
      speak(`${steps[idx].name}。${steps[idx].desc}`);
    }
  };

  const totalTime = steps.reduce((acc, s) => acc + s.duration, 0);
  const usedTime =
    steps.slice(0, currentIdx).reduce((acc, s) => acc + s.duration, 0) +
    (steps[currentIdx]?.duration - timeLeft || 0);
  const progressPercent = totalTime > 0 ? (usedTime / totalTime) * 100 : 0;
  const remainingTotalTime = steps
    .slice(currentIdx)
    .reduce((acc, s, i) => acc + (i === 0 ? timeLeft : s.duration), 0);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <CustomPlanWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPlanLoaded={handlePlanLoaded}
        onRestoreDefault={handleRestoreDefault}
        hasCustomPlan={hasActivePlan}
        activePlanId={activePlanId}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
            <button
              onClick={() => setMode('workout')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'workout' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              专注锻炼
            </button>
            <button
              onClick={() => setMode('periodic')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'periodic' ? 'bg-white dark:bg-zinc-800 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              间歇拉伸
            </button>
          </div>
        </div>

        {mode === 'workout' ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                💪 灵动健身 (FlexWorkout)
              </h1>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                ✨ 定制计划
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="w-full h-3 bg-blue-50 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                <span>已用时：{formatTime(usedTime)}</span>
                <span>
                  剩余：{formatTime(timeLeft)} /{' '}
                  {formatTime(remainingTotalTime)}
                </span>
              </div>
            </div>
            <div className="mt-3 min-h-[80px]">
              {!isMounted || steps.length === 0 ? (
                <div className="animate-pulse flex flex-col gap-2">
                  <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-50 dark:bg-zinc-900 rounded w-full"></div>
                </div>
              ) : isFinished ? (
                <div className="animate-in fade-in duration-500">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    🎉 恭喜完成锻炼！
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {steps[currentIdx]?.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {steps[currentIdx]?.desc}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="py-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              ⏰ 办公间歇拉伸
            </h1>

            {isBreakActive && activeBreakSteps[activeBreakIdx] ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    正在休息 ({activeBreakIdx + 1}/3)
                  </div>
                  <div className="text-xl font-mono font-bold text-blue-700 dark:text-blue-300">
                    {breakStepTimeLeft}s
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {activeBreakSteps[activeBreakIdx].name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {activeBreakSteps[activeBreakIdx].desc}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    提醒频率
                  </label>
                  <select
                    value={periodicInterval}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPeriodicInterval(val);
                      setPeriodicTimeLeft(val * 60);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm"
                  >
                    <option value={15}>每 15 分钟</option>
                    <option value={30}>每 30 分钟</option>
                    <option value={45}>每 45 分钟</option>
                    <option value={60}>每 60 分钟</option>
                  </select>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/50 text-center">
                  <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">
                    下次提醒倒计时
                  </div>
                  <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-300">
                    {Math.floor(periodicTimeLeft / 60)}:
                    {String(periodicTimeLeft % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div ref={planListRef} className="flex-1 overflow-y-auto px-5 pb-32 pt-2">
        {mode === 'workout' ? (
          <div className="flex flex-col">
            {steps.map((step, idx) => {
              const isFirstInSection =
                idx === 0 || steps[idx - 1].section !== step.section;
              const section = planSections.find((s) => s.name === step.section);
              return (
                <React.Fragment key={idx}>
                  {isFirstInSection && (
                    <div className="mt-4 mb-2 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm py-2 z-[5] border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                      <div className="font-bold text-green-600 dark:text-green-500">
                        {step.section}阶段
                      </div>
                      {section?.allowRounds && (
                        <select
                          disabled={isRunning}
                          value={
                            sectionRounds[step.section] || section.defaultRounds
                          }
                          onChange={(e) => {
                            setSectionRounds((prev) => ({
                              ...prev,
                              [step.section]: parseInt(e.target.value),
                            }));
                            handleReset();
                          }}
                          className="text-sm border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                        >
                          {[...Array(section.maxRounds)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}次
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  <div
                    onClick={() => jumpToStep(idx)}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${idx === currentIdx ? 'current-step bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-100 dark:ring-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-zinc-900/50'}`}
                  >
                    <span className="w-8 text-gray-400 dark:text-zinc-500 text-sm mt-0.5">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 flex justify-between items-center">
                      <span
                        className={`font-medium ${idx === currentIdx ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {step.name}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-zinc-500">
                        ({formatTime(step.duration)})
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                💡 最近推荐的动作
              </h3>
              {lastSuggested.length > 0 ? (
                <div className="space-y-3">
                  {lastSuggested.map((s, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm"
                    >
                      <div className="font-bold text-gray-800 dark:text-gray-200">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {s.desc}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-blue-600/60 dark:text-blue-400/60 italic text-center py-4">
                  提醒尚未触发，请保持开启状态...
                </div>
              )}
            </div>

            <div className="p-4 border border-gray-100 dark:border-zinc-800 rounded-xl">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                待选动作池 ({shuffledStretches.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {shuffledStretches.slice(0, 10).map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-900 text-[10px] rounded border border-gray-100 dark:border-zinc-800 text-gray-500"
                  >
                    {s.name}
                  </span>
                ))}
                <span className="px-2 py-1 text-[10px] text-gray-400 italic">
                  ...及其他 {shuffledStretches.length - 10} 个
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-lg z-20">
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-3 rounded-full transition-colors ${ttsEnabled ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm' : 'text-gray-400 bg-gray-100 dark:bg-zinc-800'}`}
          title="语音播报开关"
        >
          {ttsEnabled ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H3v6h3l5 4V5z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-4">
          {mode === 'workout' ? (
            <>
              <button
                onClick={togglePlay}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                title={isRunning ? '暂停' : '开始'}
              >
                {isRunning ? (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-red-500 shadow-sm"
                title="重置"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={togglePeriodic}
              className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all active:scale-95 ${isPeriodicRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
              title={isPeriodicRunning ? '停止提醒' : '开启自动提醒'}
            >
              {isPeriodicRunning ? '停止提醒' : '开启自动提醒'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
