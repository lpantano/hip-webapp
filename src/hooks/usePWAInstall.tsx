import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export type BrowserType = 'ios-safari' | 'ios-chrome' | 'ios-firefox' | 'android-chrome' | 'android-firefox' | 'desktop-chrome' | 'desktop-firefox' | 'desktop-safari' | 'unknown';

export const detectBrowser = (): BrowserType => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios|fxios/.test(ua);
  const isChrome = /chrome|chromium|crios/.test(ua);
  const isFirefox = /firefox|fxios/.test(ua);
  const isMobile = isIOS || isAndroid;

  if (isIOS && isChrome) return 'ios-chrome';
  if (isIOS && isFirefox) return 'ios-firefox';
  if (isIOS && isSafari) return 'ios-safari';
  if (isAndroid && isChrome) return 'android-chrome';
  if (isAndroid && isFirefox) return 'android-firefox';
  if (!isMobile && isChrome) return 'desktop-chrome';
  if (!isMobile && isFirefox) return 'desktop-firefox';
  if (!isMobile && isSafari) return 'desktop-safari';

  return 'unknown';
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<BrowserType>('unknown');

  useEffect(() => {
    // Detect browser type
    setBrowserType(detectBrowser());

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isWebKit = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;
      const installed = isStandalone || isWebKit;
      console.log('PWA Install Status Check:', { isStandalone, isWebKit, installed, browserType: detectBrowser() });
      setIsInstalled(installed);
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event (Chrome-based browsers)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp,
    browserType,
    canAutoInstall: !!deferredPrompt
  };
};