import React, { useState } from 'react';
import { useCart } from '../src/context/CartContext';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec'; // REPLACE WITH ACTUAL URL

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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '30',
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
  const shipping = parseInt(formData.city);
  const total = subtotal - discountAmount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cityName = formData.city === '30' ? 'Casablanca' : 'Autre ville';
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
    msg += `Livraison: ${shipping} ${curr}\n`;
    msg += `*TOTAL FINAL: ${total} ${curr}*\n\n`;

    if (formData.message) {
      msg += `*Message du client:*\n${formData.message}\n\n`;
    }
    
    msg += `Merci pour votre confiance!`;

    // Prepare data for CRM
    const crmData = {
      commandId,
      date: new Date().toISOString(),
      items: cartItems.map(i => `${i.name} (x${i.qty})`).join(', '),
      total: total,
      name: formData.name,
      phone: formData.phone,
      city: cityName,
      address: formData.address,
      message: formData.message,
      status: 'Nouvelle'
    };

    try {
      if (SCRIPT_URL && !SCRIPT_URL.includes('...')) {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(crmData),
          mode: 'no-cors'
        });
      } else {
        console.warn('CRM Script URL not configured');
      }
    } catch (error) {
      console.error('Error sending to CRM:', error);
    }

    const phoneNum = "212673011873";
    window.open(
      `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );

    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 bg-white/95 backdrop-blur-md z-[90] overflow-y-auto"
      aria-hidden="false"
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-truck-fast"></i> Livraison
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Nom Complet
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition"
                placeholder="06..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Ville
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition appearance-none"
              >
                <option value="30">
                  Casablanca (30 {siteConfig.currency})
                </option>
                <option value="50">
                  Autre ville (50 {siteConfig.currency})
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Adresse
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition"
                placeholder="Quartier, Rue..."
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Message / Notes supplémentaires
              </label>
              <textarea
                rows={2}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition"
                placeholder="Instructions de livraison, etc..."
              ></textarea>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 mt-6 space-y-2">
              <div className="text-sm font-bold mb-2">Order Recap:</div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-gray-500"
                >
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>
                    {item.price * item.qty} {siteConfig.currency}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>
                  {subtotal} {siteConfig.currency}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Remise</span>
                  <span>
                    -{discountAmount} {siteConfig.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span>
                  {shipping} {siteConfig.currency}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-black pt-2 border-t border-gray-100 mt-2">
                <span>Total à Payer</span>
                <span>
                  {total} {siteConfig.currency}
                </span>
              </div>
            </div>

            <div className="text-xs text-center text-gray-500 mt-4">
              Commande sécurisée : Vous allez être redirigé vers WhatsApp pour
              finaliser les détails avec notre équipe de Casablanca.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg flex justify-center items-center gap-2 mt-4 text-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>{' '}
                  Traitement...
                </>
              ) : (
                <>
                  <i className="fa-brands fa-whatsapp text-2xl"></i> Confirmer
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
