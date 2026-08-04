import React, { useState } from 'react';
import { createProductAlert } from '../services/leadService';
import { Product } from '../../App';

interface ProductAlertModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
}

const ProductAlertModal: React.FC<ProductAlertModalProps> = ({ isOpen, product, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      await createProductAlert({
        productId: product.id,
        productName: product.name,
        email
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setEmail('');
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription à l\'alerte stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
          aria-label="Fermer"
        >
          ✕
        </button>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold">Alerte configurée!</h3>
            <p className="text-xs text-zinc-400">
              Vous recevrez un email prioritaire dès que le produit <strong className="text-white">{product.name}</strong> sera de retour en stock.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 text-xl">
                🔔
              </div>
              <div>
                <h3 className="text-xl font-bold">Alerte Réapprovisionnement</h3>
                <p className="text-xs text-zinc-400 line-clamp-1">{product.name}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Ce produit est actuellement en rupture de stock. Soyez le premier averti lors du prochain arrivage au Maroc.
            </p>

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
                {loading ? 'Enregistrement...' : 'M\'avertir du retour en stock'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductAlertModal;
