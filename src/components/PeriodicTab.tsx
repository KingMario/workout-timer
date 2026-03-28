'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useAudio from '../hooks/useAudio';
import { BREAK_PLAN } from '../schemas/break-plan';
import type { WorkoutPlan } from '../schemas/workout-plan';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface PeriodicTabProps {
  /**
   * For testing: override the initial interval (minutes).
   * Defaults to 30 in production usage.
   */
  initialIntervalMinutes?: number;
  /**
   * For testing: override the initial remaining time in seconds.
   * Defaults to interval * 60 in production usage.
   */
  initialTimeLeftSeconds?: number;
  /**
   * For testing: start directly in "running" state.
   * Defaults to false in production usage.
   */
  initialIsRunning?: boolean;
}

export default function PeriodicTab({
  initialIntervalMinutes,
  initialTimeLeftSeconds,
  initialIsRunning,
}: PeriodicTabProps = {}) {
  const defaultInterval = initialIntervalMinutes ?? 30;
  const [periodicInterval, setPeriodicInterval] = useState(defaultInterval);
  const [periodicTimeLeft, setPeriodicTimeLeft] = useState(
    initialTimeLeftSeconds ?? defaultInterval * 60,
  );
  const [isPeriodicRunning, setIsPeriodicRunning] = useState(
    initialIsRunning ?? false,
  );
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
  const {
    initAudio,
    unlockAudio,
    speak,
    scheduleSpeak,
    playDoubleDing,
    cancelAll,
    enableNoSleep,
    disableNoSleep,
  } = useAudio(true);
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breakStepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ensure audio is available when component mounts
    initAudio();
  }, [initAudio]);

  const handleNextBreakStep = useCallback(() => {
    if (activeBreakIdx < 2) {
      const nextIdx = activeBreakIdx + 1;
      setActiveBreakIdx(nextIdx);
      setBreakStepTimeLeft(30);
      playDoubleDing();
      scheduleSpeak(
        `${activeBreakSteps[nextIdx].name}。${activeBreakSteps[nextIdx].desc}`,
        1000,
      );
    } else {
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
    scheduleSpeak,
    playDoubleDing,
  ]);

  const triggerPeriodicBreak = useCallback(() => {
    playDoubleDing();
    const toSuggest = shuffledStretches.slice(0, 3);
    setLastSuggested(toSuggest);
    setActiveBreakSteps(toSuggest);
    setActiveBreakIdx(0);
    setBreakStepTimeLeft(30);
    setIsBreakActive(true);
    setShuffledStretches((prev) => {
      const next = prev.slice(3);
      return [...next, ...toSuggest];
    });
    const message = toSuggest[0]
      ? `休息时间到了。第一个动作：${toSuggest[0].name}。${toSuggest[0].desc}`
      : '休息时间到了。';
    speak(message);
  }, [shuffledStretches, speak, playDoubleDing]);

  useEffect(() => {
    if (isPeriodicRunning && !isBreakActive && periodicTimeLeft > 0) {
      periodicTimerRef.current = setInterval(() => {
        let shouldTrigger = false;
        setPeriodicTimeLeft((prev) => {
          if (prev <= 1) {
            shouldTrigger = true;
            return 0;
          }
          return prev - 1;
        });
        if (shouldTrigger) {
          triggerPeriodicBreak();
        }
      }, 1000);
    } else if (periodicTimeLeft <= 0 && isPeriodicRunning && !isBreakActive) {
      // avoid calling setState synchronously inside effect
      // schedule asynchronously to prevent cascading renders
      setTimeout(() => triggerPeriodicBreak(), 0);
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
    isBreakActive,
  ]);

  useEffect(() => {
    if (isPeriodicRunning && isBreakActive && breakStepTimeLeft > 0) {
      breakStepTimerRef.current = setInterval(() => {
        let shouldNext = false;
        setBreakStepTimeLeft((prev) => {
          if (prev <= 1) {
            shouldNext = true;
            return 0;
          }
          return prev - 1;
        });
        if (shouldNext) {
          handleNextBreakStep();
        }
      }, 1000);
    } else if (breakStepTimeLeft <= 0 && isPeriodicRunning && isBreakActive) {
      // avoid calling setState synchronously inside effect
      // schedule asynchronously to prevent cascading renders
      setTimeout(() => handleNextBreakStep(), 0);
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
  ]);

  const togglePeriodic = useCallback(() => {
    unlockAudio();
    if (!isPeriodicRunning) {
      setIsPeriodicRunning(true);
      enableNoSleep();
      speak('间歇拉伸已开启。');
    } else {
      setIsPeriodicRunning(false);
      setIsBreakActive(false);
      setActiveBreakSteps([]);
      cancelAll();
      disableNoSleep();
    }
  }, [
    unlockAudio,
    isPeriodicRunning,
    speak,
    enableNoSleep,
    cancelAll,
    disableNoSleep,
  ]);

  const formatClock = (sec: number) => {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mt-2">
        <h2 className="text-xl font-bold">⏰ 办公间歇拉伸</h2>
        {isBreakActive && activeBreakSteps[activeBreakIdx] ? (
          <div
            role="status"
            aria-live="polite"
            aria-label={`正在休息，第 ${activeBreakIdx + 1} / 3 个动作，剩余 ${breakStepTimeLeft} 秒`}
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2 duration-300 mt-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                正在休息 ({activeBreakIdx + 1}/3)
              </div>
              <div
                className="text-xl font-mono font-bold text-blue-700 dark:text-blue-300"
                aria-hidden="true"
              >
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
          <div className="grid grid-cols-2 gap-4 items-end mt-4">
            <div>
              <label
                htmlFor="periodic-interval"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                提醒频率
              </label>
              <select
                id="periodic-interval"
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
                {formatClock(periodicTimeLeft)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-6">
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

        <div className="p-4 border border-gray-100 dark:border-zinc-800 rounded-xl mt-4">
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
              ...及其他 {Math.max(0, shuffledStretches.length - 10)} 个
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-lg z-20">
        <div />
        <div className="flex items-center gap-4">
          <button
            onClick={togglePeriodic}
            aria-label={isPeriodicRunning ? '停止自动提醒' : '开启自动提醒'}
            aria-pressed={isPeriodicRunning}
            className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all active:scale-95 ${isPeriodicRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-700 hover:bg-green-800'}`}
          >
            {isPeriodicRunning ? '停止提醒' : '开启自动提醒'}
          </button>
        </div>
      </div>
    </div>
  );
}
