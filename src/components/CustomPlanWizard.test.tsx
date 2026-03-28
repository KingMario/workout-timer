import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomPlanWizard from './CustomPlanWizard';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');
// Mock window.alert
const mockAlert = vi.spyOn(window, 'alert');

describe('CustomPlanWizard', () => {
  const onPlanLoaded = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockConfirm.mockImplementation(() => true);
    mockAlert.mockImplementation(() => {});
  });

  it('renders correctly when mounted', () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    // Since it uses createPortal, we check document.body
    expect(document.body).not.toBeEmptyDOMElement();
    expect(screen.getByRole('heading', { name: /计划库/ })).toBeInTheDocument();
  });

  const enterCreateFlow = async () => {
    await act(async () => {
      fireEvent.click(screen.getByText('+ 新建计划'));
    });
  };

  it('shows plan library by default when open', () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    expect(screen.getByRole('heading', { name: /计划库/ })).toBeInTheDocument();
    expect(screen.getByText('📋 系统内置计划')).toBeInTheDocument();
    expect(screen.getByText('+ 新建计划')).toBeInTheDocument();
    expect(screen.getByText('系统默认计划')).toBeInTheDocument();
  });

  it('navigates through steps and generates prompt', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    await enterCreateFlow();

    // Step 1: Fill form
    fireEvent.input(screen.getByLabelText('时长 (分钟)'), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText('健身级别'), {
      target: { value: 'Intermediate' },
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByText('手动 (生成提示词)'));
    });

    // Step 2: Check prompt generation
    expect(screen.getByText('2. 获取 AI 方案')).toBeInTheDocument();
    expect(screen.getByText(/设计一套 15 分钟/)).toBeInTheDocument();
    expect(screen.getByText('复制提示词 (手动模式)')).toBeInTheDocument();

    // Copy to clipboard
    fireEvent.click(screen.getByText('复制提示词 (手动模式)'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalled();

    // Go to Step 3
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));
    expect(screen.getByText('3. 导入方案')).toBeInTheDocument();
  });

  it('validates and applies json plan', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    await enterCreateFlow();

    // Skip to Step 3 directly via state manipulation isn't easy in integration test,
    // so go through steps
    await act(async () => {
      fireEvent.click(screen.getByText('手动 (生成提示词)'));
    });
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));

    // Step 3: Enter JSON
    const validPlan = [
      {
        name: 'Test Phase',
        tips: 'Just testing',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [{ name: 'Step 1', desc: 'Do it', duration: 10 }],
      },
    ];

    const textarea = screen.getByPlaceholderText(/\[\{"name": "热身"/);
    fireEvent.change(textarea, {
      target: { value: JSON.stringify(validPlan) },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('保存并应用'));
    });

    expect(onPlanLoaded).toHaveBeenCalledWith(validPlan, expect.any(String));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables save until json is provided', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    await enterCreateFlow();

    await act(async () => {
      fireEvent.click(screen.getByText('手动 (生成提示词)'));
    });
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));

    const validPlan = [
      {
        name: 'Test Phase',
        tips: 'Testing',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [{ name: 'Step 1', desc: 'Do it', duration: 10 }],
      },
    ];

    const saveButton = screen.getByText('保存并应用');
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/\[\{"name": "热身"/), {
      target: { value: JSON.stringify(validPlan) },
    });

    expect(saveButton).toBeEnabled();
  });

  it('prompts confirmation on unsaved changes when closing', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    await enterCreateFlow();

    // Modify a field
    fireEvent.input(screen.getByLabelText('时长 (分钟)'), {
      target: { value: '25' },
    });

    // Try to close
    const closeBtn = screen.getByLabelText('关闭');
    fireEvent.click(closeBtn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled(); // Because we mocked confirm to return true
  });

  it('saves a plan when title is provided', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    await enterCreateFlow();

    // Go to Step 3
    await act(async () => {
      fireEvent.click(screen.getByText('手动 (生成提示词)'));
    });
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));

    // Enter JSON
    const validPlan = [
      {
        name: 'Saved Plan',
        tips: '',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [{ name: 'S1', desc: 'D1', duration: 10 }],
      },
    ];
    fireEvent.change(screen.getByPlaceholderText(/\[\{"name": "热身"/), {
      target: { value: JSON.stringify(validPlan) },
    });

    // Enter Title
    const titleInput = screen.getByPlaceholderText('例如: 减脂计划, 周末暴汗');
    fireEvent.change(titleInput, { target: { value: 'My Awesome Plan' } });

    // Save
    await act(async () => {
      fireEvent.click(screen.getByText('保存并应用'));
    });

    expect(localStorage.getItem('mario_workout_timer_plans')).toContain(
      'My Awesome Plan',
    );
    expect(onPlanLoaded).toHaveBeenCalled();
  });

  it('manages saved plans', async () => {
    // Pre-populate storage
    const planData = [
      {
        name: 'Existing Plan',
        tips: '',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [],
      },
    ];
    const savedPlan = {
      id: '123',
      title: 'Old Plan',
      createdAt: Date.now(),
      data: planData,
    };
    localStorage.setItem(
      'mario_workout_timer_plans',
      JSON.stringify([savedPlan]),
    );

    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);

    expect(screen.getByText('Old Plan')).toBeInTheDocument();

    // Load plan
    const savedPlanCard = screen
      .getByText('Old Plan')
      .closest('div[class*="justify-between"]');
    expect(savedPlanCard).not.toBeNull();
    const loadButton = within(savedPlanCard!).getByText('载入');
    fireEvent.click(loadButton);
    expect(onPlanLoaded).toHaveBeenCalledWith(planData, '123');
    expect(onClose).toHaveBeenCalled();
  });
});
