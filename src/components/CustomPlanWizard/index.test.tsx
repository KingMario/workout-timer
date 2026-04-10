import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveAIConfig } from '../../utils/storage';
import CustomPlanWizard from './index';

// Mock window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');
vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('CustomPlanWizard Container', () => {
  const onPlanLoaded = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockConfirm.mockImplementation(() => true);
  });

  it('renders correctly when mounted', () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    expect(document.body).not.toBeEmptyDOMElement();
    expect(screen.getByRole('heading', { name: /计划库/ })).toBeInTheDocument();
  });

  it('shows plan library by default when open', () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);
    expect(screen.getByText('📋 系统内置计划')).toBeInTheDocument();
    expect(screen.getByText('+ 新建计划')).toBeInTheDocument();
  });

  it('navigates through steps via Manual mode', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);

    // Enter Create Mode
    await act(async () => {
      fireEvent.click(screen.getByText('+ 新建计划'));
    });

    // Step 1 -> Step 2
    await act(async () => {
      fireEvent.click(screen.getByText('手动 (生成提示词)'));
    });
    expect(screen.getByText('2. 获取 AI 方案')).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText('我已获得 JSON，下一步'));
    expect(screen.getByText('3. 导入方案')).toBeInTheDocument();

    // Step 3 -> Step 2
    fireEvent.click(screen.getByText('上一步'));
    expect(screen.getByText('2. 获取 AI 方案')).toBeInTheDocument();
  });

  it('navigates from Step 3 back to Step 1 in AI mode', async () => {
    // Setup AI config
    saveAIConfig({
      apiKey: 'test-key',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '[]' } }],
      }),
    });

    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);

    // Enter Create Mode
    await act(async () => {
      fireEvent.click(screen.getByText('+ 新建计划'));
    });

    // Make sure duration is filled to trigger validation
    fireEvent.change(screen.getByLabelText('时长 (分钟)'), {
      target: { value: '20' },
    });

    // Step 1 -> AI Generation -> Step 3
    // Use the hidden button directly as programmatic clicks can be tricky in tests
    const hiddenBtn = document.getElementById('hidden-ai-submit-btn');
    if (hiddenBtn) {
      fireEvent.click(hiddenBtn);
    } else {
      // Fallback to the visible button if hidden one not found (shouldn't happen)
      fireEvent.click(screen.getByText('✨ 自动生成 (AI)'));
    }

    await waitFor(
      () => {
        expect(screen.getByText('3. 导入方案')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    // Step 3 -> Step 1 (should skip Step 2)
    fireEvent.click(screen.getByText('上一步'));
    expect(screen.getByText('1. 定制需求')).toBeInTheDocument();
  });

  it('prompts confirmation on unsaved changes when closing (isDirty tracked)', async () => {
    render(<CustomPlanWizard onClose={onClose} onPlanLoaded={onPlanLoaded} />);

    await act(async () => {
      fireEvent.click(screen.getByText('+ 新建计划'));
    });

    // Modify a field to trigger isDirty -> setFormDirty
    fireEvent.input(screen.getByLabelText('时长 (分钟)'), {
      target: { value: '25' },
    });

    // Try to close
    const closeBtn = screen.getByLabelText('关闭');
    fireEvent.click(closeBtn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled(); // Simulated clear via mock logic
  });
});
