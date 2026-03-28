import { createRoot } from 'react-dom/client'
import { logger } from '@/lib/logger';
import App from './App.tsx'
import './index.css'

// Request persistent storage for PWA to prevent session loss
if (navigator.storage && navigator.storage.persist) {
  // First check if we already have persistent storage
  navigator.storage.persisted().then((isPersisted) => {
    if (isPersisted) {
      logger.log('✅ Persistent storage already granted');
    } else {
      // Try to request it
      navigator.storage.persist().then((granted) => {
        if (granted) {
          logger.log('✅ Persistent storage granted');
        } else {
          logger.log('⚠️ Persistent storage not granted (this is normal on localhost)');
          logger.log('💡 Storage will still work but may be cleared by the browser under storage pressure');
          logger.log('💡 On production with HTTPS and as installed PWA, this has a better chance of being granted');
        }
      });
    }
  });
}

// Service worker: register, keep updated, and silently reload when a new version activates.
if ('serviceWorker' in navigator) {
  // Track whether a SW was already in control before this page load.
  // If not, this is a first install and we skip the reload to avoid
  // reloading a page that was never controlled.
  const hadController = !!navigator.serviceWorker.controller;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    logger.log('SW updated, reloading page for new version');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('SW registered: ', registration);

        // Check for updates immediately and every hour.
        registration.update();
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((registrationError) => {
        logger.log('SW registration failed: ', registrationError);
      });
  });
}

function AppWithUpdateNotification() {
  return <App />;
}

// Single render
createRoot(document.getElementById("root")!).render(<AppWithUpdateNotification />);
