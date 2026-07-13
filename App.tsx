import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import NewArrivals from './components/NewArrivals';
import StructuredData from './components/StructuredData';
import Products from './components/Products';
import WhyUs from './components/WhyUs';
import VideoShowcase from './components/VideoShowcase';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import TrustBadges from './components/TrustBadges';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Cart from './components/Cart';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutModal from './components/CheckoutModal';
import PromoOverlay from './components/PromoOverlay';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchSupabaseProducts } from './src/utils/fetchSupabaseProducts';

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
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteConfig] = useState(defaultSiteConfig);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<number | null>(null);
  const [isPromoOverlayOpen, setIsPromoOverlayOpen] = useState(false);

  // Fetch products from Supabase on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Fetching products from Supabase...');
        const fetchedProducts = await fetchSupabaseProducts();

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          console.log(`Successfully loaded ${fetchedProducts.length} products from Supabase`);
        } else {
          console.log('No products found in Supabase (or missing credentials). Using hardcoded products.');
          setProducts(defaultProducts);
        }
      } catch (err) {
        console.error('Failed to load products from Supabase:', err);
        setError('Impossible de charger les produits depuis la base de données');
        // Fallback to hardcoded products
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
      <AppContent
        products={products}
        loading={loading}
        error={error}
        siteConfig={siteConfig}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isCheckoutOpen={isCheckoutOpen}
        setIsCheckoutOpen={setIsCheckoutOpen}
        selectedProduct={selectedProduct}
        openProductModal={openProductModal}
        closeProductModal={closeProductModal}
        buyNow={buyNow}
        appliedPromo={appliedPromo}
        applyPromo={applyPromo}
        isPromoOverlayOpen={isPromoOverlayOpen}
        setIsPromoOverlayOpen={setIsPromoOverlayOpen}
      />
    </CartProvider>
  );
};

const AppContent: React.FC<{
  products: Product[];
  loading: boolean;
  error: string | null;
  siteConfig: any;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  selectedProduct: Product | null;
  openProductModal: (id: number) => void;
  closeProductModal: () => void;
  buyNow: (id: number) => void;
  appliedPromo: number | null;
  applyPromo: (code: string) => boolean;
  isPromoOverlayOpen: boolean;
  setIsPromoOverlayOpen: (isOpen: boolean) => void;
}> = ({
  products,
  loading,
  error,
  siteConfig,
  isCartOpen,
  setIsCartOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
  selectedProduct,
  openProductModal,
  closeProductModal,
  buyNow,
  appliedPromo,
  applyPromo,
  isPromoOverlayOpen,
  setIsPromoOverlayOpen,
}) => {
    const { toastMessage, clearToast } = useCart();
    
    // Pagination State for products grid
    const [displayLimit, setDisplayLimit] = React.useState(12);

    return (
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          siteConfig={siteConfig}
        />
        <main>
          <StructuredData />
          <Hero siteConfig={{ ...siteConfig, heroImg: '/banner_7artisans.jpg' }} />
          <NewArrivals />

          {/* Show error message if Google Sheets failed */}
          {error && !loading && (
            <div className="container mx-auto px-6 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                {error}. Affichage des produits par défaut.
              </div>
            </div>
          )}

          {/* Show loading spinner or products */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Products
              products={products.slice(0, displayLimit)}
              onProductClick={openProductModal}
              siteConfig={siteConfig}
            />
          )}
          
          {/* Load More Button */}
          {!loading && displayLimit < products.length && (
            <div className="flex justify-center pb-16 bg-white w-full">
              <button 
                onClick={() => setDisplayLimit(prev => prev + 12)}
                className="px-8 py-3.5 bg-black text-white text-sm font-bold tracking-widest uppercase rounded-none hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Load More
              </button>
            </div>
          )}

          <TrustBadges />
          <VideoShowcase siteConfig={siteConfig} />
          <WhyUs siteConfig={siteConfig} />
          <Testimonials />
          <FAQ />
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

        {toastMessage && (
          <Toast message={toastMessage} onClose={clearToast} />
        )}
      </div>
    );
  };

export default App;

// Wrap with ThemeProvider
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export { AppWithTheme };

