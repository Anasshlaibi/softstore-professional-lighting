import React from 'react';
import { CartItem as CartItemType } from '../App';
import { useCart } from '../src/context/CartContext';

interface CartItemProps {
  item: CartItemType;
  siteConfig: { currency: string };
}

const CartItem: React.FC<CartItemProps> = ({ item, siteConfig }) => {
  const { updateCartQty, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-contain mix-blend-multiply bg-white rounded-md p-1 border border-gray-100"
      />
      <div className="flex-1">
        <h4 className="font-bold text-sm text-black line-clamp-1">
          {item.name}
        </h4>
        <div className="text-xs text-gray-500">
          {item.price} {siteConfig.currency}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateCartQty(item.id, item.qty - 1)}
            className="w-6 h-6 rounded bg-gray-200 text-gray-600"
          >
            -
          </button>
          <span>{item.qty}</span>
          <button
            onClick={() => updateCartQty(item.id, item.qty + 1)}
            className="w-6 h-6 rounded bg-gray-200 text-gray-600"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-black text-sm">
          {item.price * item.qty} {siteConfig.currency}
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-gray-400 hover:text-red-500 text-xs mt-2"
        >
          Retirer
        </button>
      </div>
    </div>
  );
};

export default CartItem;
