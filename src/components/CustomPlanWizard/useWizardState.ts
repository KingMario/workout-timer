import { useCallback, useEffect, useState } from 'react';
import { WorkoutPlan, WorkoutPlanSchema } from '../../schemas/workout-plan';
import {
  deletePlan,
  getAIConfig,
  getSavedPlans,
  saveAIConfig,
  savePlan,
  renamePlan,
  type AIConfig,
  type SavedPlan,
} from '../../utils/storage';
import { FormData, generatePromptFromData } from './utils';

export interface WizardState {
  mode: 'create' | 'saved';
  step: number;
  entryPath: 'manual' | 'ai' | null;
  generatedPrompt: string;
  jsonInput: string;
  planTitle: string;
  error: string | null;
  savedPlans: SavedPlan[];
  isGenerating: boolean;
  showAiSettings: boolean;
  aiConfig: AIConfig;
  isJsonEmpty: boolean;
  isFormDirty: boolean;
}

export function useWizardState(
  onPlanLoaded: (plan: WorkoutPlan, id?: string) => void,
  onClose: () => void,
) {
  const [mode, setMode] = useState<'create' | 'saved'>('saved');
  const [step, setStep] = useState(1);
  const [entryPath, setEntryPath] = useState<'manual' | 'ai' | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [showOllamaHelp, setShowOllamaHelp] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  });

  useEffect(() => {
    setSavedPlans(getSavedPlans());
    setAiConfig(getAIConfig());
    setStep(1);
    setMode('saved');
    setEntryPath(null);
    setPlanTitle('');
    setJsonInput('');
    setGeneratedPrompt('');
    setError(null);
    setIsFormDirty(false);
  }, []);

  const enterCreateMode = useCallback(() => {
    setStep(1);
    setMode('create');
    setEntryPath(null);
    setPlanTitle('');
    setJsonInput('');
    setGeneratedPrompt('');
    setError(null);
    setIsFormDirty(false);
  }, []);

  const showSavedView = useCallback(() => {
    setMode('saved');
    setStep(1);
    setEntryPath(null);
    setPlanTitle('');
    setJsonInput('');
    setGeneratedPrompt('');
    setError(null);
  }, []);

  const onGeneratePrompt = useCallback((data: FormData) => {
    const prompt = generatePromptFromData(data);
    setGeneratedPrompt(prompt);
    setEntryPath('manual');
    setStep(2);
  }, []);

  const handleAiGenerate = useCallback(
    async (data: FormData) => {
      const isLocal =
        aiConfig.baseUrl.includes('localhost') ||
        aiConfig.baseUrl.includes('127.0.0.1');

      if (!aiConfig.apiKey && !isLocal) {
        alert('请先在下方设置 API Key');
        setShowAiSettings(true);
        return;
      }

      setIsGenerating(true);
      setError(null);
      setEntryPath('ai');
      const prompt = generatePromptFromData(data);
      // setGeneratedPrompt(prompt); // 自动模式不需要渲染到 step 2
      // 不要切换到第二步

      try {
        let finalBaseUrl = aiConfig.baseUrl.replace(/\/+$/, '');
        // 自动为 Ollama 本地默认地址补充 /v1
        if (
          finalBaseUrl === 'http://localhost:11434' ||
          finalBaseUrl === 'http://127.0.0.1:11434'
        ) {
          finalBaseUrl += '/v1';
        }

        const endpoint = `${finalBaseUrl}/chat/completions`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: aiConfig.model,
            messages: [
              {
                role: 'system',
                content:
                  '你是一个专业的健身教练。请直接返回符合 JSON Schema 的数据，不要包含任何多余文字。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let errorMessage = `API 报错 (${response.status}): ${errorText || response.statusText}\n请求地址: ${endpoint}`;

          if (
            response.status === 404 &&
            errorText.includes('not found') &&
            errorText.includes('model')
          ) {
            errorMessage = `模型不存在 (404)！\n请展开下方的「⚙️ 设置 AI API」，检查【模型 (Model)】名称是否拼写正确；如果您使用的是本地 Ollama，请确保已经先执行过 \`ollama run <您的模型名>\` 将其下载到本地。\n--- 服务端详情 ---\n${errorText}`;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        const content = result.choices[0].message.content;
        setJsonInput(content);
        setStep(3);
      } catch (err) {
        console.error(err);
        setError(
          `AI 生成失败: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [aiConfig],
  );

  const saveConfig = useCallback(() => {
    saveAIConfig(aiConfig);
    setShowAiSettings(false);
    alert('AI 配置已保存！');
  }, [aiConfig]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('提示词已复制！请前往 DeepSeek 或其他 AI 工具粘贴。');
  }, [generatedPrompt]);

  const handleJsonSubmit = useCallback(() => {
    setError(null);
    try {
      let cleanJson = jsonInput.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
      }

      let parsed = JSON.parse(cleanJson);

      // 如果大模型非要包一层对象，自动进行拆包嗅探
      if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
        const potentialArray =
          parsed.plan ||
          parsed.workouts ||
          parsed.sections ||
          parsed.data ||
          Object.values(parsed).find((v) => Array.isArray(v));

        if (Array.isArray(potentialArray)) {
          parsed = potentialArray;
        }
      }

      const result = WorkoutPlanSchema.safeParse(parsed);
      if (!result.success) {
        setError(
          'JSON 格式验证失败: ' +
            result.error.issues.map((err) => err.message).join(', '),
        );
        return;
      }
      const validated = result.data;

      const titleToSave =
        planTitle.trim() || `未命名计划 ${new Date().toLocaleString()}`;
      const saved = savePlan(titleToSave, validated);
      onPlanLoaded(validated, saved.id);

      onClose();
    } catch (e) {
      console.error(e);
      if (e instanceof SyntaxError) {
        setError('JSON 语法错误，请检查是否完整。');
      } else {
        setError(
          '无效的计划数据: ' + (e instanceof Error ? e.message : String(e)),
        );
      }
    }
  }, [jsonInput, planTitle, onPlanLoaded, onClose]);

  const handleDeletePlan = useCallback((id: string) => {
    if (confirm('确定要删除这个计划吗？')) {
      deletePlan(id);
      setSavedPlans(getSavedPlans());
    }
  }, []);

  const handleRenamePlan = useCallback((id: string, newTitle: string) => {
    renamePlan(id, newTitle);
    setSavedPlans(getSavedPlans());
  }, []);

  const handleCopyPlanJSON = useCallback((plan: SavedPlan) => {
    const jsonString = JSON.stringify(plan.data, null, 2);
    const fenced = `\`\`\`json\n${jsonString}\n\`\`\``;
    navigator.clipboard.writeText(fenced);
    alert(`计划 "${plan.title}" 的 JSON 数据已复制到剪贴板！`);
  }, []);

  const handleLoadPlan = useCallback(
    (plan: SavedPlan) => {
      onPlanLoaded(plan.data, plan.id);
      onClose();
    },
    [onPlanLoaded, onClose],
  );

  const isJsonEmpty = jsonInput.trim().length === 0;

  return {
    state: {
      mode,
      step,
      entryPath,
      generatedPrompt,
      jsonInput,
      planTitle,
      error,
      savedPlans,
      isGenerating,
      showAiSettings,
      showOllamaHelp,
      aiConfig,
      isJsonEmpty,
      isFormDirty,
    },
    actions: {
      setMode,
      setStep,
      setJsonInput,
      setPlanTitle,
      setAiConfig,
      setIsFormDirty,
      setShowAiSettings,
      setShowOllamaHelp,
      enterCreateMode,
      showSavedView,
      onGeneratePrompt,
      handleAiGenerate,
      saveConfig,
      copyToClipboard,
      handleJsonSubmit,
      handleDeletePlan,
      handleRenamePlan,
      handleCopyPlanJSON,
      handleLoadPlan,
    },
  };
}
