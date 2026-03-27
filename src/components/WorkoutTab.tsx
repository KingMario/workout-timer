'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useAudio from '../hooks/useAudio';
import { DEFAULT_PLAN } from '../schemas/default-plan';
import type { WorkoutPlan } from '../schemas/workout-plan';
import { getActivePlan, saveActivePlan } from '../utils/storage';
import CustomPlanWizard from './CustomPlanWizard';

interface Step {
  name: string;
  desc: string;
  duration: number;
  section: string;
}

type Section = WorkoutPlan[number];

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

export default function WorkoutTab() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [planSections, setPlanSections] = useState<Section[]>(DEFAULT_PLAN);
  const [isMounted, setIsMounted] = useState(false);
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
  // use speaking state from audio hook to avoid duplication
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const planListRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setIsMounted(true);
    const active = getActivePlan();
    if (active) {
      setPlanSections(active.plan);
    }
  }, []);

  useEffect(() => {
    const initial: Record<string, number> = {};
    planSections.forEach((s) => {
      initial[s.name] = s.defaultRounds;
    });
    setSectionRounds(initial);
    // reset when plan changes
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planSections]);
  const {
    unlockAudio,
    speak,
    scheduleSpeak,
    playDoubleDing,
    cancelAll,
    enableNoSleep,
    disableNoSleep,
    isSpeaking,
  } = useAudio(ttsEnabled);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setCurrentIdx(0);
    if (stepsRef.current.length > 0) {
      setTimeLeft(stepsRef.current[0].duration);
    }
    cancelAll();
  }, [cancelAll]);

  const handleNextStep = useCallback(() => {
    if (currentIdx < steps.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(steps[nextIdx].duration);
      if (isRunning) {
        playDoubleDing();
        if (ttsEnabled) {
          scheduleSpeak(`${steps[nextIdx].name}。${steps[nextIdx].desc}`, 1000);
        } else {
          scheduleSpeak('', 1000);
        }
      }
    } else {
      playDoubleDing();
      setIsRunning(false);
      setIsFinished(true);
      disableNoSleep();
    }
  }, [
    currentIdx,
    steps,
    isRunning,
    playDoubleDing,
    ttsEnabled,
    scheduleSpeak,
    disableNoSleep,
  ]);

  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isSpeaking) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !isSpeaking) {
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
      enableNoSleep();
      // speak() updates hook speaking state internally
      speak(`${steps[currentIdx].name}。${steps[currentIdx].desc}`);
    } else {
      setIsRunning(false);
      cancelAll();
    }
  }, [
    unlockAudio,
    isRunning,
    isFinished,
    handleReset,
    speak,
    steps,
    currentIdx,
    enableNoSleep,
    cancelAll,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or focused on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, handleReset]);

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
    <div className="flex flex-col h-full">
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">💪 灵动健身 (FlexWorkout)</h2>
          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              ✨ 计划库
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="w-full h-3 bg-blue-50 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-500 to-blue-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            <span>已用时：{formatTime(usedTime)}</span>
            <span>
              剩余：{formatTime(timeLeft)} / {formatTime(remainingTotalTime)}
            </span>
          </div>
        </div>

        <div className="mt-3 min-h-20">
          {!isMounted || steps.length === 0 ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-50 dark:bg-zinc-900 rounded w-full"></div>
            </div>
          ) : isFinished ? (
            <div className="animate-in fade-in duration-500">
              <div className="text-lg font-bold">🎉 恭喜完成锻炼！</div>
            </div>
          ) : (
            <>
              <div className="text-lg font-bold">{steps[currentIdx]?.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {steps[currentIdx]?.desc}
              </div>
            </>
          )}
        </div>
      </div>

      <div ref={planListRef} className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
        <div className="flex flex-col">
          {steps.map((step, idx) => {
            const isFirstInSection =
              idx === 0 || steps[idx - 1].section !== step.section;
            const section = planSections.find((s) => s.name === step.section);
            return (
              <React.Fragment key={idx}>
                {isFirstInSection && (
                  <div className="mt-4 mb-2 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm py-2 z-5 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                    <div className="font-bold text-green-600 dark:text-green-500">
                      {step.section}阶段
                    </div>
                    {section?.allowRounds && (
                      <select
                        aria-label="section rounds"
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
      </div>

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
        </div>
      </div>

      {isWizardOpen && (
        <CustomPlanWizard
          onClose={() => setIsWizardOpen(false)}
          onPlanLoaded={(plan: WorkoutPlan, id?: string) => {
            setPlanSections(plan);
            saveActivePlan(plan, id);
          }}
          activePlanId={getActivePlan()?.id}
        />
      )}
    </div>
  );
}
