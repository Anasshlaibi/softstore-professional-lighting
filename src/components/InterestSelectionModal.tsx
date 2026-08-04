import React, { useState } from 'react';
import { updateSubscriberInterests } from '../services/leadService';

interface InterestSelectionModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'Canon', name: 'Objectifs & Boîtiers Canon', icon: '📸' },
  { id: 'Sony', name: 'Objectifs & Boîtiers Sony E', icon: '📷' },
  { id: 'Nikon', name: 'Objectifs & Boîtiers Nikon Z', icon: '🔍' },
  { id: 'Cinema Lenses', name: 'Lentilles Cinéma (Anamorphique / Cine)', icon: '🎬' },
  { id: 'Lighting', name: 'Éclairage Studio & LED (Godox / Nanlite)', icon: '💡' },
  { id: 'Audio', name: 'Microphones & Enregistreurs Audio', icon: '🎙️' },
  { id: 'Drones', name: 'Drones & Stabilisateurs DJI', icon: '🛸' },
  { id: 'Accessories', name: 'Filtres, Rigs & Accessoires', icon: '⚙️' }
];

const InterestSelectionModal: React.FC<InterestSelectionModalProps> = ({ isOpen, email, onClose }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubscriberInterests(email, selectedInterests);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
          aria-label="Fermer"
        >
          ✕
        </button>

        {saved ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold">Préférences enregistrées!</h3>
            <p className="text-sm text-zinc-400">
              Vous recevrez uniquement les offres et actualités adaptées à vos centres d'intérêt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Personnalisez vos offres
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Quels matériels vous intéressent?</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Sélectionnez vos catégories préférées pour recevoir des promos ciblées ({email})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {CATEGORIES.map(cat => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-950/40'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="flex-1 leading-snug">{cat.name}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-red-600 border-red-500 text-white' : 'border-zinc-600'
                    }`}>
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white transition"
              >
                Passer cette étape
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-red-900/30"
              >
                {loading ? 'Enregistrement...' : 'Valider mes choix'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InterestSelectionModal;
