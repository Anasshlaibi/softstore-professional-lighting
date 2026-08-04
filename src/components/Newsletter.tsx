import React, { useState } from 'react';
import { subscribeNewsletter } from '../services/leadService';
import InterestSelectionModal from './InterestSelectionModal';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter(email);
      setSubscribedEmail(email);
      setIsInterestModalOpen(true);
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-y border-zinc-800/80 py-14 px-4 sm:px-6 lg:px-8 text-white">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🔥</span> VIP Gear Updates & Exclusivités
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Restez informé des nouveaux arrivages & promos
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Inscrivez-vous pour recevoir en avant-première nos arrivages 7Artisans, lentilles cinéma et offres réservées aux passionnés de photo & vidéo au Maroc.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Votre adresse email (ex: pro@gmail.com)"
                required
                className="w-full px-4 py-3.5 bg-zinc-800/90 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl text-sm text-white placeholder-zinc-500 transition outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inscription...</span>
                </>
              ) : (
                <>
                  <span>S'abonner</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="text-red-400 text-xs mt-2 animate-fadeIn">{error}</p>
          )}

          <p className="text-xs text-zinc-500">
            🔒 Vos données sont en sécurité. Pas de spam, désabonnement en 1 clic.
          </p>
        </div>
      </section>

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

export default Newsletter;
