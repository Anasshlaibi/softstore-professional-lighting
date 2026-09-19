import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import { useCart } from '../context/CartContext';
import { extractProductAttributes } from '../utils/productMetadata';
import { findCompatibleAccessories, findCompatibleLensesForCamera, getProductPriorityScore, slugify } from '../utils/catalogEngine';
import richDescriptions from '../data/richDescriptions.json';
import ProductCard from '../../components/ProductCard';

interface ProductDetailPageProps {
  products: Product[];
  siteConfig: {
    currency: string;
    phone: string;
    storeName?: string;
  };
  onProductClick?: (id: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  products,
  siteConfig,
  onProductClick
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, updateCartQty } = useCart();

  // Find product by slug or ID
  const product = useMemo(() => {
    if (!slug || !Array.isArray(products) || products.length === 0) return null;

    // Check if slug starts with ID (e.g., "5099-nikon-zr")
    const idMatch = slug.match(/^(\d+)/);
    if (idMatch) {
      const id = parseInt(idMatch[1], 10);
      const foundById = products.find(p => p.id === id);
      if (foundById) return foundById;
    }

    // Otherwise match by slugified name
    return products.find(p => slugify(p.name) === slug || p.name.toLowerCase().includes(slug.toLowerCase())) || null;
  }, [slug, products]);

  // Gallery State
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.image) imgs.push(product.image);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(img => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : ['/images/products/nikon-zr.webp'];
  }, [product]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'accessories' | 'reviews'>('overview');
  const [addedToast, setAddedToast] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedLensId, setSelectedLensId] = useState<number | null>(null);

  // Compatible real lenses from catalog for cameras (Nikon Z, Sony E, Canon RF...)
  const compatibleLenses = useMemo(() => {
    if (!product || !Array.isArray(products)) return [];
    return findCompatibleLensesForCamera(products, product).slice(0, 4);
  }, [products, product]);

  const selectedLens = useMemo(() => {
    return compatibleLenses.find(l => l.id === selectedLensId) || null;
  }, [compatibleLenses, selectedLensId]);

  // Reset state when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setSelectedLensId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  // Metadata & specs
  const meta = useMemo(() => {
    if (!product) return { brand: 'GearShop', mount: '', lens_type: '', filter_size: '', is_flagship: false, category_clean: '', product_type: '' };
    return extractProductAttributes(product);
  }, [product]);

  // Dynamic price with real selected lens
  const calculatedPrice = useMemo(() => {
    if (!product) return 0;
    return product.price + (selectedLens ? selectedLens.price : 0);
  }, [product, selectedLens]);

  // Key feature bullet points
  const keyFeatures = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.specs) && product.specs.length > 0) {
      return product.specs;
    }
    const list: string[] = [];
    if (meta.brand) list.push(`Marque Certifiée : ${meta.brand}`);
    if (meta.mount) list.push(`Monture Officielle : ${meta.mount}`);
    if (meta.lens_type) list.push(`Gamme Optique : ${meta.lens_type.toUpperCase()} Haute Précision`);
    if (meta.filter_size) list.push(`Diamètre Filtre : ${meta.filter_size}`);
    list.push('Capteur & Électronique de traitement nouvelle génération');
    list.push('Qualité de fabrication professionnelle pour le cinéma et la photo');
    list.push('Garantie constructeur officielle avec SAV local à Casablanca');
    return list;
  }, [product, meta]);

  // Compatible accessories for bundle builder
  const compatibleAccessories = useMemo(() => {
    if (!product || !Array.isArray(products) || products.length === 0) return [];
    return findCompatibleAccessories(products, product).slice(0, 3);
  }, [product, products]);

  // Frequently bought together bundle selection
  const [selectedBundleItems, setSelectedBundleItems] = useState<number[]>([]);
  useEffect(() => {
    if (compatibleAccessories.length > 0) {
      setSelectedBundleItems(compatibleAccessories.map(a => a.id));
    } else {
      setSelectedBundleItems([]);
    }
  }, [compatibleAccessories]);

  // Bundle Total Price & Savings
  const bundleTotalPrice = useMemo(() => {
    if (!product) return 0;
    let total = product.price;
    compatibleAccessories.forEach(acc => {
      if (selectedBundleItems.includes(acc.id)) {
        total += acc.price;
      }
    });
    return total;
  }, [product, compatibleAccessories, selectedBundleItems]);

  const bundleSavings = useMemo(() => {
    if (selectedBundleItems.length === 0) return 0;
    return Math.round(bundleTotalPrice * 0.08); // 8% combo savings
  }, [bundleTotalPrice, selectedBundleItems]);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(products)) return [];
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand || p.name.includes(meta.brand)))
      .sort((a, b) => getProductPriorityScore(b) - getProductPriorityScore(a))
      .slice(0, 4);
  }, [product, products, meta.brand]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    if (selectedLens) {
      for (let i = 0; i < quantity; i++) {
        addToCart(selectedLens.id);
      }
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Handle Add Full Bundle to Cart
  const handleAddBundleToCart = () => {
    if (!product) return;
    addToCart(product.id);
    compatibleAccessories.forEach(acc => {
      if (selectedBundleItems.includes(acc.id)) {
        addToCart(acc.id);
      }
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // WhatsApp Order Handler
  const handleWhatsAppOrder = () => {
    if (!product) return;
    const phone = siteConfig.phone.replace(/[^0-9]/g, '') || '212673011873';
    const lensDetails = selectedLens
      ? `\n🔍 Objectif Compatible Ajouté : *${selectedLens.name}* (+${selectedLens.price.toLocaleString('fr-FR')} ${siteConfig.currency})`
      : '\nConfiguration : *Boîtier Nu*';
    const message = `Bonjour GearShop Maroc,\n\nJe souhaite commander :\n📸 Produit : *${product.name}*${lensDetails}\n💰 Total : *${calculatedPrice.toLocaleString('fr-FR')} ${siteConfig.currency}*\n🏷️ Réf : #${product.id}\nQuantité : ${quantity}\n\nPouvez-vous me confirmer la disponibilité et la livraison express ? Merci !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Hover Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <i className="fa-solid fa-camera-rotate text-5xl text-gray-300 mb-4 animate-spin-slow"></i>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-500 mb-6 max-w-md">Le matériel photo que vous recherchez n'est plus disponible ou a été déplacé.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-lg shadow-red-600/20"
        >
          Retourner au Catalogue
        </Link>
      </div>
    );
  }

  const currentImage = galleryImages[activeImageIdx] || galleryImages[0];
  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const rawRichDesc = (richDescriptions as Record<string, string>)[product.id?.toString()] || product.desc || '';

  return (
    <div className="bg-[#f8f9fb] min-h-screen pb-20 pt-3 md:pt-4 text-gray-900">
      <Helmet>
        <title>{`${product.name} au Meilleur Prix Maroc | GearShop`}</title>
        <meta
          name="description"
          content={`Achetez ${product.name} à ${product.price} ${siteConfig.currency} au Maroc. Matériel 100% Neuf avec garantie officielle, showroom à Casablanca et livraison express 24h.`}
        />
        <link rel="canonical" href={`https://gearshop.ma/product/${product.id}-${slugify(product.name)}`} />
        <meta property="og:title" content={`${product.name} | GearShop Maroc`} />
        <meta property="og:description" content={`Disponible au Maroc chez GearShop. Prix: ${product.price} ${siteConfig.currency}. Livraison express.`} />
        <meta property="og:image" content={currentImage.startsWith('http') ? currentImage : `https://gearshop.ma${currentImage}`} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp border border-gray-700">
          <i className="fa-solid fa-circle-check text-green-400 text-lg"></i>
          <div>
            <div className="text-xs font-bold text-gray-200">Ajouté au panier avec succès !</div>
            <div className="text-xs text-gray-400">{product.name} (x{quantity})</div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── BREADCRUMB NAVIGATION ────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-red-600 transition">Accueil</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="capitalize text-gray-600 hover:text-red-600 cursor-pointer">{product.category || 'Photo & Vidéo'}</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-600">{meta.brand}</span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-gray-900 truncate max-w-[240px] sm:max-w-md">{product.name}</span>
        </nav>

        {/* ── B&H HEADER BAR (Title, Ratings, Authorized Badge) ─────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 mb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
              <span>BH #{product.id.toString().padStart(8, '0')}</span>
              <span>•</span>
              <span>MFR #PRO-{product.id}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <div className="flex text-xs">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className={i < (product.stars || 5) ? 'text-amber-400' : 'text-gray-300'}>{s}</span>
                  ))}
                </div>
                <span className="text-gray-700 underline cursor-pointer ml-0.5">32 avis</span>
              </div>
              <span>•</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">12 Questions, 13 Réponses</span>
              <span>•</span>
              <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="hover:text-red-600 flex items-center gap-1">
                <i className="fa-solid fa-share-nodes text-[10px]" /> Partager
              </button>
            </div>
          </div>

          {/* Authorized Dealer Badge */}
          <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs self-start md:self-auto">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black text-sm">
              {meta.brand.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-gray-900 tracking-wider">{meta.brand}</span>
              <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[9px]" /> Revendeur Officiel
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN PRODUCT SHOWCASE (B&H LAYOUT) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200">
          
          {/* ── LEFT COLUMN: Vertical Thumbnails + Main Photo + Key Features (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Gallery Frame with Vertical Thumbnails */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
              
              {/* Vertical Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[440px] scrollbar-thin shrink-0">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl bg-white border-2 p-1 transition overflow-hidden shrink-0 flex items-center justify-center ${
                        activeImageIdx === idx
                          ? 'border-red-600 shadow-md ring-2 ring-red-100'
                          : 'border-gray-200 hover:border-gray-400 opacity-80'
                      }`}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                    </button>
                  ))}
                  {product.video && (
                    <div className="w-16 h-16 rounded-xl bg-gray-900 text-white border border-gray-800 flex flex-col items-center justify-center gap-0.5 shrink-0 text-[10px] font-bold">
                      <i className="fa-solid fa-play text-xs text-red-500" />
                      <span>Vidéo</span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Image Frame with Hover Zoom */}
              <div
                className="relative flex-1 w-full aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-6 overflow-hidden group cursor-crosshair shadow-inner"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {/* 90-Second Intro Badge */}
                {product.video && (
                  <div className="absolute top-3 right-3 z-20 bg-black/80 text-white rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                    <i className="fa-solid fa-circle-play text-red-500 text-xs" />
                    <span>Aperçu Vidéo</span>
                  </div>
                )}

                {/* Main Product Image */}
                <img
                  src={currentImage}
                  alt={`${product.name} - Matériel Photo Maroc`}
                  title={`${product.name} - GearShop Maroc`}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
                    isZoomed ? 'scale-160' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        }
                      : undefined
                  }
                />

                {/* Zoom Hint */}
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium border border-gray-200 pointer-events-none">
                  <i className="fa-solid fa-magnifying-glass-plus mr-1" /> Survoler pour zoomer
                </div>
              </div>

            </div>

            {/* ── Key Features List (B&H Style) ────────────────────────────── */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Caractéristiques Clés (Key Features) :
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                {(showAllFeatures ? keyFeatures : keyFeatures.slice(0, 4)).map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
              {keyFeatures.length > 4 && (
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 underline"
                >
                  {showAllFeatures ? 'Afficher moins' : 'Afficher plus de détails (Show More) >'}
                </button>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN: B&H BUY BOX (6 Cols) ─────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="flex flex-col gap-5">
              
              {/* Stock Status Badge */}
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 w-fit">
                <i className="fa-solid fa-circle-check text-green-600" />
                <span>En Stock • Expédition Immédiate 24h-48h Partout au Maroc</span>
              </div>

              {/* Price & Savings */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    {calculatedPrice.toLocaleString('fr-FR')} {siteConfig.currency}
                  </span>
                  {product.oldPrice && product.oldPrice > calculatedPrice && (
                    <span className="text-base text-gray-400 line-through font-medium">
                      {product.oldPrice.toLocaleString('fr-FR')} {siteConfig.currency}
                    </span>
                  )}
                </div>
                {product.oldPrice && product.oldPrice > calculatedPrice && (
                  <span className="text-xs font-bold text-green-700 mt-1 inline-block">
                    Économisez {(product.oldPrice - calculatedPrice).toLocaleString('fr-FR')} {siteConfig.currency}
                  </span>
                )}
              </div>

              {/* Real Compatible Lenses from Catalog */}
              {compatibleLenses.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-800 mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-dot text-red-600" />
                      <span>Objectifs Compatibles en Stock ({compatibleLenses.length}) :</span>
                    </span>
                    {selectedLens && (
                      <button
                        type="button"
                        onClick={() => setSelectedLensId(null)}
                        className="text-[11px] text-red-600 hover:text-red-700 underline font-bold cursor-pointer"
                      >
                        Réinitialiser (Boîtier Nu)
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option 1: Boîtier Nu */}
                    <button
                      type="button"
                      onClick={() => setSelectedLensId(null)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                        selectedLensId === null
                          ? 'border-green-600 bg-green-50/50 ring-2 ring-green-200 text-gray-900 font-bold shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">Boîtier Nu</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{product.price.toLocaleString('fr-FR')} {siteConfig.currency}</div>
                      </div>
                      {selectedLensId === null && <i className="fa-solid fa-circle-check text-green-600 text-sm" />}
                    </button>

                    {/* Real matching lenses from store */}
                    {compatibleLenses.map((lens) => {
                      const isSelected = selectedLensId === lens.id;
                      return (
                        <button
                          key={lens.id}
                          type="button"
                          onClick={() => setSelectedLensId(isSelected ? null : lens.id)}
                          className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'border-green-600 bg-green-50/50 ring-2 ring-green-200 text-gray-900 font-bold shadow-2xs'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate text-[11px] text-gray-900" title={lens.name}>
                              {lens.name}
                            </div>
                            <div className="text-[11px] text-green-700 font-black mt-0.5">
                              +{lens.price.toLocaleString('fr-FR')} {siteConfig.currency}
                            </div>
                          </div>
                          {isSelected ? (
                            <i className="fa-solid fa-circle-check text-green-600 text-sm shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 p-0.5 shrink-0 overflow-hidden">
                              <img src={lens.image} alt={lens.name} className="w-full h-full object-contain" width={32} height={32} loading="lazy" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart (B&H Green Theme) */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden h-12">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 h-full hover:bg-gray-100 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 h-full hover:bg-gray-100 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Wide Green Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-[#28a745] hover:bg-[#218838] active:scale-[0.98] text-white font-black text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-700/20 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-cart-shopping" />
                    <span>Ajouter au Panier (Add to Cart)</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => setAddedToast(true)}
                    className="w-12 h-12 rounded-xl border border-gray-300 hover:border-gray-400 bg-white text-gray-600 flex items-center justify-center transition"
                    title="Ajouter aux favoris"
                  >
                    <i className="fa-regular fa-bookmark text-base" />
                  </button>
                </div>

                {/* Instant WhatsApp Order */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full h-11 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <i className="fa-brands fa-whatsapp text-lg" />
                  <span>Commander Express par WhatsApp (Paiement Réception)</span>
                </button>
              </div>

              {/* Shipping & Delivery Guarantee */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs text-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <i className="fa-solid fa-truck-fast text-red-600" />
                    Livraison Partout au Maroc :
                  </span>
                  <span className="font-bold text-green-700">GRATUITE</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Expédition le jour même pour Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir...
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex items-center gap-2 text-emerald-800 text-[11px] font-medium">
                  <i className="fa-solid fa-box-open text-emerald-600 text-xs shrink-0" />
                  <span><strong>Vérification à la réception :</strong> Ouvrez et inspectez le matériel avant de régler.</span>
                </div>
              </div>

            </div>

            {/* Business Financing & Protection options */}
            <div className="border-t border-gray-100 pt-4 mt-4 text-xs text-gray-500 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <i className="fa-solid fa-shield-halved text-green-600" /> Protection Matériel 2 Ans
                </span>
                <span className="text-gray-900 font-bold">Incluse 100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <i className="fa-solid fa-file-invoice-dollar text-blue-600" /> Facture Pro &amp; TVA Déductible
                </span>
                <span className="text-gray-900 font-bold">Disponible</span>
              </div>
            </div>

          </div>

        </div>

        {/* ── B&H SAVINGS AVAILABLE / FREQUENTLY BOUGHT TOGETHER ────────────── */}
        {compatibleAccessories.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-tag text-red-600" />
                  Packs &amp; Économies Disponibles (Savings Available)
                </h2>
                <p className="text-xs text-gray-500">
                  Associez les accessoires officiels compatibles et bénéficiez d'une remise pack immédiate :
                </p>
              </div>
              {bundleSavings > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full border border-green-300">
                  Économie : -{bundleSavings.toLocaleString('fr-FR')} DH
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Visual Component Icons */}
              <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
                {/* Main Camera */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-200 p-2 flex items-center justify-center shrink-0">
                  <img src={currentImage} alt={product.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-gray-400">+</span>

                {compatibleAccessories.map(acc => {
                  const isChecked = selectedBundleItems.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedBundleItems(prev =>
                          isChecked ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                        );
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                        isChecked ? 'border-green-600 bg-green-50/40' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-green-600"
                      />
                      <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                        <img src={acc.image} alt={acc.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-gray-900 truncate max-w-[140px]">{acc.name}</div>
                        <div className="text-green-700 font-bold">{acc.price.toLocaleString('fr-FR')} DH</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Pack Price & Action */}
              <div className="lg:col-span-4 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-500">Prix Total du Pack ({selectedBundleItems.length + 1} articles) :</div>
                  <div className="text-2xl font-black text-gray-900">{bundleTotalPrice.toLocaleString('fr-FR')} DH</div>
                </div>
                <button
                  onClick={handleAddBundleToCart}
                  className="w-full py-2.5 bg-[#28a745] hover:bg-[#218838] text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  Ajouter le Pack Complet au Panier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 4-TAB DETAILED SECTION (PROSE HTML RENDERING) ───────────────── */}
        <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aperçu Détaillé
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'specs'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Fiche Technique
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'accessories'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Accessoires &amp; Rigging
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'reviews'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Avis Clients (32)
            </button>
          </div>

          {/* TAB 1: OVERVIEW (CLEAN HTML RENDERING) */}
          {activeTab === 'overview' && (
            <div>
              {rawRichDesc ? (
                <div
                  className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed space-y-3 font-sans [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-4 [&>h3]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:mb-2 [&>p>strong]:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: rawRichDesc }}
                />
              ) : (
                <p className="text-gray-600 text-sm">{product.desc}</p>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-4 font-bold text-gray-900 w-1/3">Marque</th>
                    <td className="py-3 px-4 text-gray-700 font-semibold">{meta.brand}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-bold text-gray-900">Modèle</th>
                    <td className="py-3 px-4 text-gray-700">{product.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-4 font-bold text-gray-900">Catégorie</th>
                    <td className="py-3 px-4 text-gray-700 capitalize">{product.category}</td>
                  </tr>
                  {meta.mount && (
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 font-bold text-gray-900">Monture Optique</th>
                      <td className="py-3 px-4 text-gray-700">{meta.mount}</td>
                    </tr>
                  )}
                  {meta.filter_size && (
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 font-bold text-gray-900">Diamètre Filtre</th>
                      <td className="py-3 px-4 text-gray-700">{meta.filter_size}</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-bold text-gray-900">Disponibilité</th>
                    <td className="py-3 px-4 text-green-700 font-bold">En Stock (Expédition 24h-48h Partout au Maroc)</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-4 font-bold text-gray-900">Garantie</th>
                    <td className="py-3 px-4 text-gray-700">2 Ans Constructeur Officielle</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ACCESSORIES GRID */}
          {activeTab === 'accessories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {compatibleAccessories.map(acc => (
                <div key={acc.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <div className="w-full aspect-square bg-white rounded-lg p-2 mb-3 flex items-center justify-center">
                    <img src={acc.image} alt={acc.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 mb-1 line-clamp-2">{acc.name}</div>
                    <div className="text-xs font-black text-green-700 mb-3">{acc.price.toLocaleString('fr-FR')} DH</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(acc.id);
                      setAddedToast(true);
                      setTimeout(() => setAddedToast(false), 3000);
                    }}
                    className="w-full py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition"
                  >
                    Ajouter au Panier
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="text-4xl font-black text-gray-900">4.9</div>
                <div>
                  <div className="flex text-amber-400 text-sm gap-0.5 mb-1">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">Basé sur 32 avis vérifiés au Maroc</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-gray-900">Karim B. (Casablanca)</span>
                  <span className="text-[10px] text-gray-400">Il y a 3 jours</span>
                </div>
                <div className="text-amber-400 text-xs mb-1.5">★★★★★</div>
                <p className="text-xs text-gray-600">
                  "Matériel 100% original scellé, reçu en 24h chrono à Casablanca avec facture commerciale. Service client au top !"
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── RELATED PRODUCTS ────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Produits Recommandés &amp; Similaires</h2>
              <Link to="/" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                <span>Voir Tout</span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  currency={siteConfig.currency}
                  onSelect={(id) => {
                    navigate(`/product/${id}-${slugify(rel.name)}`);
                  }}
                  onAddToCart={(p) => addToCart(p, 1)}
                  onDirectOrder={(p) => {
                    navigate(`/product/${p.id}-${slugify(p.name)}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
