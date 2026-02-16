import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import WhyUs from './components/WhyUs';
import VideoShowcase from './components/VideoShowcase';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Cart from './components/Cart';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutModal from './components/CheckoutModal';
import PromoOverlay from './components/PromoOverlay';

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  rentPrice?: number;
  category: string;
  image: string;
  gallery: string[];
  video?: string;
  desc: string;
  stars: number;
  specs: string[];
  inStock: boolean;
  promoEligible?: boolean;
}

export interface CartItem extends Product {
  qty: number;
}

const App: React.FC = () => {
  const [products] = useState<Product[]>(defaultProducts);
  const [siteConfig] = useState(defaultSiteConfig);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<number | null>(null);
  const [isPromoOverlayOpen, setIsPromoOverlayOpen] = useState(false);

  useEffect(() => {
    // Show promo overlay after 1.5s if active and not seen
    if (siteConfig.promo.active) {
      const hasSeen = sessionStorage.getItem('hasSeenPromo');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsPromoOverlayOpen(true);
          sessionStorage.setItem('hasSeenPromo', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [siteConfig.promo.active]);

  const openProductModal = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const buyNow = (productId: number) => {
    // This function will be updated to use the cart context
    closeProductModal();
    setTimeout(() => setIsCheckoutOpen(true), 300);
  };

  const applyPromo = (code: string) => {
    if (
      siteConfig.promo.active &&
      code.toUpperCase() === siteConfig.promo.code.toUpperCase()
    ) {
      setAppliedPromo(siteConfig.promo.discount);
      return true;
    }
    setAppliedPromo(null);
    return false;
  };

  return (
    <CartProvider products={products}>
      <div className="bg-white text-gray-800 antialiased font-sans">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          siteConfig={siteConfig}
        />
        <main>
          <Hero siteConfig={siteConfig} />
          <Products
            products={products}
            onProductClick={openProductModal}
            siteConfig={siteConfig}
          />
          <VideoShowcase siteConfig={siteConfig} />
          <WhyUs siteConfig={siteConfig} />
        </main>
        <Footer siteConfig={siteConfig} />
        <FloatingWhatsApp siteConfig={siteConfig} />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          siteConfig={siteConfig}
          openCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          applyPromo={applyPromo}
          appliedPromo={appliedPromo}
        />

        {isCheckoutOpen && (
          <CheckoutModal
            onClose={() => setIsCheckoutOpen(false)}
            siteConfig={siteConfig}
            appliedPromo={appliedPromo}
            onSuccess={() => {
              // This function will be updated to use the cart context
              setIsCheckoutOpen(false);
            }}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={closeProductModal}
            buyNow={buyNow}
            siteConfig={siteConfig}
          />
        )}

        {isPromoOverlayOpen && (
          <PromoOverlay
            siteConfig={siteConfig}
            onClose={() => setIsPromoOverlayOpen(false)}
          />
        )}
        <Analytics />
      </div>
    </CartProvider>
  );
};

export default App;
