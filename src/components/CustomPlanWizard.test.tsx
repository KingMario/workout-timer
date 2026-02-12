import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('renders nothing when closed', () => {
    const { container } = render(
      <CustomPlanWizard
        isOpen={false}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders step 1 when open', () => {
    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );
    expect(screen.getByText('1. 定制需求')).toBeInTheDocument();
    expect(screen.getByLabelText('时长 (分钟)')).toBeInTheDocument();
  });

  it('navigates through steps and generates prompt', async () => {
    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );

    // Step 1: Fill form
    fireEvent.input(screen.getByLabelText('时长 (分钟)'), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText('健身级别'), {
      target: { value: 'Intermediate' },
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByText('生成提示词'));
    });

    // Step 2: Check prompt generation
    expect(screen.getByText('2. 获取 AI 方案')).toBeInTheDocument();
    expect(screen.getByText(/设计一套 15 分钟/)).toBeInTheDocument();
    expect(screen.getByText('复制提示词')).toBeInTheDocument();

    // Copy to clipboard
    fireEvent.click(screen.getByText('复制提示词'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalled();

    // Go to Step 3
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));
    expect(screen.getByText('3. 导入方案')).toBeInTheDocument();
  });

  it('validates and applies json plan', async () => {
    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );

    // Skip to Step 3 directly via state manipulation isn't easy in integration test,
    // so go through steps
    await act(async () => {
      fireEvent.click(screen.getByText('生成提示词'));
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

  it('prompts confirmation on unsaved changes when closing', async () => {
    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );

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
    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );

    // Go to Step 3
    await act(async () => {
      fireEvent.click(screen.getByText('生成提示词'));
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

    render(
      <CustomPlanWizard
        isOpen={true}
        onClose={onClose}
        onPlanLoaded={onPlanLoaded}
      />,
    );

    // Switch to saved plans
    fireEvent.click(screen.getByText('查看已存计划'));

    expect(screen.getByText('Old Plan')).toBeInTheDocument();

    // Load plan
    fireEvent.click(screen.getByText('载入'));
    expect(onPlanLoaded).toHaveBeenCalledWith(planData, '123');
    expect(onClose).toHaveBeenCalled();
  });
});
