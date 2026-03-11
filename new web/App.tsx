import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import { AlertTriangle } from 'lucide-react';

// Lazy load below-the-fold components
const WhyUs = lazy(() => import('./components/WhyUs'));
const Comparison = lazy(() => import('./components/Comparison'));
const VideoShowcase = lazy(() => import('./components/VideoShowcase'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const FAQ = lazy(() => import('./components/FAQ'));
const TechnicalSEO = lazy(() => import('./components/TechnicalSEO'));
const TrustBadges = lazy(() => import('./components/TrustBadges'));
const Footer = lazy(() => import('./components/Footer'));
const FloatingWhatsApp = lazy(() => import('./components/FloatingWhatsApp'));
const Cart = lazy(() => import('./components/Cart'));
const InstallPWA = lazy(() => import('./components/InstallPWA'));
const Questionnaire = lazy(() => import('./components/Questionnaire'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));

import { Toaster } from 'sonner';
import LoadingSpinner from './components/LoadingSpinner';

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchProductsFromGoogleSheets, fetchProductsFromSupabase } from './src/utils/fetchProducts';
import { supabase } from './src/utils/supabase';

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
  // Multilang fields
  desc_fr?: string;
  desc_ar?: string;
  desc_en?: string;
  desc_darija?: string;
  keywords?: string[];
}

export interface CartItem extends Product {
  qty: number;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteConfig] = useState(defaultSiteConfig);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<number | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [realLiveCount, setRealLiveCount] = useState(1);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));


  // 1. TRACK LIVE VISITORS & SESSIONS
  useEffect(() => {
    // Session Recording
    const recordSession = async () => {
      try {
        // Detect city/source
        let city = 'Casablanca';
        let source = 'Direct';
        
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.city) city = data.city;
        } catch (e) { /* Fallback to Casablanca */ }

        if (document.referrer.includes('facebook')) source = 'Social';
        else if (document.referrer.includes('google')) source = 'Search';
        else if (window.location.search.includes('utm_')) source = 'Ads';

        await supabase.from('sessions_gearshop').insert([{
          session_id: sessionId,
          city: city,
          source: source,
          created_at: new Date().toISOString()
        }]);
      } catch (err) { /* Silent fail */ }
    };

    recordSession();

    const channel = supabase.channel('online-users', {
      config: { presence: { key: sessionId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setRealLiveCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            online_at: new Date().toISOString(),
            id: sessionId 
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);


  // 2. TRACK REAL-TIME CLICKS FOR HEATMAP
  useEffect(() => {
    const handleGlobalClick = async (e: MouseEvent) => {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      const target = e.target as HTMLElement;

      try {
        await supabase.from('clicks_gearshop').insert([{
          session_id: sessionId,
          x_percent: xPercent,
          y_percent: yPercent,
          element_tag: target.tagName.toLowerCase()
        }]);
      } catch (err) {
        // Silent fail to not disturb user
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [sessionId]);


  // Fetch products from Google Sheets or Supabase on mount
  useEffect(() => {
    const loadProducts = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_CSV_URL;

      try {
        let fetchedProducts: Product[] = [];

        if (supabaseUrl) {
          fetchedProducts = await fetchProductsFromSupabase();
        } else if (googleSheetsUrl) {
          fetchedProducts = await fetchProductsFromGoogleSheets(googleSheetsUrl);
        }

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };

    loadProducts();
  }, []);



  const openProductModal = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const buyNow = (_productId: number) => {
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
        isAdminOpen={isAdminOpen}
        setIsAdminOpen={setIsAdminOpen}
        realLiveCount={realLiveCount}
      />
    </CartProvider>
  );
};

const AppContent: React.FC<{
  products: Product[];
  loading: boolean;
  error: string | null;
  siteConfig: typeof defaultSiteConfig;
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
  isAdminOpen: boolean;
  setIsAdminOpen: (isOpen: boolean) => void;
  realLiveCount: number;

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
  isAdminOpen,
  setIsAdminOpen,
  realLiveCount,

}) => {
    const { clearToast } = useCart();

    return (
      <div className="bg-amber-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        <Toaster position="top-center" richColors />
        <Header
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={() => setIsAdminOpen(true)}
          siteConfig={siteConfig}
        />
        <main>
          <Hero siteConfig={siteConfig} />
          
          <Suspense fallback={<div className="h-64 w-full max-w-2xl mx-auto my-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />}>
            <Questionnaire />
          </Suspense>

          {/* Show error message if Google Sheets failed */}
          {error && !loading && (
            <div className="container mx-auto px-6 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {error}. Affichage des produits par défaut.
              </div>
            </div>
          )}

          {/* Show loading spinner or products */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Products
              products={products}
              onProductClick={openProductModal}
              siteConfig={siteConfig}
            />
          )}

          <Suspense fallback={<div className="h-[800px] w-full bg-gray-100 dark:bg-gray-800/50 animate-pulse" />}>
            {/* Main Sections */}
            <TrustBadges />
            <VideoShowcase siteConfig={siteConfig} />
            <WhyUs siteConfig={siteConfig} />
            <Comparison />
            <Testimonials />
            <FAQ />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <TechnicalSEO />
          <Footer siteConfig={siteConfig} />
          <FloatingWhatsApp siteConfig={siteConfig} />
          <InstallPWA />

          {isAdminOpen && (
            <Dashboard 
              onClose={() => setIsAdminOpen(false)} 
              realLiveCount={realLiveCount}
              products={products}
            />
          )}

          {/* Hidden Admin Trigger - Visible on hover at bottom left */}
          <button 
            className="fixed bottom-4 left-4 w-10 h-10 opacity-0 hover:opacity-20 transition-opacity z-[200] cursor-default bg-black rounded-full"
            onClick={() => setIsAdminOpen(true)}
            aria-hidden="true"
          >
          </button>

          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            siteConfig={siteConfig}
            applyPromo={applyPromo}
            appliedPromo={appliedPromo}
            openCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />

          {isCheckoutOpen && (
            <CheckoutModal
              onClose={() => setIsCheckoutOpen(false)}
              siteConfig={siteConfig}
              appliedPromo={appliedPromo}
              onSuccess={() => {
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
        </Suspense>
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

