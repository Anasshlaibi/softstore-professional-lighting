import React, { useState } from 'react';
import { createProductRequest } from '../services/leadService';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductRequestModal: React.FC<ProductRequestModalProps> = ({ isOpen, onClose }) => {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productName.trim() || !email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner le nom du produit et une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      await createProductRequest({
        productName,
        brand,
        budget,
        notes,
        email
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setProductName('');
        setBrand('');
        setBudget('');
        setNotes('');
        setEmail('');
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
          aria-label="Fermer"
        >
          ✕
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold">Demande enregistrée!</h3>
            <p className="text-sm text-zinc-400">
              Notre équipe va vérifier la disponibilité et vous recontactera rapidement par email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Demande de Matériel Introuvable
              </span>
              <h3 className="text-2xl font-bold tracking-tight">Vous ne trouvez pas votre équipement?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Dites-nous ce que vous cherchez! Nous pouvons l'importer pour vous.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nom du produit recherché <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="ex: Canon RF 24-105mm f/2.8 L IS USM"
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Marque</label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="ex: Canon, Sony, DJI..."
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Budget approximatif (MAD)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="ex: 15 000 DH"
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Votre Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Notes / Spécifications particulières</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Monture spécifique, urgence..."
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-950/40"
              >
                {loading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductRequestModal;
