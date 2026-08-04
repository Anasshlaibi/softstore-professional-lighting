import React, { useState } from 'react';
import { createQuoteRequest } from '../services/leadService';
import { Product } from '../../App';

interface QuoteRequestModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ isOpen, product, onClose }) => {
  const [productName, setProductName] = useState(product?.name || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (product) {
      setProductName(product.name);
    }
  }, [product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Veuillez remplir votre nom, email et numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      await createQuoteRequest({
        productId: product?.id,
        productName: productName || product?.name || 'Matériel Pro',
        name,
        email,
        phone,
        company,
        quantity,
        message
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la demande de devis');
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
            <h3 className="text-xl font-bold">Demande de devis envoyée!</h3>
            <p className="text-sm text-zinc-400">
              Notre équipe commerciale étudiera votre demande et vous répondra sous 24h ouvrées.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Devis Professionnel / Studio
              </span>
              <h3 className="text-2xl font-bold tracking-tight">Demande de Devis sur Mesure</h3>
              {productName && (
                <p className="text-xs font-medium text-red-400 mt-1">
                  Produit: {productName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom Complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mohamed Alami"
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Téléphone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Professionnel <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@studio.ma"
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Entreprise / Studio</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Nom de société (optionnel)"
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantité souhaitée</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Message / Exigences de livraison</label>
              <textarea
                rows={2}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Précisez vos besoins particuliers, facturation ou délais..."
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
                {loading ? 'Envoi...' : 'Demander mon Devis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestModal;
