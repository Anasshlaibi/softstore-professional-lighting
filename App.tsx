import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import PromoOverlay from './components/PromoOverlay';
import Toast from './components/Toast';

import Hero from './components/Hero';
import StructuredData from './components/StructuredData';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded components for better FCP
const NewArrivals = React.lazy(() => import('./components/NewArrivals'));
const Products = React.lazy(() => import('./components/Products'));
const SEOContentSection = React.lazy(() => import('./components/SEOContentSection'));
const WhyUs = React.lazy(() => import('./components/WhyUs'));
const VideoShowcase = React.lazy(() => import('./components/VideoShowcase'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const FAQ = React.lazy(() => import('./components/FAQ'));
const TrustBadges = React.lazy(() => import('./components/TrustBadges'));
const ProductDetailModal = React.lazy(() => import('./components/ProductDetailModal'));

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchSupabaseProducts } from './src/utils/fetchSupabaseProducts';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CinemaLensesMaroc = React.lazy(() => import('./src/pages/CinemaLensesMaroc'));
const LocalStoreCasablanca = React.lazy(() => import('./src/pages/LocalStoreCasablanca'));
const BrandCluster = React.lazy(() => import('./src/pages/BrandCluster'));
const AdminDashboard = React.lazy(() => import('./src/pages/AdminDashboard'));

import Newsletter from './src/components/Newsletter';
import CookieConsentBanner from './src/components/CookieConsentBanner';
import LeadPopup from './src/components/LeadPopup';
import ProductRequestModal from './src/components/ProductRequestModal';
import QuoteRequestModal from './src/components/QuoteRequestModal';
import ProductAlertModal from './src/components/ProductAlertModal';

import { initAttributionTracker, recordProductView } from './src/services/attributionTracker';
import { trackViewContent, trackSearch } from './src/services/metaCapiService';

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
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

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
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    initAttributionTracker();
  }, []);

  // Sync modal with URL
  useEffect(() => {
    if (products.length > 0) {
      const pathParts = location.pathname.split('/');
      if (pathParts[1] === 'product' && pathParts[2]) {
        const idFromUrl = parseInt(pathParts[2].split('-')[0], 10);
        const product = products.find(p => p.id === idFromUrl);
        if (product && (!selectedProduct || selectedProduct.id !== product.id)) {
          setSelectedProduct(product);
          recordProductView(product.name);
          trackViewContent(product.name, product.price || 0, product.category || 'Gear');
        }
      } else if (selectedProduct) {
        setSelectedProduct(null);
      }
    }
  }, [location.pathname, products]);

  useEffect(() => {
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

  const slugify = (text: string) => {
    return text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';
  };

  const openProductModal = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      navigate(`/product/${product.id}-${slugify(product.name)}`);
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    navigate('/');
  };

  const buyNow = (productId: number) => {
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
        buyNow={buyNow}
        appliedPromo={appliedPromo}
        applyPromo={applyPromo}
        isPromoOverlayOpen={isPromoOverlayOpen}
        setIsPromoOverlayOpen={setIsPromoOverlayOpen}
        globalSearchQuery={globalSearchQuery}
        setGlobalSearchQuery={setGlobalSearchQuery}
        openProductModal={openProductModal}
        closeProductModal={closeProductModal}
        selectedProduct={selectedProduct}
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
  buyNow: (id: number) => void;
  appliedPromo: number | null;
  applyPromo: (code: string) => boolean;
  isPromoOverlayOpen: boolean;
  setIsPromoOverlayOpen: (isOpen: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  openProductModal: (id: number) => void;
  closeProductModal: () => void;
  selectedProduct: Product | null;
}> = ({
  products,
  loading,
  error,
  siteConfig,
  isCartOpen,
  setIsCartOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
  buyNow,
  appliedPromo,
  applyPromo,
  isPromoOverlayOpen,
  setIsPromoOverlayOpen,
  globalSearchQuery,
  setGlobalSearchQuery,
  openProductModal,
  closeProductModal,
  selectedProduct,
}) => {
    const { toastMessage, clearToast } = useCart();
    
    // Marketing Lead Modals state
    const [isProductRequestOpen, setIsProductRequestOpen] = useState(false);
    const [isQuoteRequestOpen, setIsQuoteRequestOpen] = useState(false);
    const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
    const [isProductAlertOpen, setIsProductAlertOpen] = useState(false);
    const [alertProduct, setAlertProduct] = useState<Product | null>(null);
    
    const location = useLocation();
    const isAdminRoute = location.pathname === '/admin';
    
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        {selectedProduct ? (
          <Helmet>
            <title>{selectedProduct.name} | GearShop Maroc - Achat au Maroc</title>
            <meta
              name="description"
              content={`Achetez le ${selectedProduct.name} au Maroc chez GearShop. Prix: ${(selectedProduct.price || 0).toLocaleString('fr-MA')} MAD. ${selectedProduct.inStock ? 'En stock' : 'Sur commande'}. Livraison rapide à Casablanca et dans tout le Maroc.`}
            />
            <link rel="canonical" href={`https://gearshop.ma/product/${selectedProduct.id}-${selectedProduct.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`} />
            <meta property="og:title" content={`${selectedProduct.name} | GearShop Maroc`} />
            <meta property="og:description" content={`Achetez le ${selectedProduct.name} au Maroc. Prix: ${(selectedProduct.price || 0).toLocaleString('fr-MA')} MAD. Livraison rapide partout au Maroc.`} />
            {selectedProduct.image && <meta property="og:image" content={selectedProduct.image} />}
            <meta property="og:url" content={`https://gearshop.ma/product/${selectedProduct.id}`} />
            <meta property="og:type" content="product" />
          </Helmet>
        ) : (
          <Helmet>
            <title>GearShop Maroc | Objectifs 7Artisans & Lentilles Cinéma</title>
            <meta name="description" content="GearShop: Revendeur officiel au Maroc d'objectifs 7Artisans et lentilles cinéma. Livraison rapide d'objectifs photo pour Canon, Nikon Z et Sony E." />
          </Helmet>
        )}
        {!isAdminRoute && (
          <Header
            onCartClick={() => setIsCartOpen(true)}
            siteConfig={siteConfig}
            globalSearchQuery={globalSearchQuery}
            setGlobalSearchQuery={setGlobalSearchQuery}
            onOpenProductRequest={() => setIsProductRequestOpen(true)}
          />
        )}
        
        <main>
          <StructuredData product={selectedProduct} allProducts={products} />
          <Routes>
            <Route path="/admin" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <AdminDashboard />
              </React.Suspense>
            } />
            <Route path="/cinema-lenses-maroc" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <CinemaLensesMaroc products={products} onProductClick={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="/magasin-casablanca" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <LocalStoreCasablanca />
              </React.Suspense>
            } />
            <Route path="/marque/:brand" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <BrandCluster products={products} onProductClick={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="*" element={
              <>
                <Hero siteConfig={{ ...siteConfig, heroImg: '/banner_7artisans.jpg' }} />
                
                <React.Suspense fallback={<LoadingSpinner />}>
                  <NewArrivals products={products} siteConfig={siteConfig} />

                  {error && !loading && (
                    <div className="container mx-auto px-6 py-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                        <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                        {error}. Affichage des produits par défaut.
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <Products
                      products={products}
                      onProductClick={openProductModal}
                      siteConfig={siteConfig}
                      globalSearchQuery={globalSearchQuery}
                      setGlobalSearchQuery={setGlobalSearchQuery}
                    />
                  )}

                  <SEOContentSection />
                  <TrustBadges />
                  <VideoShowcase siteConfig={siteConfig} />
                  <WhyUs siteConfig={siteConfig} />
                  <Testimonials />
                  <FAQ />
                  <Newsletter />
                </React.Suspense>
              </>
            } />
          </Routes>
        </main>

        {!isAdminRoute && (
          <>
            <Footer siteConfig={siteConfig} />
            <FloatingWhatsApp siteConfig={siteConfig} />
          </>
        )}

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
              setIsCheckoutOpen(false);
            }}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={closeProductModal}
            buyNow={() => buyNow(selectedProduct.id)}
            siteConfig={siteConfig}
            onOpenQuoteRequest={(prod) => {
              setQuoteProduct(prod);
              setIsQuoteRequestOpen(true);
            }}
            onOpenProductAlert={(prod) => {
              setAlertProduct(prod);
              setIsProductAlertOpen(true);
            }}
          />
        )}

        <ProductRequestModal
          isOpen={isProductRequestOpen}
          onClose={() => setIsProductRequestOpen(false)}
        />

        <QuoteRequestModal
          isOpen={isQuoteRequestOpen}
          product={quoteProduct}
          onClose={() => {
            setIsQuoteRequestOpen(false);
            setQuoteProduct(null);
          }}
        />

        <ProductAlertModal
          isOpen={isProductAlertOpen}
          product={alertProduct}
          onClose={() => {
            setIsProductAlertOpen(false);
            setAlertProduct(null);
          }}
        />

        <CookieConsentBanner />
        <LeadPopup />

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

export const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
