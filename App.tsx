import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';

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
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));

import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchProductsFromGoogleSheets } from './src/utils/fetchProducts';

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


  // Fetch products from Google Sheets on mount (Background sync)
  useEffect(() => {
    const loadProducts = async () => {
      const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_CSV_URL;

      if (!googleSheetsUrl) {
        return;
      }

      try {
        const fetchedProducts = await fetchProductsFromGoogleSheets(googleSheetsUrl);

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error('Failed to background sync products from Google Sheets:', err);
        // We don't set global error here to not disturb the user if we have default products
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

}) => {
    const { toastMessage, clearToast } = useCart();

    return (
      <div className="bg-amber-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          siteConfig={siteConfig}
        />
        <main>
          <Hero siteConfig={siteConfig} />

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
              products={products}
              onProductClick={openProductModal}
              siteConfig={siteConfig}
            />
          )}

          <Suspense fallback={<div className="h-20" />}>
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

