import { createRoot } from 'react-dom/client'
import { logger } from '@/lib/logger';
import App from './App.tsx'
import './index.css'
import { UpdateNotificationManager } from '@/components/UpdateNotification'

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

// Service worker registration and update management
let swRegistration: ServiceWorkerRegistration | undefined;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('SW registered: ', registration);
        swRegistration = registration;

        // Check for updates immediately
        registration.update();

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Re-render the app with the registration
        renderApp();
      })
      .catch((registrationError) => {
        logger.log('SW registration failed: ', registrationError);
      });
  });
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <UpdateNotificationManager serviceWorkerRegistration={swRegistration} />
    </>
  );
}

// Initial render
renderApp();
