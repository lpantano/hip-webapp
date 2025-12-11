import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showDebug?: boolean;
}

const PWAInstallButton = ({ variant = "default", size = "default", className = "", showDebug = false }: PWAInstallButtonProps) => {
  const { isInstallable, isInstalled, installApp, browserType } = usePWAInstall();

  const handleInstall = async () => {
    console.log('Install button clicked');
    const success = await installApp();
    if (success) {
      console.log('PWA installed successfully');
    } else {
      console.log('PWA installation failed or was cancelled');
    }
  };

  console.log('PWA Button State:', { isInstallable, isInstalled, showDebug, browserType });

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  // Only show button for supported mobile browsers
  const supportedMobileBrowsers = ['ios-safari', 'ios-chrome', 'ios-firefox', 'android-chrome', 'android-firefox'];
  const isSupportedMobile = supportedMobileBrowsers.includes(browserType);

  if (!isSupportedMobile && !showDebug) {
    return null;
  }

  if (!isInstallable && showDebug) {
    return (
      <Button variant="outline" size={size} className={`${className} cursor-default`} disabled>
        <AlertCircle className="w-4 h-4 mr-2" />
        PWA Not Ready
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg`}
      onClick={handleInstall}
    >
      <Download className="w-4 h-4 mr-2" />
      {showDebug ? 'Install Mobile App (Debug)' : 'Install Mobile App'}
    </Button>
  );
};

export default PWAInstallButton;