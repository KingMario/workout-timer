'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import NoSleep from 'nosleep.js';
import CustomPlanWizard from '../components/CustomPlanWizard';
import type { WorkoutPlan } from '../schemas/workout-plan';

// --- Types ---
interface Step {
  name: string;
  desc: string;
  duration: number;
  section: string;
}

// Ensure compatibility with the schema
type Section = WorkoutPlan[number];

// --- Data ---
const DEFAULT_PLAN: Section[] = [
  {
    name: '热身',
    tips: '唤醒身体，润滑关节，为运动做好准备。全程保持自然呼吸。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '颈部画圆',
        desc: '坐或站，下巴带动头部，缓慢向前、向下、向左、向后画半圆，再反向。重复。仅活动颈部。',
        duration: 60,
      },
      {
        name: '肩部时钟',
        desc: '双臂自然下垂。想象肩膀是时针，缓慢地向前、向上、向后、向下画圈。正反方向各30秒。',
        duration: 60,
      },
      {
        name: '猫牛式',
        desc: '四足跪姿。吸气塌腰抬头（牛式），呼气拱背低头（猫式）。感受脊柱一节节活动。',
        duration: 60,
      },
      {
        name: '原地提膝走',
        desc: '缓慢进行，将膝盖轻松地抬向胸前，手臂自然摆动。目的是温和提升心率。',
        duration: 60,
      },
      {
        name: '脚踝与手腕绕环',
        desc: '坐姿，伸直腿和手臂，缓慢活动踝关节和手腕。',
        duration: 60,
      },
    ],
  },
  {
    name: '力量训练',
    tips: '注重肌肉感受与控制，而非速度和次数。',
    allowRounds: true,
    defaultRounds: 2,
    maxRounds: 2,
    steps: [
      {
        name: '靠墙天使',
        desc: '背靠墙站立，头、上背、臀部贴墙。手臂呈“W”形贴墙，缓慢上举至“Y”形，再下放。感受肩胛骨的活动。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '坐姿自重深蹲',
        desc: '坐在椅子边缘，双脚与肩同宽。缓慢站起至完全直立，再缓慢控制下坐（臀部轻触椅子即起）。全程核心收紧，背部挺直。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '臀桥',
        desc: '仰卧，屈膝，双脚平放。缓慢将臀部抬离地面，至膝、髋、肩呈直线，顶峰收缩1秒，缓慢下放。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '跪姿俯卧撑',
        desc: '采用跪姿，双手略宽于肩。身体下降时感受胸部拉伸，推起时不必完全伸直手臂，保持微屈。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '鸟狗式',
        desc: '四足跪姿。缓慢将对侧的手和腿向前向后伸直，与身体成一直线，保持核心收紧身体稳定，缓慢收回。换边。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
    ],
  },
  {
    name: '有氧',
    tips: '采用“低冲击、持续性”动作，将心率维持在温和提升的水平。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      { name: '原地踏步', desc: '正常速度。', duration: 60 },
      {
        name: '踏步+侧抬腿',
        desc: '每侧交替进行，腿向外侧平缓抬起，感受髋部活动。',
        duration: 60,
      },
      {
        name: '踏步+轻微提膝',
        desc: '回到温和踏步，偶尔轻抬膝盖。',
        duration: 60,
      },
    ],
  },
  {
    name: '放松',
    tips: '专注于拉伸和呼吸，帮助身体恢复平静。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '股四头肌拉伸',
        desc: '站立，一手扶墙，另一手抓住同侧脚踝，将脚跟轻轻拉向臀部，感受大腿前侧拉伸。',
        duration: 30,
      },
      { name: '换边', desc: '换另一侧拉伸。', duration: 30 },
      {
        name: '胸部与肩部拉伸',
        desc: '站立，双手在背后十指相扣，轻轻将手臂向上抬（如做不到，可双手扶墙，身体前倾）。',
        duration: 30,
      },
      {
        name: '腹式深呼吸',
        desc: '坐或躺，一手放腹部。用鼻子缓慢吸气4秒，感受腹部鼓起；用嘴巴缓慢呼气6秒，感受腹部收紧。重复。',
        duration: 30,
      },
    ],
  },
];

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

export default function WorkoutTimer() {
  const [planSections, setPlanSections] = useState<Section[]>(DEFAULT_PLAN);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

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

  const noSleepRef = useRef<NoSleep | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const planListRef = useRef<HTMLDivElement>(null);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setIsSpeaking(false);
    setCurrentIdx(0);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Update rounds when plan changes
  useEffect(() => {
    const initial: Record<string, number> = {};
    planSections.forEach((s) => {
      initial[s.name] = s.defaultRounds;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSectionRounds(initial);
    handleReset();
  }, [planSections, handleReset]);

  const handlePlanLoaded = (newPlan: WorkoutPlan) => {
    setPlanSections(newPlan);
    // Reset rounds will happen in the useEffect above
  };

  // Derive steps from sectionRounds using useMemo
  const steps = React.useMemo(() => {
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

  //Reset time when steps change or component mounts (but not when pausing)
  useEffect(() => {
    if (
      isMounted &&
      !isRunning &&
      !isFinished &&
      steps.length > 0 &&
      currentIdx === 0
    ) {
      // Only reset to first step if we're actually on the first step
      // This prevents resetting time when pausing on other steps
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(steps[0].duration);
    }
  }, [steps, isMounted]); // Removed isRunning and isFinished from dependencies

  useEffect(() => {
    if (typeof window !== 'undefined') {
      noSleepRef.current = new NoSleep();
    }
  }, []);

  const playDing = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const AudioContextClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (
        !ttsEnabled ||
        typeof window === 'undefined' ||
        !window.speechSynthesis
      ) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Mark as speaking to pause the timer
      setIsSpeaking(true);

      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';

      msg.onend = () => {
        setIsSpeaking(false);
        playDing();
      };

      msg.onerror = (e) => {
        console.error('Speech error', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(msg);
    },
    [ttsEnabled, playDing],
  );

  const playDoubleDing = useCallback(() => {
    playDing();
    setTimeout(playDing, 300);
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
          setTimeout(() => {
            speak(`${steps[nextIdx].name}。${steps[nextIdx].desc}`);
          }, 1000);
        } else {
          setTimeout(() => {
            setIsSpeaking(false);
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

  // Scroll to current item
  useEffect(() => {
    const currentEl = planListRef.current?.querySelector('.current-step');
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIdx]);

  const togglePlay = () => {
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
      // 在此确保暂停时保存当前剩余时间
      setTimeLeft((prev) => Math.max(0, prev));
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const jumpToStep = (idx: number) => {
    const isSameStep = idx === currentIdx;
    setCurrentIdx(idx);
    if (!isRunning && isSameStep) {
      // 在暂停状态下如果是同一步骤，保持当前剩余时间
      // If paused and same step, keep current time
    } else {
      // 否则重置为新步骤的初始时间
      setTimeLeft(steps[idx].duration);
      if (isRunning) {
        speak(`${steps[idx].name}。${steps[idx].desc}`);
      }
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
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-start">
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
              剩余：{formatTime(timeLeft)} / {formatTime(remainingTotalTime)}
            </span>
          </div>
        </div>

        <div className="mt-3 min-h-[80px]">
          {!isMounted || steps.length === 0 ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-50 dark:bg-zinc-900 rounded w-full"></div>
              <div className="h-4 bg-gray-50 dark:bg-zinc-900 rounded w-2/3"></div>
            </div>
          ) : isFinished ? (
            <div className="animate-in fade-in duration-500">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                🎉 恭喜完成全部锻炼！
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg mt-1 border border-blue-100 dark:border-blue-900/50">
                💡 建议补水、拉伸，享受轻松时刻。
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
              {planSections.find((s) => s.name === steps[currentIdx]?.section)
                ?.tips && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg mt-2 border border-blue-100 dark:border-blue-900/50">
                  💡{' '}
                  {
                    planSections.find(
                      (s) => s.name === steps[currentIdx]?.section,
                    )?.tips
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Plan List */}
      <div ref={planListRef} className="flex-1 overflow-y-auto px-5 pb-32 pt-2">
        <div className="flex flex-col">
          {!isMounted || steps.length === 0 ? (
            <div className="animate-pulse flex flex-col gap-4 mt-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-8 h-4 bg-gray-100 dark:bg-zinc-800 rounded"></div>
                  <div className="flex-1 h-5 bg-gray-50 dark:bg-zinc-900 rounded"></div>
                  <div className="w-16 h-4 bg-gray-50 dark:bg-zinc-900 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            steps.map((step, idx) => {
              const isFirstInSection =
                idx === 0 || steps[idx - 1].section !== step.section;
              const section = planSections.find((s) => s.name === step.section);

              return (
                <React.Fragment key={idx}>
                  {isFirstInSection && (
                    <div className="flex justify-between items-center mt-4 mb-2 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm py-2 z-[5] border-b border-gray-50 dark:border-zinc-800">
                      <div className="flex items-center gap-2 font-bold text-green-600 dark:text-green-500">
                        {step.section}阶段
                        <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">
                          (
                          {formatTime(
                            steps
                              .filter((s) => s.section === step.section)
                              .reduce((acc, s) => acc + s.duration, 0),
                          )}
                          )
                        </span>
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
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                      idx === currentIdx
                        ? 'current-step bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-100 dark:ring-blue-900/50'
                        : 'hover:bg-gray-50 dark:hover:bg-zinc-900/50'
                    }`}
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
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-50/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-green-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-lg z-20 transition-colors duration-300">
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-3 rounded-full transition-colors ${ttsEnabled ? 'text-green-600 dark:text-green-400 bg-white dark:bg-zinc-800 shadow-sm' : 'text-gray-400 dark:text-zinc-600 bg-gray-100 dark:bg-zinc-900'}`}
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
                clipRule="evenodd"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-green-600 dark:text-green-400 shadow-md hover:shadow-lg active:scale-95 transition-all border border-green-100 dark:border-zinc-700"
            title={isRunning ? '暂停' : '开始'}
          >
            {isRunning ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
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
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 shadow-sm hover:shadow-md active:scale-95 transition-all border border-red-50 dark:border-zinc-700"
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
        </div>
      </div>
    </div>
  );
}
