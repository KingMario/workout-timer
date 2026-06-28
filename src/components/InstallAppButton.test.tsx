import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InstallAppButton from './InstallAppButton';

const setNavigatorProperty = <K extends keyof Navigator>(
  key: K,
  value: Navigator[K],
) => {
  Object.defineProperty(window.navigator, key, {
    configurable: true,
    value,
  });
};

const originalUserAgent = window.navigator.userAgent;
const originalPlatform = window.navigator.platform;

describe('InstallAppButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setNavigatorProperty('userAgent', originalUserAgent);
    setNavigatorProperty('platform', originalPlatform);
  });

  it('triggers the browser install prompt when available', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted' as const });

    render(<InstallAppButton />);

    await act(async () => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      Object.assign(event, { prompt, userChoice });
      window.dispatchEvent(event);
    });

    const button = screen.getByRole('button', { name: '安装到桌面' });

    await act(async () => {
      fireEvent.click(button);
      await userChoice;
    });

    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it('shows iOS add-to-home-screen guidance', async () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS)');
    setNavigatorProperty('platform', 'iPhone');

    render(<InstallAppButton />);

    const button = await screen.findByRole('button', { name: '安装到桌面' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(
      screen.getByRole('dialog', { name: '添加到手机桌面' }),
    ).toBeInTheDocument();
    expect(screen.getByText('用 Safari 打开当前页面。')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '知道了' }));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render while disabled', () => {
    render(<InstallAppButton disabled />);

    expect(
      screen.queryByRole('button', { name: '安装到桌面' }),
    ).not.toBeInTheDocument();
  });
});
