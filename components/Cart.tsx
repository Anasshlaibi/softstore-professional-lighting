import React from 'react';
import { useCart } from '../src/context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: { currency: string };
  openCheckout: () => void;
  applyPromo: (code: string) => boolean;
  appliedPromo: number | null;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  siteConfig,
  openCheckout,
  applyPromo,
  appliedPromo,
}) => {
  const { cart } = useCart();

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? 'block' : 'hidden'}`}
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping"></i> Votre Panier
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <i className="fa-solid fa-basket-shopping text-4xl mb-4 opacity-20"></i>
            Votre panier est vide.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} siteConfig={siteConfig} />
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <CartSummary
            siteConfig={siteConfig}
            openCheckout={openCheckout}
            applyPromo={applyPromo}
            appliedPromo={appliedPromo}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;

