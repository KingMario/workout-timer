import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WizardStep2AI from './WizardStep2AI';

describe('WizardStep2AI', () => {
  it('renders the prompt text in a code block', () => {
    render(<WizardStep2AI generatedPrompt="Hello prompt" onCopy={vi.fn()} />);
    expect(
      screen.getByRole('region', { name: /生成的 AI 提示词/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hello prompt')).toBeInTheDocument();
  });

  it('renders empty prompt without crashing', () => {
    render(<WizardStep2AI generatedPrompt="" onCopy={vi.fn()} />);
    expect(
      screen.getByRole('region', { name: /生成的 AI 提示词/ }),
    ).toBeInTheDocument();
  });

  it('calls onCopy when the copy button is clicked', () => {
    const onCopy = vi.fn();
    render(<WizardStep2AI generatedPrompt="test" onCopy={onCopy} />);
    fireEvent.click(screen.getByText('复制提示词 (手动模式)'));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('shows explanation text about AI assistant usage', () => {
    render(<WizardStep2AI generatedPrompt="" onCopy={vi.fn()} />);
    expect(screen.getByText(/DeepSeek/)).toBeInTheDocument();
  });
});
