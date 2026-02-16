import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../../App';

export interface CartItem extends Product {
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQty: (productId: number, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
  products: Product[];
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, products }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const localCart = window.localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage', error);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }, [cart]);

  const addToCart = (productId: number) => {
    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd || !productToAdd.inStock) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...productToAdd, qty: 1 }];
    });

    // Show success toast
    setToastMessage(`${productToAdd.name} ajouté au panier`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      return newCart;
    });
  };

  const updateCartQty = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, qty: newQty } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartCount,
    toastMessage,
    clearToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
