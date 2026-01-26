"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NoSleep from "nosleep.js";

// --- Types ---
interface Step {
  name: string;
  desc: string;
  duration: number;
  section: string;
}

interface Section {
  name: string;
  tips: string;
  allowRounds: boolean;
  defaultRounds: number;
  maxRounds: number;
  steps: { name: string; desc: string; duration: number }[];
}

// --- Data ---
const PLAN_SECTIONS: Section[] = [
  {
    name: "热身",
    tips: "唤醒身体，润滑关节，为运动做好准备。全程保持自然呼吸。",
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      { name: "颈部画圆", desc: "坐或站，下巴带动头部，缓慢向前、向下、向左、向后画半圆，再反向。重复。仅活动颈部。", duration: 60 },
      { name: "肩部时钟", desc: "双臂自然下垂。想象肩膀是时针，缓慢地向前、向上、向后、向下画圈。正反方向各30秒。", duration: 60 },
      { name: "猫牛式", desc: "四足跪姿。吸气塌腰抬头（牛式），呼气拱背低头（猫式）。感受脊柱一节节活动。", duration: 60 },
      { name: "原地提膝走", desc: "缓慢进行，将膝盖轻松地抬向胸前，手臂自然摆动。目的是温和提升心率。", duration: 60 },
      { name: "脚踝与手腕绕环", desc: "坐姿，伸直腿和手臂，缓慢活动踝关节和手腕。", duration: 60 },
    ],
  },
  {
    name: "力量训练",
    tips: "注重肌肉感受与控制，而非速度和次数。",
    allowRounds: true,
    defaultRounds: 2,
    maxRounds: 2,
    steps: [
      { name: "靠墙天使", desc: "背靠墙站立，头、上背、臀部贴墙。手臂呈“W”形贴墙，缓慢上举至“Y”形，再下放。感受肩胛骨的活动。", duration: 45 },
      { name: "休息", desc: "", duration: 15 },
      { name: "坐姿自重深蹲", desc: "坐在椅子边缘，双脚与肩同宽。缓慢站起至完全直立，再缓慢控制下坐（臀部轻触椅子即起）。全程核心收紧，背部挺直。", duration: 45 },
      { name: "休息", desc: "", duration: 15 },
      { name: "臀桥", desc: "仰卧，屈膝，双脚平放。缓慢将臀部抬离地面，至膝、髋、肩呈直线，顶峰收缩1秒，缓慢下放。", duration: 45 },
      { name: "休息", desc: "", duration: 15 },
      { name: "跪姿俯卧撑", desc: "采用跪姿，双手略宽于肩。身体下降时感受胸部拉伸，推起时不必完全伸直手臂，保持微屈。", duration: 45 },
      { name: "休息", desc: "", duration: 15 },
      { name: "鸟狗式", desc: "四足跪姿。缓慢将对侧的手和腿向前向后伸直，与身体成一直线，保持核心收紧身体稳定，缓慢收回。换边。", duration: 45 },
      { name: "休息", desc: "", duration: 15 },
    ],
  },
  {
    name: "有氧",
    tips: "采用“低冲击、持续性”动作，将心率维持在温和提升的水平。",
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      { name: "原地踏步", desc: "正常速度。", duration: 60 },
      { name: "踏步+侧抬腿", desc: "每侧交替进行，腿向外侧平缓抬起，感受髋部活动。", duration: 60 },
      { name: "踏步+轻微提膝", desc: "回到温和踏步，偶尔轻抬膝盖。", duration: 60 },
    ],
  },
  {
    name: "放松",
    tips: "专注于拉伸和呼吸，帮助身体恢复平静。",
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      { name: "股四头肌拉伸", desc: "站立，一手扶墙，另一手抓住同侧脚踝，将脚跟轻轻拉向臀部，感受大腿前侧拉伸。", duration: 30 },
      { name: "换边", desc: "换另一侧拉伸。", duration: 30 },
      { name: "胸部与肩部拉伸", desc: "站立，双手在背后十指相扣，轻轻将手臂向上抬（如做不到，可双手扶墙，身体前倾）。", duration: 30 },
      { name: "腹式深呼吸", desc: "坐或躺，一手放腹部。用鼻子缓慢吸气4秒，感受腹部鼓起；用嘴巴缓慢呼气6秒，感受腹部收紧。重复。", duration: 30 },
    ],
  },
];

// --- Helper ---
const formatTime = (sec: number) => {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  let str = "";
  if (m > 0) str += m + "分钟";
  if (s > 0 || m === 0) str += s + "秒";
  return str;
};

export default function WorkoutTimer() {
  const [sectionRounds, setSectionRounds] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PLAN_SECTIONS.forEach((s) => {
      initial[s.name] = s.defaultRounds;
    });
    return initial;
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const noSleepRef = useRef<NoSleep | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const planListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize steps when sectionRounds changes
  useEffect(() => {
    if (!isMounted) return;
    let newSteps: Step[] = [];
    PLAN_SECTIONS.forEach((section) => {
      const rounds = section.allowRounds ? sectionRounds[section.name] : 1;
      for (let i = 0; i < rounds; i++) {
        newSteps = newSteps.concat(
          section.steps.map((s) => ({ ...s, section: section.name }))
        );
      }
    });
    setSteps(newSteps);
    if (!isRunning && !isFinished) {
      setTimeLeft(newSteps[0]?.duration || 0);
    }
  }, [sectionRounds, isRunning, isFinished, isMounted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      noSleepRef.current = new NoSleep();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "zh-CN";
    window.speechSynthesis.speak(msg);
  }, [ttsEnabled]);

  const handleNextStep = useCallback(() => {
    if (currentIdx < steps.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(steps[nextIdx].duration);
      if (isRunning) {
        speak(`${steps[nextIdx].name}。${steps[nextIdx].desc}`);
      }
    } else {
      setIsRunning(false);
      setIsFinished(true);
      if (noSleepRef.current) noSleepRef.current.disable();
    }
  }, [currentIdx, steps, isRunning, speak]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleNextStep();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, handleNextStep]);

  // Scroll to current item
  useEffect(() => {
    const currentEl = planListRef.current?.querySelector(".current-step");
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentIdx]);

  const togglePlay = () => {
    if (!isRunning) {
      if (isFinished) {
        handleReset();
        return;
      }
      setIsRunning(true);
      if (noSleepRef.current) noSleepRef.current.enable();
      speak(`${steps[currentIdx].name}。${steps[currentIdx].desc}`);
    } else {
      setIsRunning(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setCurrentIdx(0);
    setTimeLeft(steps[0]?.duration || 0);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const jumpToStep = (idx: number) => {
    setCurrentIdx(idx);
    setTimeLeft(steps[idx].duration);
    if (isRunning) {
      speak(`${steps[idx].name}。${steps[idx].desc}`);
    }
  };

  const totalTime = steps.reduce((acc, s) => acc + s.duration, 0);
  const usedTime = steps.slice(0, currentIdx).reduce((acc, s) => acc + s.duration, 0) + (steps[currentIdx]?.duration - timeLeft || 0);
  const progressPercent = totalTime > 0 ? (usedTime / totalTime) * 100 : 0;
  const remainingTotalTime = steps.slice(currentIdx).reduce((acc, s, i) => acc + (i === 0 ? timeLeft : s.duration), 0);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-5 py-4 border-bottom border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          💪 20分钟健身计时
        </h1>

        <div className="mt-4 flex flex-col gap-2">
          <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1 font-medium">
            <span>已用时：{formatTime(usedTime)}</span>
            <span>剩余：{formatTime(timeLeft)} / {formatTime(remainingTotalTime)}</span>
          </div>
        </div>

        <div className="mt-3 min-h-[80px]">
          {!isMounted || steps.length === 0 ? (
             <div className="animate-pulse flex flex-col gap-2">
                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                <div className="h-4 bg-gray-50 rounded w-full"></div>
                <div className="h-4 bg-gray-50 rounded w-2/3"></div>
             </div>
          ) : isFinished ? (
            <div className="animate-in fade-in duration-500">
              <div className="text-lg font-bold text-gray-800">🎉 恭喜完成全部锻炼！</div>
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg mt-1 border border-blue-100">
                💡 建议补水、拉伸，享受轻松时刻。
              </div>
            </div>
          ) : (
            <>
              <div className="text-lg font-bold text-gray-800">
                {steps[currentIdx]?.name}
              </div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {steps[currentIdx]?.desc}
              </div>
              {PLAN_SECTIONS.find(s => s.name === steps[currentIdx]?.section)?.tips && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg mt-2 border border-blue-100">
                  💡 {PLAN_SECTIONS.find(s => s.name === steps[currentIdx]?.section)?.tips}
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
                  <div className="w-8 h-4 bg-gray-100 rounded"></div>
                  <div className="flex-1 h-5 bg-gray-50 rounded"></div>
                  <div className="w-16 h-4 bg-gray-50 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            steps.map((step, idx) => {
              const isFirstInSection = idx === 0 || steps[idx - 1].section !== step.section;
              const section = PLAN_SECTIONS.find(s => s.name === step.section);

              return (
                <React.Fragment key={idx}>
                  {isFirstInSection && (
                    <div className="flex justify-between items-center mt-4 mb-2 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-[5] border-b border-gray-50">
                      <div className="flex items-center gap-2 font-bold text-green-600">
                        {step.section}阶段
                        <span className="text-xs font-normal text-gray-400">
                          ({formatTime(steps.filter(s => s.section === step.section).reduce((acc, s) => acc + s.duration, 0))})
                        </span>
                      </div>
                      {section?.allowRounds && (
                        <select
                          disabled={isRunning}
                          value={sectionRounds[step.section]}
                          onChange={(e) => {
                            setSectionRounds(prev => ({ ...prev, [step.section]: parseInt(e.target.value) }));
                            handleReset();
                          }}
                          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                        >
                          {[...Array(section.maxRounds)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}次</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  <div
                    onClick={() => jumpToStep(idx)}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                      idx === currentIdx ? "current-step bg-blue-50 ring-1 ring-blue-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-8 text-gray-400 text-sm mt-0.5">{idx + 1}.</span>
                    <div className="flex-1 flex justify-between items-center">
                      <span className={`font-medium ${idx === currentIdx ? "text-blue-700" : "text-gray-700"}`}>
                        {step.name}
                      </span>
                      <span className="text-sm text-gray-400">({formatTime(step.duration)})</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-50/95 backdrop-blur-md border-t border-green-100 px-6 py-4 flex justify-between items-center shadow-lg z-20">
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-3 rounded-full transition-colors ${ttsEnabled ? "text-green-600 bg-white shadow-sm" : "text-gray-400 bg-gray-100"}`}
          title="语音播报开关"
        >
          {ttsEnabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H3v6h3l5 4V5z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-green-600 shadow-md hover:shadow-lg active:scale-95 transition-all border border-green-100"
            title={isRunning ? "暂停" : "开始"}
          >
            {isRunning ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-red-500 shadow-sm hover:shadow-md active:scale-95 transition-all border border-red-50"
            title="重置"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}