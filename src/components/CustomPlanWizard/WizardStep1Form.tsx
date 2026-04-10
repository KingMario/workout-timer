import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AIConfig } from '../../utils/storage';
import {
  DEFAULT_FORM_VALUES,
  FormData,
  FormDataSchema,
  FREQUENCY_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  STYLE_OPTIONS,
} from './utils';

interface WizardStep1FormProps {
  onManualGenerate: (data: FormData) => void;
  onAiGenerate: (data: FormData) => void;
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig) => void;
  showAiSettings: boolean;
  setShowAiSettings: (show: boolean) => void;
  showOllamaHelp: boolean;
  setShowOllamaHelp: (show: boolean) => void;
  onSaveConfig: () => void;
  error?: string | null;
  setIsFormDirty: (isDirty: boolean) => void;
}

export default function WizardStep1Form({
  onManualGenerate,
  onAiGenerate,
  aiConfig,
  setAiConfig,
  showAiSettings,
  setShowAiSettings,
  showOllamaHelp,
  setShowOllamaHelp,
  onSaveConfig,
  error,
  setIsFormDirty,
}: WizardStep1FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onBlur',
  });

  useEffect(() => {
    setIsFormDirty(isDirty);
  }, [isDirty, setIsFormDirty]);

  const selectedStyle = watch('style');

  // ── Auto-fetch model list ──────────────────────────────────────────────────
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchModelsError, setFetchModelsError] = useState<string | null>(null);

  const normalizeBaseUrl = (raw: string) => {
    let url = raw.replace(/\/+$/, '');
    if (url === 'http://localhost:11434' || url === 'http://127.0.0.1:11434') {
      url += '/v1';
    }
    return url;
  };

  const fetchModels = useCallback(
    (apiKey: string, baseUrl: string) => {
      const isLocal =
        baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
      if (!baseUrl || (!apiKey.trim() && !isLocal)) {
        setAvailableModels([]);
        setFetchModelsError('请先输入 API Key');
        return () => {};
      }

      let cancelled = false;
      setIsFetchingModels(true);
      setFetchModelsError(null);

      const normalized = normalizeBaseUrl(baseUrl);
      fetch(`${normalized}/models`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          if (!cancelled) {
            const ids: string[] = (
              (data.data ?? data.models ?? []) as Array<{
                id?: string;
                name?: string;
              }>
            )
              .map((m) => m.id ?? m.name ?? '')
              .filter(Boolean);
            setAvailableModels(ids);
            // Auto-select the first model if current value isn’t in the list
            if (ids.length > 0 && !ids.includes(aiConfig.model)) {
              setAiConfig({ apiKey, baseUrl, model: ids[0] });
            }
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setAvailableModels([]);
            setFetchModelsError(
              err instanceof Error ? err.message : String(err),
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsFetchingModels(false);
          }
        });

      return () => {
        cancelled = true;
      };
    },

    [aiConfig.model, setAiConfig],
  );

  useEffect(() => {
    if (!showAiSettings) {
      // Reset when panel closes
      setAvailableModels([]);
      setFetchModelsError(null);
      return;
    }
    return fetchModels(aiConfig.apiKey, aiConfig.baseUrl);
    // Only trigger on panel open / config change (not on model change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAiSettings, aiConfig.apiKey, aiConfig.baseUrl]);

  return (
    <form
      id="wizard-form"
      onSubmit={handleSubmit(onManualGenerate)}
      className="space-y-4"
    >
      <button
        type="button"
        id="hidden-ai-submit-btn"
        className="hidden"
        style={{ display: 'none' }}
        onClick={handleSubmit(onAiGenerate)}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="wizard-label">
            时长 (分钟)
          </label>
          <input
            id="duration"
            {...register('duration')}
            className="wizard-input"
            type="number"
          />
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.duration.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="frequency" className="wizard-label">
            频率 (每周)
          </label>
          <select
            id="frequency"
            {...register('frequency')}
            className="wizard-input"
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
          <label htmlFor="gender" className="wizard-label">
            性别
          </label>
          <select
            id="gender"
            {...register('gender')}
            className="wizard-input text-sm"
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="age" className="wizard-label">
            年龄
          </label>
          <input
            id="age"
            {...register('age')}
            className="wizard-input"
            type="number"
            placeholder="可选"
          />
          {errors.age && (
            <p className="text-red-500 text-xs mt-1.5">{errors.age.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="height" className="wizard-label">
            身高 (cm)
          </label>
          <input
            id="height"
            {...register('height')}
            className="wizard-input"
            type="number"
            placeholder="可选"
          />
          {errors.height && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.height.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="weight" className="wizard-label">
            体重 (kg)
          </label>
          <input
            id="weight"
            {...register('weight')}
            className="wizard-input"
            type="number"
            placeholder="可选"
          />
          {errors.weight && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.weight.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="level" className="wizard-label">
            健身级别
          </label>
          <select id="level" {...register('level')} className="wizard-input">
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="goal" className="wizard-label">
            主要目标
          </label>
          <select id="goal" {...register('goal')} className="wizard-input">
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="injuries" className="wizard-label">
          伤病 / 关节问题
        </label>
        <textarea
          id="injuries"
          {...register('injuries')}
          className="wizard-input"
          placeholder="例如: 膝盖痛，腰椎间盘突出..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="style" className="wizard-label">
            偏好风格
          </label>
          <select id="style" {...register('style')} className="wizard-input">
            {STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {selectedStyle === 'Other' && (
          <div>
            <label htmlFor="styleOther" className="wizard-label">
              其他风格描述
            </label>
            <input
              id="styleOther"
              {...register('styleOther')}
              className="wizard-input"
              placeholder="请描述..."
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="preferences" className="wizard-label">
          讨厌 / 喜欢的动作
        </label>
        <textarea
          id="preferences"
          {...register('preferences')}
          className="wizard-input"
          placeholder="例如: 讨厌波比跳，喜欢瑜伽..."
          rows={2}
        />
      </div>

      {/* AI Settings Section */}
      <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowAiSettings(!showAiSettings)}
          className="wizard-link flex items-center gap-1 hover:underline"
        >
          {showAiSettings
            ? '收起 AI 设置'
            : '⚙️ 设置 AI API (一次性设置，支持 DeepSeek/OpenAI)'}
        </button>

        {showAiSettings && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700 space-y-3">
            <div>
              <label htmlFor="api-key" className="wizard-label">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) =>
                  setAiConfig({
                    ...aiConfig,
                    apiKey: e.target.value,
                  })
                }
                className="wizard-input text-xs"
                placeholder="sk-..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="base-url" className="wizard-label !mb-0">
                    接口地址 (Base URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOllamaHelp(!showOllamaHelp)}
                    className="wizard-link"
                  >
                    {showOllamaHelp ? '隐藏帮助' : '本地 Ollama 报错?'}
                  </button>
                </div>
                <input
                  id="base-url"
                  type="text"
                  value={aiConfig.baseUrl}
                  onChange={(e) =>
                    setAiConfig({
                      ...aiConfig,
                      baseUrl: e.target.value,
                    })
                  }
                  className="wizard-input text-xs"
                  placeholder="https://api.deepseek.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="ai-model" className="wizard-label !mb-0">
                    模型 (Model)
                  </label>
                  {/* Fetch status */}
                  {isFetchingModels && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-500">
                      <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                      获取模型列表...
                    </span>
                  )}
                  {!isFetchingModels && availableModels.length > 0 && (
                    <span className="text-[10px] text-green-600 dark:text-green-400">
                      ✓ {availableModels.length} 个模型
                    </span>
                  )}
                  {!isFetchingModels && fetchModelsError && (
                    <button
                      type="button"
                      onClick={() =>
                        fetchModels(aiConfig.apiKey, aiConfig.baseUrl)
                      }
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
                      title={fetchModelsError}
                    >
                      模型获取失败 ↺ 重试
                    </button>
                  )}
                </div>

                {availableModels.length > 0 ? (
                  <select
                    id="ai-model"
                    value={aiConfig.model}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, model: e.target.value })
                    }
                    className="wizard-input text-xs"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="ai-model"
                    type="text"
                    value={aiConfig.model}
                    onChange={(e) =>
                      setAiConfig({
                        ...aiConfig,
                        model: e.target.value,
                      })
                    }
                    className="wizard-input text-xs"
                    placeholder="deepseek-chat"
                  />
                )}
              </div>
            </div>

            {showOllamaHelp && (
              <div className="text-[11px] p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800/50 leading-relaxed">
                <p className="font-bold mb-1">解决本地 Ollama 跨域错误：</p>
                <p className="mb-2">
                  由于浏览器安全限制，您需要设置环境变量允许网页访问本地接口：
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="font-bold underline">macOS:</span>
                    <code className="block mt-1 p-1 bg-white/50 dark:bg-black/20 rounded break-all">
                      launchctl setenv OLLAMA_ORIGINS &quot;*&quot;
                    </code>
                    <span className="opacity-70">
                      (执行后请完全退出并重启 Ollama)
                    </span>
                  </div>
                  <div>
                    <span className="font-bold underline">Windows:</span>
                    <span className="block mt-1">
                      设置系统环境变量{' '}
                      <code className="px-1 bg-white/50 dark:bg-black/20">
                        OLLAMA_ORIGINS=&quot;*&quot;
                      </code>{' '}
                      并重启 Ollama。
                    </span>
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onSaveConfig}
              className="w-full py-1.5 bg-gray-800 dark:bg-zinc-700 text-white text-xs rounded hover:bg-black transition-colors"
            >
              保存配置
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded border border-red-100 dark:border-red-800 whitespace-pre-wrap leading-relaxed shadow-sm">
          <span className="font-bold flex items-center gap-1 mb-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            连接遇到问题
          </span>
          {error}
        </div>
      )}
    </form>
  );
}
