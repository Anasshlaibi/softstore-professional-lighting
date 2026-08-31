import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import BottomNav from './components/BottomNav';
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
const ShopCategories = React.lazy(() => import('./components/ShopCategories'));
const BrandLogos = React.lazy(() => import('./components/BrandLogos'));
const ProductDetailModal = React.lazy(() => import('./components/ProductDetailModal'));

import { defaultProducts } from './data/products';
import { defaultSiteConfig } from './data/config';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchSupabaseProducts } from './src/utils/fetchSupabaseProducts';
import { generateProductSEOPackage } from './src/utils/seoGenerator';
import { useNavigate, useLocation, Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CinemaLensesMaroc = React.lazy(() => import('./src/pages/CinemaLensesMaroc'));
const LocalStoreCasablanca = React.lazy(() => import('./src/pages/LocalStoreCasablanca'));
const BrandCluster = React.lazy(() => import('./src/pages/BrandCluster'));
const CategoryPage = React.lazy(() => import('./src/pages/CategoryPage'));
const UseCaseGuide = React.lazy(() => import('./src/pages/UseCaseGuide'));
const AdminDashboard = React.lazy(() => import('./src/pages/AdminDashboard'));
const AboutAndPartners = React.lazy(() => import('./src/pages/AboutAndPartners'));
const OsmoPocket4Page = React.lazy(() => import('./src/pages/OsmoPocket4Page'));
const CameraMarocPage = React.lazy(() => import('./src/pages/CameraMarocPage'));

import Newsletter from './src/components/Newsletter';
import CookieConsentBanner from './src/components/CookieConsentBanner';
import LeadPopup from './src/components/LeadPopup';
import ProductRequestModal from './src/components/ProductRequestModal';
import QuoteRequestModal from './src/components/QuoteRequestModal';
import ProductAlertModal from './src/components/ProductAlertModal';
import { SearchModal } from './src/components/Search/SearchModal';

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
  isPreorder?: boolean;
  promoEligible?: boolean;
  // Enriched fields from Supabase DB (populated from DB columns, not text-sniffing)
  brand?: string;
  mount?: string;
  product_group?: string; // 'new' | 'used' | 'rental'
  product_type?: string;
  // Admin SEO Overrides & Aliases
  seo_title?: string;
  meta_description?: string;
  seo_intro?: string;
  seo_description?: string;
  custom_faq?: Array<{ question: string; answer: string }>;
  search_aliases?: string[];
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
  const [isNewArrivalsOpen, setIsNewArrivalsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Fetching products from Supabase...');
        const fetchedProducts = await fetchSupabaseProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
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
      const pathParts = location.pathname.split('/').filter(Boolean);
      const searchParams = new URLSearchParams(location.search);
      const queryProductId = searchParams.get('product') || searchParams.get('id') || searchParams.get('p');
      
      let idFromUrl: number | null = null;

      if ((pathParts[0] === 'product' || pathParts[0] === 'products') && pathParts[1]) {
        idFromUrl = parseInt(pathParts[1].split('-')[0], 10);
      } else if (queryProductId) {
        idFromUrl = parseInt(queryProductId, 10);
      }

      if (idFromUrl && !isNaN(idFromUrl)) {
        if (idFromUrl === 3001) {
          navigate('/osmo-pocket-4p', { replace: true });
          return;
        }

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
  }, [location.pathname, location.search, products]);

  // Auto promo popup disabled per user request
  useEffect(() => {
    setIsPromoOverlayOpen(false);
  }, []);

  const slugify = (text: string) => {
    return text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';
  };

  const openProductModal = (productId: number, fromSearchQuery?: string) => {
    if (productId === 3001) {
      navigate('/osmo-pocket-4p');
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product) {
      if (fromSearchQuery !== undefined) {
        setSearchHistoryQuery(fromSearchQuery);
      }
      setSelectedProduct(product);
      navigate(`/product/${product.id}-${slugify(product.name)}`, {
        state: { 
          fromSearch: Boolean(fromSearchQuery), 
          searchQuery: fromSearchQuery 
        }
      });
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    const wasFromSearch = location.state?.fromSearch || Boolean(searchHistoryQuery);
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
    if (wasFromSearch) {
      setTimeout(() => {
        setIsSearchModalOpen(true);
      }, 120);
    }
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
        isNewArrivalsOpen={isNewArrivalsOpen}
        setIsNewArrivalsOpen={setIsNewArrivalsOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        isSearchModalOpen={isSearchModalOpen}
        setIsSearchModalOpen={setIsSearchModalOpen}
        searchHistoryQuery={searchHistoryQuery}
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
  isNewArrivalsOpen: boolean;
  setIsNewArrivalsOpen: (isOpen: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  searchHistoryQuery: string;
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
  isNewArrivalsOpen,
  setIsNewArrivalsOpen,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  isSearchModalOpen,
  setIsSearchModalOpen,
  searchHistoryQuery,
}) => {
    const { toastMessage, clearToast } = useCart();
    
    // Marketing Lead & Quote Modals state
    const [isProductRequestOpen, setIsProductRequestOpen] = useState(false);
    const [isQuoteRequestOpen, setIsQuoteRequestOpen] = useState(false);
    const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
    const [isProductAlertOpen, setIsProductAlertOpen] = useState(false);
    const [alertProduct, setAlertProduct] = useState<Product | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminRoute = location.pathname === '/admin';
    
    const selectedSeo = selectedProduct ? generateProductSEOPackage(selectedProduct, products) : null;
    
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        {selectedProduct && selectedSeo ? (
          <Helmet>
            <title>{selectedSeo.seoTitle}</title>
            <meta name="description" content={selectedSeo.metaDescription} />
            <link rel="canonical" href={selectedSeo.canonicalUrl} />
            <meta property="og:title" content={selectedSeo.seoTitle} />
            <meta property="og:description" content={selectedSeo.metaDescription} />
            {selectedProduct.image && <meta property="og:image" content={selectedProduct.image} />}
            <meta property="og:url" content={selectedSeo.canonicalUrl} />
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
            onOpenSearchModal={() => setIsSearchModalOpen(true)}
            onOpenNewArrivals={() => setIsNewArrivalsOpen(true)}
          />
        )}
        
        <main className="pb-20 md:pb-0">
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
            <Route path="/categorie/:categorySlug" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <CategoryPage products={products} onProductClick={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="/guide/:useCaseSlug" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <UseCaseGuide products={products} onProductClick={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="/a-propos" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <AboutAndPartners />
              </React.Suspense>
            } />
            <Route path="/osmo-pocket-4p" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <OsmoPocket4Page />
              </React.Suspense>
            } />
            <Route path="/dji-osmo-pocket-4-pro" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <OsmoPocket4Page />
              </React.Suspense>
            } />
            <Route path="/camera-maroc" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <CameraMarocPage products={products} openProductModal={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="/cameras-maroc" element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <CameraMarocPage products={products} openProductModal={openProductModal} siteConfig={siteConfig} />
              </React.Suspense>
            } />
            <Route path="*" element={
              <>
                <Hero siteConfig={{ ...siteConfig, heroImg: '/banner_7artisans.jpg' }} />
                
                <React.Suspense fallback={<LoadingSpinner />}>
                  <TrustBadges />

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
                      initialCategory={selectedCategory}
                      onCategoryConsumed={() => setSelectedCategory('all')}
                      initialBrand={selectedBrand}
                      onBrandConsumed={() => setSelectedBrand('all')}
                    />
                  )}

                  {/* Brand logos strip — positioned after Products */}
                  <BrandLogos
                    onBrandSelect={(brand) => {
                      setSelectedBrand(brand);
                      setTimeout(() => {
                        const el = document.getElementById('products');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  />

                  <VideoShowcase siteConfig={siteConfig} />
                  <Testimonials />
                  <FAQ />
                  <SEOContentSection />
                  <Newsletter />
                </React.Suspense>
              </>
            } />
          </Routes>
        </main>

        {!isAdminRoute && !selectedProduct && (
          <>
            <Footer siteConfig={siteConfig} />
            <FloatingWhatsApp siteConfig={siteConfig} />
            <BottomNav
              onHomeClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShopClick={() => {
                const el = document.getElementById('products');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onCartClick={() => setIsCartOpen(true)}
              onSearchClick={() => setIsSearchModalOpen(true)}
              siteConfig={siteConfig}
            />
          </>
        )}
        {!isAdminRoute && selectedProduct && (
          <Footer siteConfig={siteConfig} />
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
            allProducts={products}
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
            onSelectProduct={openProductModal}
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

        <SearchModal
          isOpen={isSearchModalOpen}
          products={products}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectProduct={(id, query) => openProductModal(id, query)}
          siteConfig={siteConfig}
          initialQuery={searchHistoryQuery}
          onSearchInCatalog={(searchQ) => {
            setIsSearchModalOpen(false);
            setGlobalSearchQuery(searchQ);
            setSelectedCategory('all');
            if (location.pathname !== '/') {
              navigate('/');
            }
            setTimeout(() => {
              const el = document.getElementById('products');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 120);
          }}
        />

        {/* New Arrivals Drawer */}
        <NewArrivals
          isOpen={isNewArrivalsOpen}
          onClose={() => setIsNewArrivalsOpen(false)}
          products={products}
          onProductClick={(id) => {
            setIsNewArrivalsOpen(false);
            openProductModal(id);
          }}
        />

        <CookieConsentBanner />
        {/* Automatic lead popups disabled per user request */}

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
