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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);

        // Check for updates immediately
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                console.log('New service worker available, updating...');

                // Tell the new service worker to skip waiting
                newWorker.postMessage({ type: 'SKIP_WAITING' });

                // Reload to get the new content
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
