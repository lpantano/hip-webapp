import { Button } from "@/components/ui/button";
import { Download, Smartphone, AlertCircle } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showDebug?: boolean; // For testing purposes
}

const PWAInstallButton = ({ variant = "default", size = "default", className = "", showDebug = false }: PWAInstallButtonProps) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const handleInstall = async () => {
    console.log('Install button clicked');
    const success = await installApp();
    if (success) {
      console.log('PWA installed successfully');
    } else {
      console.log('PWA installation failed or was cancelled');
    }
  };

  // Debug logging
  console.log('PWA Button State:', { isInstallable, isInstalled, showDebug });

  if (isInstalled) {
    return (
      <Button variant="outline" size={size} className={`${className} cursor-default`} disabled>
        <Smartphone className="w-4 h-4 mr-2" />
        App Installed
      </Button>
    );
  }

  // Show debug button or check if installable
  if (!isInstallable && !showDebug) {
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
      {showDebug ? 'Install App (Debug)' : 'Install App'}
    </Button>
  );
};

export default PWAInstallButton;