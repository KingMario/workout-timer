'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { WorkoutPlan } from '../schemas/workout-plan';
import {
  WorkoutPlanSchema,
  getJsonSchemaString,
} from '../schemas/workout-plan';
import { BUILT_IN_PLANS } from '../schemas';
import {
  deletePlan,
  getSavedPlans,
  savePlan,
  type SavedPlan,
} from '../utils/planStorage';

// --- Constants & Options ---
const GENDER_OPTIONS = [
  { value: 'Male', label: '男 (Male)' },
  { value: 'Female', label: '女 (Female)' },
  { value: 'Private', label: '保密 (Private)' },
];

const LEVEL_OPTIONS = [
  { value: 'Beginner', label: '初学者 (Beginner)' },
  { value: 'Intermediate', label: '中级/进阶 (Intermediate)' },
  { value: 'Advanced', label: '高级/高阶 (Advanced)' },
];

const GOAL_OPTIONS = [
  { value: 'Fat loss', label: '减脂 (Fat loss)' },
  { value: 'Mobility', label: '灵活性 (Mobility)' },
  { value: 'Strength', label: '力量 (Strength)' },
  { value: 'General health', label: '综合健康 (General health)' },
  { value: 'Stress relief', label: '缓解压力 (Stress relief)' },
];

const FREQUENCY_OPTIONS = [
  { value: 'Every weekday', label: '每个工作日 (Every weekday)' },
  { value: 'Every day', label: '每天 (Every day)' },
  { value: '3 times a week', label: '每周3次 (3 times a week)' },
  { value: '4 times a week', label: '每周4次 (4 times a week)' },
  { value: 'Weekend warrior', label: '周末突击 (Weekend warrior)' },
];

const STYLE_OPTIONS = [
  {
    value: 'Calm & Mobility-focused',
    label: '平静/灵活 (Calm & Mobility-focused)',
  },
  { value: 'Energetic & Sweaty', label: '活力/暴汗 (Energetic & Sweaty)' },
  { value: 'Strength-biased', label: '力量偏向 (Strength-biased)' },
  { value: 'Other', label: '其他 (Other)' },
];

// --- Form Schema ---
const FormDataSchema = z.object({
  duration: z.string().min(1, '请输入时长'),
  // Q1
  age: z.string().optional(),
  gender: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  // Q2
  injuries: z.string().optional(),
  // Q3
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  // Q4
  goal: z.string().min(1, '请输入目标'),
  // Q5
  frequency: z.string().min(1, '请输入频率'),
  // Q6
  style: z.string().min(1, '请输入风格'),
  styleOther: z.string().optional(),
  // Q7
  preferences: z.string().optional(),
});

type FormData = z.infer<typeof FormDataSchema>;

const DEFAULT_FORM_VALUES: FormData = {
  duration: '20',
  gender: 'Private',
  level: 'Beginner',
  goal: 'Fat loss',
  frequency: 'Every weekday',
  style: 'Calm & Mobility-focused',
};

interface CustomPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanLoaded: (plan: WorkoutPlan, id?: string) => void;
  activePlanId?: string; // New prop for current active plan
}

export default function CustomPlanWizard({
  isOpen,
  onClose,
  onPlanLoaded,
  activePlanId,
}: CustomPlanWizardProps) {
  const [mode, setMode] = useState<'create' | 'saved'>('saved'); // 'create' or 'saved'
  const [step, setStep] = useState(1);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [planTitle, setPlanTitle] = useState(''); // New title state
  const [error, setError] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const selectedStyle = watch('style');

  useEffect(() => {
    if (isOpen) {
      setSavedPlans(getSavedPlans());
      setStep(1);
      setMode('saved');
      setPlanTitle('');
      setJsonInput('');
      setGeneratedPrompt('');
      setError(null);
      reset(DEFAULT_FORM_VALUES);
    }
  }, [isOpen, reset]);

  const enterCreateMode = useCallback(() => {
    setStep(1);
    setMode('create');
    setPlanTitle('');
    setJsonInput('');
    setGeneratedPrompt('');
    setError(null);
    reset(DEFAULT_FORM_VALUES);
  }, [reset]);

  const showSavedView = useCallback(() => {
    setMode('saved');
    setStep(1);
    setPlanTitle('');
    setJsonInput('');
    setGeneratedPrompt('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (
      mode === 'create' &&
      (step > 1 || isDirty || jsonInput.length > 0 || planTitle.length > 0) &&
      !confirm('您有未保存的更改，确定要关闭吗？')
    ) {
      return;
    }
    onClose();
  }, [mode, step, isDirty, jsonInput, planTitle, onClose]);

  // Keyboard shortcut for Escape
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) {
    return null;
  }

  const onGeneratePrompt = (data: FormData) => {
    const finalStyle =
      data.style === 'Other' ? data.styleOther || 'Unspecified' : data.style;

    // Concatenate code block markers
    const codeBlockStart = '```json';
    const codeBlockEnd = '```';

    const prompt = `设计一套 ${data.duration} 分钟的居家健身方案，无需器械。包含活动性训练、轻量力量训练和有氧运动，并安排快速放松环节。请随时询问任何需要了解的信息，以便我为您优化方案。
下面是我的个人信息：
1. 基本信息: 
   - 性别: ${data.gender || '保密'}
   - 年龄: ${data.age || '保密'}
   - 身高: ${data.height ? data.height + 'cm' : '保密'}
   - 体重: ${data.weight ? data.weight + 'kg' : '保密'}
2. 伤病/关节问题: ${data.injuries || '无'}
3. 级别: ${data.level}
4. 主要目标: ${data.goal}
5. 计划频率: ${data.frequency || '未指定'}
6. 偏好风格: ${finalStyle}
7. 偏好/讨厌的动作: ${data.preferences || '无'}

请输出符合如下 JSON Schema 的健身计划:
${codeBlockStart}
${getJsonSchemaString()}
${codeBlockEnd}
请只返回 JSON 代码块，不要包含其他解释文本。`;

    setGeneratedPrompt(prompt);
    setStep(2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('提示词已复制！请前往 DeepSeek 或其他 AI 工具粘贴。');
  };

  const isJsonEmpty = jsonInput.trim().length === 0;

  const handleJsonSubmit = () => {
    setError(null);
    try {
      let cleanJson = jsonInput.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
      }

      const parsed = JSON.parse(cleanJson);
      const validated = WorkoutPlanSchema.parse(parsed);

      // Save plan logic
      const titleToSave =
        planTitle.trim() || `未命名计划 ${new Date().toLocaleString()}`;
      const saved = savePlan(titleToSave, validated);
      onPlanLoaded(validated, saved.id);

      onClose();
    } catch (e) {
      console.error(e);
      if (e instanceof z.ZodError) {
        setError(
          'JSON 格式验证失败: ' + e.issues.map((err) => err.message).join(', '),
        );
      } else if (e instanceof SyntaxError) {
        setError('JSON 语法错误，请检查是否完整。');
      } else {
        setError(
          '无效的计划数据: ' + (e instanceof Error ? e.message : String(e)),
        );
      }
    }
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('确定要删除这个计划吗？')) {
      deletePlan(id);
      setSavedPlans(getSavedPlans());
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    onPlanLoaded(plan.data, plan.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {mode === 'saved' ? (
              '📚 计划库'
            ) : (
              <>
                {step === 1 && '1. 定制需求'}
                {step === 2 && '2. 获取 AI 方案'}
                {step === 3 && '3. 导入方案'}
              </>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {mode === 'create' && (
              <button
                onClick={showSavedView}
                className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                计划库
              </button>
            )}
            {mode === 'saved' && (
              <button
                onClick={enterCreateMode}
                className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                + 新建计划
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
              aria-label="关闭"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {mode === 'saved' ? (
            <div className="space-y-6">
              {/* Built-in Plans */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  📋 系统内置计划
                </h3>
                {BUILT_IN_PLANS.map((plan) => {
                  const isActive =
                    (!activePlanId && plan.id === 'default-workout') ||
                    activePlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 ring-1 ring-green-200 dark:ring-green-900/50 shadow-sm'
                          : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            {plan.title}
                          </div>
                          {isActive && (
                            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              当前使用
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {plan.description}
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            onPlanLoaded(plan.data, plan.id);
                            onClose();
                          }}
                          disabled={isActive}
                          className={`px-4 py-1.5 text-sm rounded transition-colors font-medium ${
                            isActive
                              ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isActive ? '已载入' : '载入'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saved Plans */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  💾 我的收藏
                </h3>
                {savedPlans.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm italic">
                    暂无收藏的计划
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedPlans.map((plan) => {
                      const isActive = plan.id === activePlanId;
                      return (
                        <div
                          key={plan.id}
                          className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-900/50 shadow-sm'
                              : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-gray-800 dark:text-gray-200">
                                {plan.title}
                              </div>
                              {isActive && (
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                  当前使用
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(plan.createdAt).toLocaleDateString()} ·{' '}
                              {plan.data.length} 个阶段
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleLoadPlan(plan)}
                              disabled={isActive}
                              className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                                isActive
                                  ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isActive ? '已载入' : '载入'}
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {step === 1 && (
                <form
                  id="wizard-form"
                  onSubmit={handleSubmit(onGeneratePrompt)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        时长 (分钟)
                      </label>
                      <input
                        id="duration"
                        {...register('duration')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        type="number"
                      />
                      {errors.duration && (
                        <p className="text-red-500 text-xs">
                          {errors.duration.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="frequency"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        频率 (每周)
                      </label>
                      <select
                        id="frequency"
                        {...register('frequency')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        性别
                      </label>

                      <select
                        id="gender"
                        {...register('gender')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        年龄
                      </label>

                      <input
                        id="age"
                        {...register('age')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        type="number"
                        placeholder="可选"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="height"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        身高 (cm)
                      </label>

                      <input
                        id="height"
                        {...register('height')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        type="number"
                        placeholder="可选"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="weight"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        体重 (kg)
                      </label>

                      <input
                        id="weight"
                        {...register('weight')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        type="number"
                        placeholder="可选"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="level"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        健身级别
                      </label>
                      <select
                        id="level"
                        {...register('level')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        {LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="goal"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        主要目标
                      </label>
                      <select
                        id="goal"
                        {...register('goal')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        {GOAL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="injuries"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      伤病 / 关节问题
                    </label>
                    <textarea
                      id="injuries"
                      {...register('injuries')}
                      className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      placeholder="例如: 膝盖痛，腰椎间盘突出..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="style"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        偏好风格
                      </label>
                      <select
                        id="style"
                        {...register('style')}
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        {STYLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedStyle === 'Other' && (
                      <div>
                        <label
                          htmlFor="styleOther"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          其他风格描述
                        </label>
                        <input
                          id="styleOther"
                          {...register('styleOther')}
                          className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                          placeholder="请描述..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="preferences"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      讨厌 / 喜欢的动作
                    </label>
                    <textarea
                      id="preferences"
                      {...register('preferences')}
                      className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      placeholder="例如: 讨厌波比跳，喜欢瑜伽..."
                      rows={2}
                    />
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    请点击下方按钮复制提示词，然后发送给 DeepSeek、ChatGPT
                    或其他 AI 助手。
                  </p>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-60 border border-gray-200 dark:border-zinc-700">
                    {generatedPrompt}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    复制提示词
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
                      给计划起个名字（可选，默认自动生成）
                    </label>
                    <input
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      className="w-full p-2 border border-blue-200 dark:border-blue-800 rounded bg-white dark:bg-zinc-900 placeholder-gray-400 text-sm"
                      placeholder="例如: 减脂计划, 周末暴汗"
                    />{' '}
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      * 计划将自动保存到“我的计划”中，方便下次直接使用。
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    将 AI 返回的 JSON 代码粘贴到下方：
                  </p>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-60 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                    placeholder='[{"name": "热身", ...}]'
                  />
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded border border-red-100 dark:border-red-800">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-between">
          {mode === 'create' ? (
            <>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  上一步
                </button>
              )}
              <div className="flex-1"></div>

              {step === 1 && (
                <button
                  type="submit"
                  form="wizard-form"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  生成提示词
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  我已获得 JSON，下一步
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleJsonSubmit}
                  disabled={isJsonEmpty}
                  className={`px-6 py-2 rounded-lg transition-colors font-bold ${
                    isJsonEmpty
                      ? 'bg-green-600/40 text-white cursor-not-allowed opacity-60'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  保存并应用
                </button>
              )}
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
