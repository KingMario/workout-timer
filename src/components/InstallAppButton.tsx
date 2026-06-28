'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const isIosDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() ?? '';
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (platform === 'macintel' && window.navigator.maxTouchPoints > 1)
  );
};

const isStandaloneDisplay = () =>
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches) ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;

interface InstallAppButtonProps {
  disabled?: boolean;
}

export default function InstallAppButton({
  disabled = false,
}: InstallAppButtonProps) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [canShowIosGuide, setCanShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsStandalone(isStandaloneDisplay());
      setCanShowIosGuide(isIosDevice());
    }, 0);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsStandalone(true);
      setShowIosGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (disabled || isStandalone || (!installEvent && !canShowIosGuide)) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!installEvent) {
      setShowIosGuide(true);
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const iosGuide =
    showIosGuide && typeof document !== 'undefined'
      ? createPortal(
          <div className="install-guide-backdrop">
            <section
              className="install-guide"
              role="dialog"
              aria-modal="true"
              aria-labelledby="install-guide-title"
            >
              <h2 id="install-guide-title">添加到手机桌面</h2>
              <ol>
                <li>用 Safari 打开当前页面。</li>
                <li>点击底部工具栏的分享按钮。</li>
                <li>选择“添加到主屏幕”，再点击“添加”。</li>
              </ol>
              <button
                type="button"
                className="install-guide-close"
                onClick={() => setShowIosGuide(false)}
              >
                知道了
              </button>
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="install-app-button"
        onClick={handleInstallClick}
      >
        安装到桌面
      </button>

      {iosGuide}
    </>
  );
}
