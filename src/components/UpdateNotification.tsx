import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

const DISMISSED_UPDATE_KEY = 'sw-update-dismissed';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleUpdate = () => {
    setIsVisible(false);
    onUpdate();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Update Available</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            A new version of the app is ready to install
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">
            Would you like to update now to get the latest features and improvements?
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Later
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1"
          >
            Update Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface UpdateNotificationManagerProps {
  serviceWorkerRegistration?: ServiceWorkerRegistration;
}

function getWorkerIdentifier(worker: ServiceWorker): string {
  return worker.scriptURL;
}

function isDismissedVersion(worker: ServiceWorker): boolean {
  const dismissed = localStorage.getItem(DISMISSED_UPDATE_KEY);
  if (!dismissed) return false;

  try {
    const { scriptURL, timestamp } = JSON.parse(dismissed);
    // Consider dismissal valid for 24 hours (user might want to see it again eventually)
    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem(DISMISSED_UPDATE_KEY);
      return false;
    }
    return scriptURL === getWorkerIdentifier(worker);
  } catch {
    localStorage.removeItem(DISMISSED_UPDATE_KEY);
    return false;
  }
}

function saveDismissedVersion(worker: ServiceWorker): void {
  localStorage.setItem(DISMISSED_UPDATE_KEY, JSON.stringify({
    scriptURL: getWorkerIdentifier(worker),
    timestamp: Date.now()
  }));
}

function clearDismissedVersion(): void {
  localStorage.removeItem(DISMISSED_UPDATE_KEY);
}

export function UpdateNotificationManager({ serviceWorkerRegistration }: UpdateNotificationManagerProps) {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const showNotificationIfNeeded = useCallback((worker: ServiceWorker) => {
    if (!isDismissedVersion(worker)) {
      setWaitingWorker(worker);
      setShowUpdateNotification(true);
    }
  }, []);

  useEffect(() => {
    if (!serviceWorkerRegistration) return;

    const handleUpdateFound = () => {
      const newWorker = serviceWorkerRegistration.installing;
      if (!newWorker) return;

      const handleStateChange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is available - clear any previous dismissal for fresh updates
          clearDismissedVersion();
          showNotificationIfNeeded(newWorker);
        }
      };

      newWorker.addEventListener('statechange', handleStateChange);
    };

    serviceWorkerRegistration.addEventListener('updatefound', handleUpdateFound);

    // Check if there's already a waiting worker
    if (serviceWorkerRegistration.waiting) {
      showNotificationIfNeeded(serviceWorkerRegistration.waiting);
    }

    return () => {
      serviceWorkerRegistration.removeEventListener('updatefound', handleUpdateFound);
    };
  }, [serviceWorkerRegistration, showNotificationIfNeeded]);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Clear dismissed version since user is updating
      clearDismissedVersion();

      // Tell the new service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload to get the new content
        window.location.reload();
      });
    }
  };

  const handleDismiss = () => {
    if (waitingWorker) {
      saveDismissedVersion(waitingWorker);
    }
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) return null;

  return <UpdateNotification onUpdate={handleUpdate} onDismiss={handleDismiss} />;
}
