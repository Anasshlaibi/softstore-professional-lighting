import React, { useState, useEffect } from 'react';
import { subscribeNewsletter } from '../services/leadService';
import InterestSelectionModal from './InterestSelectionModal';

const LeadPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('gearshop_lead_popup_dismissed');
    if (dismissed) return;

    // 1. Timer (15 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 15000);

    // 2. Mouse Exit Intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem('gearshop_lead_popup_dismissed')) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('gearshop_lead_popup_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer un email valide.');
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter(email);
      setSubscribedEmail(email);
      handleClose();
      setIsInterestModalOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !isInterestModalOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-red-500/30">
                🎁
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  Offre Spéciale GearShop
                </span>
                <h3 className="text-2xl font-bold tracking-tight">Ne manquez pas nos prochaines arrivages!</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Recevez en priorité nos codes promo exclusifs et les alertes de disponibilité sur le matériel photo & cinéma au Maroc.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Saisissez votre email..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none text-center"
                />

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 transition"
                >
                  {loading ? 'Inscription...' : 'Obtenir mes privilèges VIP'}
                </button>
              </form>

              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] text-zinc-500 hover:text-zinc-400 underline"
              >
                Non merci, je préfère continuer ma visite
              </button>
            </div>
          </div>
        </div>
      )}

      {subscribedEmail && (
        <InterestSelectionModal
          isOpen={isInterestModalOpen}
          email={subscribedEmail}
          onClose={() => setIsInterestModalOpen(false)}
        />
      )}
    </>
  );
};

export default LeadPopup;
