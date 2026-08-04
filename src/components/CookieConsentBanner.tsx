import React, { useState, useEffect } from 'react';
import { saveCookieConsent } from '../services/leadService';

const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('gearshop_cookie_consent');
    if (!consent) {
      // Delay display slightly for smooth page render
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleChoice = async (accepted: boolean, marketing: boolean) => {
    setVisible(false);
    await saveCookieConsent(accepted, marketing);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-zinc-900/95 border border-zinc-800 backdrop-blur-md rounded-2xl p-5 shadow-2xl text-white animate-slideUp">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <span>🍪</span> Respect de votre vie privée
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Nous utilisons des cookies essentiels pour le bon fonctionnement de la boutique et l'analyse de nos offres commercialisées au Maroc.
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            onClick={() => handleChoice(true, false)}
            className="px-3.5 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition"
          >
            Refuser le marketing
          </button>
          <button
            onClick={() => handleChoice(true, true)}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-950/40 transition"
          >
            Tout Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
