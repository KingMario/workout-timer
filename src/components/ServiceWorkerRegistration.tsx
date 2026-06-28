'use client';

import { useEffect } from 'react';

const BASE_PATH = '/workout-timer';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, {
          scope: `${BASE_PATH}/`,
        });
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
