import { Button } from "@/components/ui/button";
import { Download, Smartphone, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface PWAInstallPromptProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const PWAInstallPrompt = ({ variant = "default", size = "default", className = "" }: PWAInstallPromptProps) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await installApp();
      if (!success) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" size={size} className={`${className} cursor-default`} disabled>
        <Smartphone className="w-4 h-4 mr-2" />
        App Installed ✓
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg`}
        onClick={handleInstall}
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install ClaimWell App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Add ClaimWell to your home screen for quick access and a native app experience!
            </p>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">📱 On iPhone/iPad (Safari):</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Tap the Share button (square with arrow up)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🤖 On Android (Chrome):</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Tap the menu button (three dots)</li>
                  <li>Tap "Add to Home screen" or "Install app"</li>
                  <li>Tap "Add" or "Install" to confirm</li>
                </ol>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">💻 On Desktop (Chrome/Edge):</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Look for the install icon in the address bar</li>
                  <li>Click it and select "Install"</li>
                  <li>Or go to browser menu → "Install ClaimWell"</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Once installed, ClaimWell will work offline and send you notifications for new expert reviews!
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