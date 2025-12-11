import { Button } from "@/components/ui/button";
import { Download, Smartphone, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface PWAInstallPromptProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const PWAInstallPrompt = ({ variant = "default", size = "default", className = "" }: PWAInstallPromptProps) => {
  const { isInstalled, installApp, browserType, canAutoInstall } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstall = async () => {
    if (canAutoInstall) {
      const success = await installApp();
      if (!success) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const getInstructionsByBrowser = () => {
    switch (browserType) {
      case 'ios-safari':
        return (
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold mb-3 text-lg">📱 Install on iPhone/iPad (Safari):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share button</strong> <span className="inline-block text-lg">⬆️</span> at the bottom of Safari</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top-right corner</li>
              <li>The app icon will appear on your home screen!</li>
            </ol>
          </div>
        );

      case 'ios-chrome':
        return (
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold mb-3 text-lg">📱 Install on iPhone/iPad (Chrome):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share button</strong> <span className="inline-block text-lg">⬆️</span> at the bottom of the screen</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top-right corner</li>
              <li>The app icon will appear on your home screen!</li>
            </ol>
          </div>
        );

      case 'ios-firefox':
        return (
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold mb-3 text-lg">📱 Install on iPhone/iPad (Firefox):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share button</strong> <span className="inline-block text-lg">⬆️</span> at the bottom of the screen</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top-right corner</li>
              <li>The app icon will appear on your home screen!</li>
            </ol>
          </div>
        );

      case 'android-chrome':
        return (
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <h4 className="font-semibold mb-3 text-lg">🤖 Install on Android (Chrome):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>menu</strong> (⋮) in the top-right corner</li>
              <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
              <li>Tap <strong>"Install"</strong> in the popup</li>
              <li>The app will be added to your home screen!</li>
            </ol>
          </div>
        );

      case 'android-firefox':
        return (
          <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
            <h4 className="font-semibold mb-3 text-lg">🦊 Install on Android (Firefox):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>menu</strong> (⋮) in the top-right corner</li>
              <li>Select <strong>"Install"</strong></li>
              <li>Tap <strong>"Add"</strong> to confirm</li>
              <li>The app will be added to your home screen!</li>
            </ol>
          </div>
        );

      case 'desktop-chrome':
      case 'desktop-firefox':
        return (
          <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
            <h4 className="font-semibold mb-3 text-lg">💻 Install on Desktop:</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Look for the <strong>install icon</strong> <span className="inline-block">⊕</span> in the address bar</li>
              <li>Click it and select <strong>"Install"</strong></li>
              <li>Or click menu (⋮) → <strong>"Install app"</strong></li>
            </ol>
          </div>
        );

      case 'desktop-safari':
        return (
          <div className="border-2 border-indigo-500 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
            <h4 className="font-semibold mb-3 text-lg">🍎 Install on macOS (Safari):</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Click the <strong>Share button</strong> in the toolbar</li>
              <li>Select <strong>"Add to Dock"</strong></li>
              <li>Confirm to add the app to your Dock</li>
            </ol>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">📱 On iPhone/iPad (Safari):</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Tap the Share button ⬆️ at the bottom</li>
                <li>Scroll and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top-right</li>
              </ol>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🤖 On Android (Chrome/Firefox):</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Tap the menu (⋮) in the top-right</li>
                <li>Select "Add to Home screen" or "Install"</li>
                <li>Tap "Install" or "Add"</li>
              </ol>
            </div>
          </div>
        );
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  // Only show button for supported mobile browsers
  const supportedMobileBrowsers = ['ios-safari', 'ios-chrome', 'ios-firefox', 'android-chrome', 'android-firefox'];
  const isSupportedMobile = supportedMobileBrowsers.includes(browserType);

  if (!isSupportedMobile) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg`}
        onClick={handleInstall}
      >
        <Download className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install Health Integrity Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Add our app to your device for quick access and a native app experience!
            </p>

            {getInstructionsByBrowser()}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Once installed, the app will work offline and provide faster access to health information!
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAInstallPrompt;
