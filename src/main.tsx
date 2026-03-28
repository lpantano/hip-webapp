import { createRoot } from 'react-dom/client'
import { logger } from '@/lib/logger';
import App from './App.tsx'
import './index.css'
import { UpdateNotificationManager } from '@/components/UpdateNotification'
import { useState, useEffect } from 'react';

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

// Module-level registration reference to avoid race condition between
// SW registration (resolves on load) and React useEffect (runs after first render).
let _swRegistration: ServiceWorkerRegistration | undefined;

// Service worker registration and update management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('SW registered: ', registration);

        _swRegistration = registration;

        // Check for updates immediately
        registration.update();

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((registrationError) => {
        logger.log('SW registration failed: ', registrationError);
      });
  });
}

function AppWithUpdateNotification() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | undefined>(undefined);

  useEffect(() => {
    // If registration already resolved before this effect ran, use it directly.
    if (_swRegistration) {
      setSwRegistration(_swRegistration);
      return;
    }

    // Otherwise poll until it's available (register() is async on load).
    const interval = setInterval(() => {
      if (_swRegistration) {
        setSwRegistration(_swRegistration);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <App />
      <UpdateNotificationManager serviceWorkerRegistration={swRegistration} />
    </>
  );
}

// Single render
createRoot(document.getElementById("root")!).render(<AppWithUpdateNotification />);
