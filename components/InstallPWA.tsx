import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-6 md:bottom-24 md:w-80 animate-slide-in-up">
      <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-inner shrink-0">
             <i className="fa-solid fa-bolt text-xl"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm">Installer GearShop.ma</h4>
            <p className="text-xs text-gray-400">Accès rapide depuis votre écran d'accueil.</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-auto text-gray-500 hover:text-white p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <button
          onClick={handleInstallClick}
          className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-download text-xs"></i>
          Installer maintenant
        </button>
      </div>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default InstallPWA;
