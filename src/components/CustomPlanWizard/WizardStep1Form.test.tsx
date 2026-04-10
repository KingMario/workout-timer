import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WizardStep1Form from './WizardStep1Form';

describe('WizardStep1Form', () => {
  const mockOnManualGenerate = vi.fn();
  const mockOnAiGenerate = vi.fn();
  const mockSetAiConfig = vi.fn();
  const mockSetShowAiSettings = vi.fn();
  const mockSetShowOllamaHelp = vi.fn();
  const mockOnSaveConfig = vi.fn();
  const mockSetIsFormDirty = vi.fn();

  const defaultProps = {
    onManualGenerate: mockOnManualGenerate,
    onAiGenerate: mockOnAiGenerate,
    aiConfig: { apiKey: '', baseUrl: 'http://foo', model: 'bar' },
    setAiConfig: mockSetAiConfig,
    showAiSettings: false,
    setShowAiSettings: mockSetShowAiSettings,
    showOllamaHelp: false,
    setShowOllamaHelp: mockSetShowOllamaHelp,
    onSaveConfig: mockOnSaveConfig,
    setIsFormDirty: mockSetIsFormDirty,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders all main form fields', () => {
    render(<WizardStep1Form {...defaultProps} />);
    expect(screen.getByLabelText('时长 (分钟)')).toBeInTheDocument();
    expect(screen.getByLabelText('健身级别')).toBeInTheDocument();
    expect(screen.getByLabelText('伤病 / 关节问题')).toBeInTheDocument();
  });

  it('shows AI settings when requested', () => {
    const { rerender } = render(<WizardStep1Form {...defaultProps} />);
    expect(screen.queryByLabelText('API Key')).not.toBeInTheDocument();

    rerender(<WizardStep1Form {...defaultProps} showAiSettings={true} />);
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
  });

  it('notifies parent when form becomes dirty', async () => {
    render(<WizardStep1Form {...defaultProps} />);

    // Simulate user typing
    await act(async () => {
      fireEvent.input(screen.getByLabelText('时长 (分钟)'), {
        target: { value: '45' },
      });
    });

    expect(mockSetIsFormDirty).toHaveBeenCalledWith(true);
  });

  it('triggers onManualGenerate when form is submitted', async () => {
    render(<WizardStep1Form {...defaultProps} />);

    await act(async () => {
      // The form has id "wizard-form"
      fireEvent.submit(document.getElementById('wizard-form')!);
    });

    expect(mockOnManualGenerate).toHaveBeenCalled();
  });

  it('triggers onAiGenerate when hidden AI button is clicked', async () => {
    render(<WizardStep1Form {...defaultProps} />);

    await act(async () => {
      fireEvent.click(document.getElementById('hidden-ai-submit-btn')!);
    });

    expect(mockOnAiGenerate).toHaveBeenCalled();
  });

  it('shows validation errors for invalid input', async () => {
    render(<WizardStep1Form {...defaultProps} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('时长 (分钟)'), {
        target: { value: '0' },
      });
      fireEvent.blur(screen.getByLabelText('时长 (分钟)'));
    });

    expect(screen.getByText(/时长建议在 1-300 分钟内/)).toBeInTheDocument();
  });

  it('calls setAiConfig and setShowAiSettings when interacting with AI panel', () => {
    render(<WizardStep1Form {...defaultProps} showAiSettings={true} />);

    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'new-key' },
    });
    expect(mockSetAiConfig).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'new-key' }),
    );

    fireEvent.change(screen.getByLabelText(/接口地址/), {
      target: { value: 'http://new-url' },
    });
    expect(mockSetAiConfig).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: 'http://new-url' }),
    );

    fireEvent.click(screen.getByText('收起 AI 设置'));
    expect(mockSetShowAiSettings).toHaveBeenCalledWith(false);
  });

  it('toggles Ollama help', () => {
    render(<WizardStep1Form {...defaultProps} showAiSettings={true} />);

    fireEvent.click(screen.getByText('本地 Ollama 报错?'));
    expect(mockSetShowOllamaHelp).toHaveBeenCalledWith(true);
  });

  it('fetches models when AI settings open and config changes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 'model-1' }, { id: 'model-2' }],
      }),
    });
    global.fetch = mockFetch;

    const { rerender } = render(
      <WizardStep1Form
        {...defaultProps}
        showAiSettings={true}
        aiConfig={{
          apiKey: 'test-key',
          baseUrl: 'http://localhost:11434',
          model: 'bar',
        }}
      />,
    );

    // Verify Ollama URL normalization
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:11434/v1/models'),
      expect.any(Object),
    );

    await waitFor(() => {
      expect(screen.getByText(/2 个模型/)).toBeInTheDocument();
    });

    // Selecting a model
    fireEvent.change(screen.getByRole('combobox', { name: /模型/ }), {
      target: { value: 'model-2' },
    });
    expect(mockSetAiConfig).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'model-2' }),
    );

    // Test failure case
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Error',
    });
    rerender(
      <WizardStep1Form
        {...defaultProps}
        showAiSettings={true}
        aiConfig={{ apiKey: 'test-key', baseUrl: 'http://error', model: 'bar' }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/模型获取失败/)).toBeInTheDocument();
    });
  });

  it('shows error message prop', () => {
    render(<WizardStep1Form {...defaultProps} error="Test Error Message" />);
    expect(screen.getByText('Test Error Message')).toBeInTheDocument();
  });

  it('calls onSaveConfig when save button is clicked', () => {
    render(<WizardStep1Form {...defaultProps} showAiSettings={true} />);
    fireEvent.click(screen.getByText('保存配置'));
    expect(mockOnSaveConfig).toHaveBeenCalled();
  });

  it('shows styleOther field when "Other" is selected in style', () => {
    render(<WizardStep1Form {...defaultProps} />);

    expect(screen.queryByLabelText('其他风格描述')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('偏好风格'), {
      target: { value: 'Other' },
    });

    expect(screen.getByLabelText('其他风格描述')).toBeInTheDocument();
  });
});
