import React, { useMemo, useState } from 'react';
import { useCart } from '../src/context/CartContext';

interface CartSummaryProps {
  siteConfig: { currency: string };
  openCheckout: () => void;
  applyPromo: (code: string) => boolean;
  appliedPromo: number | null;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  siteConfig,
  openCheckout,
  applyPromo,
  appliedPromo,
}) => {
  const { cart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const discountAmount = appliedPromo
    ? Math.round(subtotal * (appliedPromo / 100))
    : 0;
  const total = subtotal - discountAmount;

  const handleApplyPromo = () => {
    const success = applyPromo(promoCode);
    if (success) {
      setPromoMessage({ text: 'Code appliqué !', type: 'success' });
    } else {
      setPromoMessage({ text: 'Code invalide.', type: 'error' });
    }
  };

  return (
    <div className="p-6 border-t border-gray-100 bg-gray-50">
      {/* Promo Code */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Code Promo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Entrer code"
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-black uppercase shadow-sm"
          />
          <button
            onClick={handleApplyPromo}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-sm"
          >
            OK
          </button>
        </div>
        {promoMessage && (
          <div
            className={`text-xs mt-2 font-medium ${
              promoMessage.type === 'success'
                ? 'text-green-600'
                : 'text-red-500'
            }`}
          >
            {promoMessage.text}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-1 text-sm text-gray-500">
        <span>Sous-total</span>
        <span>
          {subtotal} {siteConfig.currency}
        </span>
      </div>
      {appliedPromo && (
        <div className="flex justify-between items-center mb-4 text-sm text-green-600 font-medium">
          <span>Remise ({appliedPromo}%)</span>
          <span>
            -{discountAmount} {siteConfig.currency}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-900 font-bold text-lg">Total</span>
        <span className="text-2xl font-bold text-black">
          {total} {siteConfig.currency}
        </span>
      </div>
      <button
        onClick={openCheckout}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 transform active:scale-95 duration-200"
      >
        Commander <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};

export default CartSummary;
