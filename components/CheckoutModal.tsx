import React, { useState, useEffect } from 'react';
import { useCart } from '../src/context/CartContext';
import { createQuoteRequest } from '../src/services/leadService';
import { sendMetaCapiEvent } from '../src/services/metaCapiService';

interface CheckoutModalProps {
  onClose: () => void;
  siteConfig: { currency: string; phone: string; brandName: string };
  appliedPromo: number | null;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  siteConfig,
  appliedPromo,
  onSuccess,
}) => {
  const { cart: cartItems } = useCart();

  // Fire InitiateCheckout when modal opens
  useEffect(() => {
    const win = window as any;
    if (typeof win.fbq === 'function') {
      const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      win.fbq('track', 'InitiateCheckout', {
        value: cartTotal,
        currency: 'MAD',
        num_items: cartItems.reduce((sum, item) => sum + item.qty, 0),
        content_ids: cartItems.map(i => i.id.toString()),
        content_type: 'product'
      });
    }
  }, [cartItems]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Casablanca',
    address: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const discountAmount = appliedPromo
    ? Math.round(subtotal * (appliedPromo / 100))
    : 0;

  // Free shipping threshold: 500 DH or higher
  const isFreeShipping = subtotal >= 500;
  const standardShipping = formData.city === 'Casablanca' ? 30 : 45;
  const shipping = isFreeShipping ? 0 : standardShipping;
  const total = subtotal - discountAmount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cityName = formData.city;
    const curr = siteConfig.currency;
    const commandId = Date.now();

    // Construct WhatsApp Message
    let msg = `*Nouvelle Commande #${commandId} - ${siteConfig.brandName}*\n\n`;
    msg += `*Client:*\n`;
    msg += `Nom: ${formData.name}\n`;
    msg += `Tél: ${formData.phone}\n`;
    msg += `Ville: ${cityName}\n`;
    msg += `Adresse: ${formData.address}\n\n`;

    msg += `*Détails de la commande:*\n`;
    cartItems.forEach((item) => {
      msg += `- ${item.name} (x${item.qty}) : ${item.price * item.qty} ${curr}\n`;
    });
    msg += `\n`;

    msg += `Sous-total: ${subtotal} ${curr}\n`;
    if (appliedPromo) {
      msg += `Remise (${appliedPromo}%): -${discountAmount} ${curr}\n`;
    }
    msg += `Livraison: ${isFreeShipping ? 'GRATUITE (Commande ≥ 500 DH)' : `${shipping} ${curr}`}\n`;
    msg += `*TOTAL FINAL: ${total} ${curr}*\n\n`;

    if (formData.message) {
      msg += `*Message du client:*\n${formData.message}\n\n`;
    }
    
    msg += `Paiement: Cash à la livraison après vérification du colis.\n`;
    msg += `Merci pour votre confiance!`;

    // 1. Record lead / order safely in Supabase
    try {
      await createQuoteRequest({
        productName: `Panier (${cartItems.length} art.): ` + cartItems.map(i => `${i.name} (x${i.qty})`).join(', '),
        name: formData.name,
        email: `${formData.phone.replace(/[^0-9]/g, '') || 'client'}@gearshop.ma`,
        phone: formData.phone,
        company: `${cityName} - ${formData.address}`,
        quantity: cartItems.reduce((sum, item) => sum + item.qty, 0),
        message: `Total: ${total} DH | ` + (formData.message || 'Commande Panier E-commerce')
      });
    } catch (dbErr) {
      console.warn('Database lead record non-blocking error:', dbErr);
    }

    // 2. Track Serverless Meta CAPI & Analytics
    try {
      sendMetaCapiEvent({
        eventName: 'Purchase',
        value: total,
        currency: 'MAD',
        phone: formData.phone,
        customData: {
          content_name: 'WhatsApp E-commerce Order',
          content_ids: cartItems.map(i => i.id.toString()),
          content_type: 'product',
          order_id: commandId.toString()
        }
      });

      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: commandId.toString(),
          value: total,
          currency: siteConfig.currency,
          items: cartItems.map(item => ({
            item_name: item.name,
            item_id: item.id.toString(),
            price: item.price,
            quantity: item.qty
          }))
        }
      });
    } catch (trackErr) {
      console.error('Tracking error:', trackErr);
    }

    const phoneNum = (siteConfig.phone || '212673011873').replace(/[^0-9]/g, '');
    window.open(
      `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );

    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] overflow-y-auto flex items-center justify-center p-4"
      aria-hidden="false"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2 text-gray-900">
          <i className="fa-solid fa-truck-fast text-red-600"></i> Finaliser la Commande
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Livraison rapide 24h/48h partout au Maroc • Paiement à la réception
        </p>

        {/* ── Reassurance Banner ─────────────────────────────────── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5 mb-4">
          <i className="fa-solid fa-shield-halved text-emerald-600 text-sm mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Garantie Sérénité :</span> Vous payez en espèces au livreur après avoir ouvert et vérifié l'état de votre colis.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nom Complet
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
              placeholder="Ex: Mohamed Alami"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Numéro de Téléphone (WhatsApp)
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
              placeholder="06 XX XX XX XX"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Ville de Livraison
            </label>
            <select
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
            >
              <option value="Casablanca">Casablanca {isFreeShipping ? '(Livraison Gratuite)' : '(30 DH)'}</option>
              <option value="Rabat">Rabat {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Marrakech">Marrakech {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Tanger">Tanger {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Fès">Fès {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Agadir">Agadir {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Meknès">Meknès {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Oujda">Oujda {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Kénitra">Kénitra {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Tétouan">Tétouan {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Autre Ville">Autre Ville du Maroc {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Adresse de Livraison
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
              placeholder="Quartier, N° rue, Résidence..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Instructions & Notes (Optionnel)
            </label>
            <textarea
              rows={1}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-xs focus:outline-none focus:border-black transition"
              placeholder="Besoin de facture TVA, créneau horaire..."
            ></textarea>
          </div>

          {/* ── Order Breakdown ──────────────────────────────────── */}
          <div className="border-t border-dashed border-gray-200 pt-3.5 mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-600 font-semibold">
              <span>Articles ({cartItems.reduce((s, i) => s + i.qty, 0)})</span>
              <span>{subtotal.toLocaleString('fr-FR')} {siteConfig.currency}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>Remise appliquée</span>
                <span>-{discountAmount.toLocaleString('fr-FR')} {siteConfig.currency}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-600">Frais de livraison</span>
              {isFreeShipping ? (
                <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded text-[11px]">
                  GRATUITE (Dès 500 DH)
                </span>
              ) : (
                <span className="text-gray-900">{shipping} {siteConfig.currency}</span>
              )}
            </div>

            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-100 mt-2">
              <span>Total à Payer :</span>
              <span className="text-red-600">{total.toLocaleString('fr-FR')} {siteConfig.currency}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-green-600/20 flex justify-center items-center gap-2 mt-4 text-base disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Traitement...
              </>
            ) : (
              <>
                <i className="fa-brands fa-whatsapp text-xl"></i> Confirmer par WhatsApp Express
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
