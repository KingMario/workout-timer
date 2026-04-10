import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as storage from '../../utils/storage';
import { useWizardState } from './useWizardState';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../utils/storage', () => ({
  getSavedPlans: vi.fn(() => []),
  getAIConfig: vi.fn(() => ({
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  })),
  saveAIConfig: vi.fn(),
  savePlan: vi.fn((title: string, data: unknown) => ({
    id: 'mock-saved-id',
    title,
    data,
    createdAt: Date.now(),
  })),
  deletePlan: vi.fn(),
}));

const mockOnPlanLoaded = vi.fn();
const mockOnClose = vi.fn();

const mockConfirm = vi.spyOn(window, 'confirm');
const mockAlert = vi.spyOn(window, 'alert');

const renderWizard = () =>
  renderHook(() => useWizardState(mockOnPlanLoaded, mockOnClose));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useWizardState – entryPath tracking', () => {
  beforeEach(() => vi.clearAllMocks());

  const mockFormData = {
    duration: '20',
    age: '',
    gender: 'Private' as const,
    height: '',
    weight: '',
    injuries: '',
    level: 'Beginner' as const,
    goal: 'Fat loss',
    frequency: 'Every weekday',
    style: 'Calm & Mobility-focused',
    styleOther: '',
    preferences: '',
  };

  it('sets entryPath to "manual" when generating prompt', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.onGeneratePrompt(mockFormData);
    });
    expect(result.current.state.entryPath).toBe('manual');
  });

  it('sets entryPath to "ai" when generating with AI', async () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setAiConfig({
        apiKey: 'key',
        baseUrl: 'https://api.com',
        model: 'model',
      });
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '[]' } }],
      }),
    });

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });
    expect(result.current.state.entryPath).toBe('ai');
  });

  it('resets entryPath when entering create mode or showing saved view', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.onGeneratePrompt(mockFormData);
    });
    expect(result.current.state.entryPath).toBe('manual');

    act(() => {
      result.current.actions.showSavedView();
    });
    expect(result.current.state.entryPath).toBeNull();

    act(() => {
      result.current.actions.enterCreateMode();
    });
    expect(result.current.state.entryPath).toBeNull();
  });
});

describe('useWizardState – initial state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts in saved mode at step 1', () => {
    const { result } = renderWizard();
    expect(result.current.state.mode).toBe('saved');
    expect(result.current.state.step).toBe(1);
    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.isFormDirty).toBe(false);
  });
});

describe('useWizardState – mode switching', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enterCreateMode sets mode to create and resets state', () => {
    const { result } = renderWizard();

    act(() => {
      result.current.actions.enterCreateMode();
    });

    expect(result.current.state.mode).toBe('create');
    expect(result.current.state.step).toBe(1);
    expect(result.current.state.planTitle).toBe('');
    expect(result.current.state.jsonInput).toBe('');
    expect(result.current.state.error).toBeNull();
  });

  it('showSavedView resets to saved mode', () => {
    const { result } = renderWizard();

    act(() => {
      result.current.actions.enterCreateMode();
      result.current.actions.setStep(2);
    });

    act(() => {
      result.current.actions.showSavedView();
    });

    expect(result.current.state.mode).toBe('saved');
    expect(result.current.state.step).toBe(1);
  });
});

describe('useWizardState – prompt generation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('onGeneratePrompt sets the prompt and advances to step 2', () => {
    const { result } = renderWizard();

    const mockFormData = {
      duration: '20',
      age: '30',
      gender: 'Male',
      height: '175',
      weight: '70',
      injuries: '',
      level: 'Beginner' as const,
      goal: 'Fat loss',
      frequency: 'Every weekday',
      style: 'Calm & Mobility-focused',
      styleOther: '',
      preferences: '',
    };

    act(() => {
      result.current.actions.onGeneratePrompt(mockFormData);
    });

    expect(result.current.state.step).toBe(2);
    expect(result.current.state.generatedPrompt).toContain('20 分钟');
  });
});

describe('useWizardState – copyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockImplementation(() => {});
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
  });

  it('copies generated prompt to clipboard', () => {
    const { result } = renderWizard();

    const mockFormData = {
      duration: '15',
      age: '',
      gender: 'Private',
      height: '',
      weight: '',
      injuries: '',
      level: 'Beginner' as const,
      goal: 'Fat loss',
      frequency: 'Every weekday',
      style: 'Calm & Mobility-focused',
      styleOther: '',
      preferences: '',
    };

    act(() => {
      result.current.actions.onGeneratePrompt(mockFormData);
    });

    act(() => {
      result.current.actions.copyToClipboard();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      result.current.state.generatedPrompt,
    );
    expect(mockAlert).toHaveBeenCalled();
  });
});

describe('useWizardState – handleJsonSubmit', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const validPlanArray = [
    {
      name: '热身阶段',
      tips: '保持呼吸',
      allowRounds: false,
      defaultRounds: 1,
      maxRounds: 1,
      steps: [{ name: '原地踏步', desc: '抬高膝盖', duration: 30 }],
    },
  ];

  it('submits valid JSON, calls onPlanLoaded and onClose', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setJsonInput(JSON.stringify(validPlanArray));
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(mockOnPlanLoaded).toHaveBeenCalledWith(
      validPlanArray,
      'mock-saved-id',
    );
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.state.error).toBeNull();
  });

  it('unwraps arrays nested in an object (model wrapper)', () => {
    const { result } = renderWizard();
    const wrapped = { plan: validPlanArray };
    act(() => {
      result.current.actions.setJsonInput(JSON.stringify(wrapped));
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(mockOnPlanLoaded).toHaveBeenCalled();
  });

  it('strips markdown code fences before parsing', () => {
    const { result } = renderWizard();
    const fenced = '```json\n' + JSON.stringify(validPlanArray) + '\n```';
    act(() => {
      result.current.actions.setJsonInput(fenced);
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(mockOnPlanLoaded).toHaveBeenCalled();
  });

  it('sets error on invalid JSON syntax', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setJsonInput('{invalid json}');
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(result.current.state.error).toContain('JSON 语法错误');
    expect(mockOnPlanLoaded).not.toHaveBeenCalled();
  });

  it('sets error when schema validation fails', () => {
    const { result } = renderWizard();
    const badPlan = [{ name: '热身', missingRequiredFields: true }];
    act(() => {
      result.current.actions.setJsonInput(JSON.stringify(badPlan));
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(result.current.state.error).toContain('JSON 格式验证失败');
    expect(mockOnPlanLoaded).not.toHaveBeenCalled();
  });

  it('uses planTitle when provided, otherwise auto names', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setJsonInput(JSON.stringify(validPlanArray));
      result.current.actions.setPlanTitle('自定义计划');
    });

    act(() => {
      result.current.actions.handleJsonSubmit();
    });

    expect(vi.mocked(storage.savePlan)).toHaveBeenCalledWith(
      '自定义计划',
      validPlanArray,
    );
  });
});

describe('useWizardState – handleDeletePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('deletes and refreshes the list when user confirms', () => {
    vi.mocked(storage.getSavedPlans).mockReturnValue([]);

    const { result } = renderWizard();
    act(() => {
      result.current.actions.handleDeletePlan('plan-123');
    });

    expect(vi.mocked(storage.deletePlan)).toHaveBeenCalledWith('plan-123');
    expect(vi.mocked(storage.getSavedPlans)).toHaveBeenCalled();
  });

  it('does NOT delete when user cancels', () => {
    mockConfirm.mockReturnValue(false);

    const { result } = renderWizard();
    act(() => {
      result.current.actions.handleDeletePlan('plan-456');
    });

    expect(vi.mocked(storage.deletePlan)).not.toHaveBeenCalled();
  });
});

describe('useWizardState – handleLoadPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls onPlanLoaded and onClose with plan data', () => {
    const { result } = renderWizard();
    const mockPlan = {
      id: 'plan-abc',
      title: '测试计划',
      createdAt: Date.now(),
      data: [],
    };

    act(() => {
      result.current.actions.handleLoadPlan(mockPlan);
    });

    expect(mockOnPlanLoaded).toHaveBeenCalledWith(mockPlan.data, mockPlan.id);
    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('useWizardState – isJsonEmpty', () => {
  it('is true when jsonInput is empty', () => {
    const { result } = renderWizard();
    expect(result.current.state.isJsonEmpty).toBe(true);
  });

  it('is false when jsonInput has content', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setJsonInput('[{}]');
    });
    expect(result.current.state.isJsonEmpty).toBe(false);
  });

  it('is true when jsonInput is only whitespace', () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setJsonInput('   ');
    });
    expect(result.current.state.isJsonEmpty).toBe(true);
  });
});

describe('useWizardState – AI generate (mocked fetch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFormData = {
    duration: '20',
    age: '',
    gender: 'Private',
    height: '',
    weight: '',
    injuries: '',
    level: 'Beginner' as const,
    goal: 'Fat loss',
    frequency: 'Every weekday',
    style: 'Calm & Mobility-focused',
    styleOther: '',
    preferences: '',
  };

  it('alerts and shows AI settings when no API key for non-local URL', async () => {
    const { result } = renderWizard();

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });

    expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('API Key'));
    expect(result.current.state.showAiSettings).toBe(true);
  });

  it('sets error and stops generating on fetch failure', async () => {
    const { result } = renderWizard();

    // Switch to a local URL so it doesn't early-exit with key check
    act(() => {
      result.current.actions.setAiConfig({
        apiKey: '',
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
      });
    });

    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });

    expect(result.current.state.error).toContain('Network Error');
    expect(result.current.state.isGenerating).toBe(false);
  });

  it('sets error on non-ok HTTP response', async () => {
    const { result } = renderWizard();

    act(() => {
      result.current.actions.setAiConfig({
        apiKey: 'test-key',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      });
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    });

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });

    expect(result.current.state.error).toContain('401');
    expect(result.current.state.isGenerating).toBe(false);
  });

  it('parses successful response json, sets jsonInput and advances to step 3', async () => {
    const validPlanArray = [
      {
        name: '热身',
        tips: '放松',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [{ name: '原地踏步', desc: '抬高膝盖', duration: 30 }],
      },
    ];

    const { result } = renderWizard();
    act(() => {
      result.current.actions.setAiConfig({
        apiKey: 'ok-key',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      });
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(validPlanArray) } }],
      }),
    });

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });

    expect(result.current.state.step).toBe(3);
    expect(result.current.state.jsonInput).toContain('热身');
    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('auto-appends /v1 to bare Ollama URL', async () => {
    const { result } = renderWizard();
    act(() => {
      result.current.actions.setAiConfig({
        apiKey: '',
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
      });
    });

    let capturedUrl = '';
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.reject(new Error('stop'));
    });

    await act(async () => {
      await result.current.actions.handleAiGenerate(mockFormData);
    });

    expect(capturedUrl).toBe('http://localhost:11434/v1/chat/completions');
  });
});
