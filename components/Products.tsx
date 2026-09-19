import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../App';
import ProductCard from './ProductCard';
import { FilterState } from './ProductFilters';
import CatalogSidebar from './CatalogSidebar';
import FilterDrawer from './FilterDrawer';
import { extractProductAttributes, isProductMatchingCategory, smartFilterUpdate } from '../src/utils/productMetadata';
import { useCart } from '../src/context/CartContext';
import richDescriptions from '../src/data/richDescriptions.json';

interface ProductsProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  initialCategory?: string;
  onCategoryConsumed?: () => void;
  initialBrand?: string;
  onBrandConsumed?: () => void;
}

const Products: React.FC<ProductsProps> = ({
  products,
  onProductClick,
  siteConfig,
  globalSearchQuery,
  setGlobalSearchQuery,
  initialCategory,
  onCategoryConsumed,
  initialBrand,
  onBrandConsumed,
}) => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 10000),
    [products]
  );

  // Initialize filters from URL search params if present
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlCat = searchParams.get('category');
    const urlBrand = searchParams.get('brand');
    const urlMount = searchParams.get('mount');
    const urlLens = searchParams.get('lensType');
    const urlGroup = searchParams.get('condition') as any;
    const urlSort = searchParams.get('sort');
    const urlStock = searchParams.get('stock') === 'true';

    return {
      category: urlCat || initialCategory || 'all',
      mount: urlMount || 'all',
      brand: urlBrand || initialBrand || 'all',
      lensType: (urlLens as any) || 'all',
      filterDiameter: undefined,
      productGroup: urlGroup || undefined,
      priceRange: [0, maxPrice],
      inStockOnly: urlStock,
      sortBy: urlSort || 'default',
    };
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (searchParams.get('view') as 'grid' | 'list') || 'grid';
  });

  // Debounced search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(globalSearchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(globalSearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  // Handle incoming props changes (e.g. from Hero category or brand clicks)
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setFilters((prev) => smartFilterUpdate(prev, { category: initialCategory }));
      onCategoryConsumed?.();
    }
  }, [initialCategory, onCategoryConsumed]);

  useEffect(() => {
    if (initialBrand && initialBrand !== 'all') {
      setFilters((prev) => smartFilterUpdate(prev, { brand: initialBrand }));
      onBrandConsumed?.();
    }
  }, [initialBrand, onBrandConsumed]);

  // Sync state changes back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.brand !== 'all') params.set('brand', filters.brand);
    if (filters.mount !== 'all') params.set('mount', filters.mount);
    if (filters.lensType && filters.lensType !== 'all') params.set('lensType', filters.lensType);
    if (filters.productGroup) params.set('condition', filters.productGroup);
    if (filters.sortBy !== 'default') params.set('sort', filters.sortBy);
    if (filters.inStockOnly) params.set('stock', 'true');
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (debouncedSearchQuery.trim()) params.set('q', debouncedSearchQuery.trim());

    setSearchParams(params, { replace: true });
  }, [filters, viewMode, debouncedSearchQuery, setSearchParams]);

  useEffect(() => {
    setDisplayLimit(12);
  }, [debouncedSearchQuery]);

  const categories = useMemo(() => {
    return [
      'all',
      'Appareils Photo',
      'Objectifs',
      'Éclairage & Flash',
      'Stabilisateurs & Trépieds',
      'Audio & Micros',
      'Filtres',
      'Sacs & Accessoires',
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (debouncedSearchQuery.trim()) {
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const searchTerms = normalize(debouncedSearchQuery).split(/\s+/).filter(Boolean);
      filtered = filtered.filter((p) => {
        const richDesc = (richDescriptions as Record<string, string>)[p.id?.toString()] || '';
        const meta = extractProductAttributes(p);
        const searchText = normalize(`${p.name} ${p.category} ${meta.mount} ${meta.brand} ${meta.lens_type || ''} ${p.desc} ${richDesc}`);
        return searchTerms.every((term) => searchText.includes(term));
      });
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return isProductMatchingCategory(p, filters.category, attr);
      });
    }

    if (filters.lensType && filters.lensType !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        if (attr.product_type !== 'lens') return false;
        return attr.lens_type === filters.lensType;
      });
    }

    if (filters.filterDiameter) {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.filter_diameter ? `${attr.filter_diameter}mm` === filters.filterDiameter : false;
      });
    }

    if (filters.mount !== 'all') {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        if (attr.product_type === 'lens' || attr.product_type === 'adapter') {
          return attr.mount === filters.mount || (filters.mount === 'Canon EF' && attr.mount.includes('Canon'));
        }
        return true;
      });
    }

    if (filters.brand !== 'all') {
      const bLower = filters.brand.toLowerCase();
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        if (attr.brand.toLowerCase() === bLower) return true;
        if (bLower === 'sony' && (attr.mount === 'Sony E' || p.name.toLowerCase().includes('sony'))) return true;
        if (bLower === 'nikon' && (attr.mount === 'Nikon Z' || p.name.toLowerCase().includes('nikon'))) return true;
        if (bLower === 'canon' && (attr.mount.includes('Canon') || p.name.toLowerCase().includes('canon'))) return true;
        if ((bLower === 'fuji' || bLower === 'fujifilm') && (attr.mount === 'Fuji FX' || p.name.toLowerCase().includes('fuji'))) return true;
        if (bLower === 'panasonic' && (attr.mount === 'L Mount' || attr.mount === 'M43' || p.name.toLowerCase().includes('panasonic'))) return true;
        return false;
      });
    }

    if (filters.productGroup) {
      filtered = filtered.filter((p) => {
        const attr = extractProductAttributes(p);
        return attr.condition === filters.productGroup;
      });
    }

    if (filters.inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Curated rich audiovisual mix: DJI Osmo Pocket, Cameras, 7Artisans 135mm, Cinema Lenses, Photo Lenses, Bags, Filters & Lights
    const featuredBestsellers = [
      'DJI Osmo Pocket 4 Pro',
      'Sony Alpha 7 IV Kit + Objectif 28-70mm',
      'AF135mm F1.8 Sony (E Mount) - Black',
      'Sony Cinema Line FX30',
      'Vanguard Sac à Dos Photo VEO GO 42M Noir',
      '77mm True Color VND6-9 Filter - Black',
      'DJI Osmo Pocket 3 Creator Combo',
      '35mm T2.0 Nikon (Z Mount) - Black',
      'Sony FE 50mm f/1.8',
      'K&F Concept 82mm 3-in-1 ND2-32 & CPL & Black Mist 1/4 Filter (Nano-Xcel)',
      'Canon EOS R50 + Objectif RF-S 18-45mm IS STM',
      'Vanguard Sac Photo VEO SELECT 22S Noir',
      'AF135mm F1.8 Nikon (Z Mount) - Black',
      'YM 350',
      '55mm 1/8 Black Mist Filter - Black',
      'K&F Concept Sac Bandoulière Photo Étanche pour Caméra & Accessoires',
      'Canon RF 50MM F1.8 STM',
      'Insta360 Flow 2 Standard Bundle / Summit White CINSABQA',
      '50mm T2.0 Sony (E Mount) - Black',
      'Vanguard Sac à Dos Photo Trolley VEO SELECT 55BT Noir',
      'YB-300R',
      'Nikon Z30 Kit + Objectif Nikkor Z DX 16-50mm f/3.5-6.3 VR',
      'Nikon Nikkor Z 50mm f/1.8 S',
      'Sony FE 24-70mm F2.8 GM II',
      'AF40mm F2.5 Sony (E Mount) - Black',
      'Autofocus adapter for Canon EF - Nikon Z - Black',
      '50mm F1.2 Nikon (Z Mount) - Black',
      'Canon RF 35mm f/1.8 Macro IS STM',
      'Sony FE 85mm F/1.4 GM',
      'AF35mm F1.8 Sony (E Mount) - Black',
      'AF35mm F1.8 Nikon (Z Mount) - Black',
      'AF50mm F1.8 Sony (E Mount) - Black',
      'AF50mm F1.8 Nikon (Z Mount) - Black',
      'AF24mm F1.8 Sony (E Mount) - Black',
      'Sony FE 24-105mm F4 G OSS',
      'Canon RF 100-400mm F5.6-8 IS USM',
      'PL 4-in-1 Lens Adapter compatible with E / L / RF / Z Mount - Silver'
    ];

    const getBestsellerIndex = (p: Product): number => {
      const pName = (p.name || '').trim().toLowerCase();
      return featuredBestsellers.findIndex(
        (b) => b.toLowerCase() === pName || pName.includes(b.toLowerCase())
      );
    };

    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'default':
        default: {
          // 1. Featured Bestsellers Showcase First
          const bIndexA = getBestsellerIndex(a);
          const bIndexB = getBestsellerIndex(b);
          if (bIndexA !== -1 && bIndexB !== -1) return bIndexA - bIndexB;
          if (bIndexA !== -1) return -1;
          if (bIndexB !== -1) return 1;

          // 2. In-Stock and priced items take priority over 0-priced / out of stock
          const hasPriceA = (a.price || 0) > 0 ? 1 : 0;
          const hasPriceB = (b.price || 0) > 0 ? 1 : 0;
          if (hasPriceA !== hasPriceB) return hasPriceB - hasPriceA;

          if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;

          // 3. Balanced Price-Tier Interleaving (sweet-spot accessibility first, not just 38,000 DH first)
          const getPriceTier = (p: Product) => {
            const price = p.price || 0;
            if (price >= 1500 && price <= 8000) return 3; // Moroccan Sweet Spot (high conversion)
            if (price > 8000 && price <= 20000) return 2; // Mid-Pro Gear
            if (price > 20000) return 1; // Flagships
            return 0; // Budget & Accessories
          };

          const tierA = getPriceTier(a);
          const tierB = getPriceTier(b);
          if (tierA !== tierB) return tierB - tierA;

          // Stable secondary ordering by ID/rating
          return (b.id || 0) - (a.id || 0);
        }
      }
    });

    return sorted;
  }, [products, debouncedSearchQuery, filters]);

  useEffect(() => {
    setDisplayLimit(12);
  }, [filters, debouncedSearchQuery]);

  const resetAllFilters = useCallback(() => {
    setGlobalSearchQuery('');
    setFilters({
      category: 'all',
      mount: 'all',
      brand: 'all',
      lensType: 'all',
      filterDiameter: undefined,
      productGroup: undefined,
      priceRange: [0, maxPrice],
      inStockOnly: false,
      sortBy: 'default',
    });
  }, [maxPrice, setGlobalSearchQuery]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212').replace(/[^0-9]/g, '');
    const msg = `Bonjour, je souhaite réserver le produit hors stock : ${productName}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star text-[10px] ${
          i < rating ? 'text-[#ff3b30]' : 'text-gray-200'
        }`}
      />
    ));
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.mount !== 'all',
    filters.brand !== 'all',
    filters.lensType && filters.lensType !== 'all',
    filters.productGroup !== undefined,
    filters.inStockOnly,
    filters.filterDiameter !== undefined,
    debouncedSearchQuery.trim() !== '',
  ].filter(Boolean).length;

  return (
    <section id="products" className="py-6 md:py-12 bg-white" aria-labelledby="catalogue-heading">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* ── 1. Semantic H1 Header with Clear Visual Hierarchy ───────────────── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-red-600 rounded-full shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600 block mb-0.5">
                Boutique Audiovisuelle Pro
              </span>
              <h1 id="catalogue-heading" className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                Catalogue Équipements Pro &amp; Occasions
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-xs font-medium hidden md:block">
            Revendeur officiel au Maroc • Matériel neuf garanti &amp; Occasions vérifiées
          </p>
        </header>

        {/* ── 2. Brand Selector Bar (Horizontal Swipeable Carousel on Mobile) ── */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <i className="fa-solid fa-award text-red-600" aria-hidden="true" /> Filtrer par Marque Officielle :
            </span>
            {filters.brand !== 'all' && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, brand: 'all' })}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
              >
                <span>Toutes les marques</span>
                <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto no-scrollbar scrollbar-none gap-2 pb-1.5 snap-x snap-mandatory lg:flex-wrap items-center">
            {[
              { id: 'all', label: 'Toutes les Marques' },
              { id: 'Nikon', label: 'Nikon', icon: 'fa-camera' },
              { id: 'Sony', label: 'Sony', icon: 'fa-camera' },
              { id: 'Canon', label: 'Canon', icon: 'fa-camera' },
              { id: 'DJI', label: 'DJI', icon: 'fa-drone' },
              { id: '7Artisans', label: '7Artisans', icon: 'fa-circle-dot' },
              { id: 'Godox', label: 'Godox', icon: 'fa-bolt' },
              { id: 'SmallRig', label: 'SmallRig', icon: 'fa-cube' },
              ...(showAllBrands || ['hollyland', 'insta360', 'vanguard', 'k&f concept', 'kodak', 'pny'].includes(filters.brand.toLowerCase()) ? [
                { id: 'Hollyland', label: 'Hollyland', icon: 'fa-microphone' },
                { id: 'Insta360', label: 'Insta360', icon: 'fa-video' },
                { id: 'Vanguard', label: 'Vanguard', icon: 'fa-suitcase' },
                { id: 'K&F Concept', label: 'K&F Concept', icon: 'fa-circle-half-stroke' },
                { id: 'Kodak', label: 'Kodak', icon: 'fa-camera-retro' },
                { id: 'PNY', label: 'PNY', icon: 'fa-sd-card' },
              ] : [])
            ].map((b) => {
              const isBrandActive = filters.brand.toLowerCase() === b.id.toLowerCase();
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, brand: isBrandActive && b.id !== 'all' ? 'all' : b.id })}
                  className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 border shadow-2xs cursor-pointer min-h-[38px] shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                    isBrandActive
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  {b.icon && <i className={`fa-solid ${b.icon} text-[10px] ${isBrandActive ? 'text-red-500' : 'text-gray-400'}`} aria-hidden="true" />}
                  <span>{b.label}</span>
                </button>
              );
            })}

            {!showAllBrands && !['hollyland', 'insta360', 'vanguard', 'k&f concept', 'kodak', 'pny'].includes(filters.brand.toLowerCase()) && (
              <button
                type="button"
                onClick={() => setShowAllBrands(true)}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300/80 transition flex items-center gap-1 cursor-pointer min-h-[38px] shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                <span>+ 6 Autres Marques</span>
                <i className="fa-solid fa-chevron-down text-[10px]" aria-hidden="true" />
              </button>
            )}

            {showAllBrands && (
              <button
                type="button"
                onClick={() => setShowAllBrands(false)}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-500 bg-transparent hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer min-h-[38px] shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                <span>Réduire</span>
                <i className="fa-solid fa-chevron-up text-[10px]" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. Quick Category Pills Bar (Horizontal Swipeable Carousel on Mobile) ── */}
        <div className="mb-4 flex overflow-x-auto no-scrollbar scrollbar-none gap-2 pb-1.5 snap-x snap-mandatory lg:flex-wrap items-center">
          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-extrabold bg-gray-900 text-white border border-gray-900 hover:bg-black transition cursor-pointer min-h-[38px] flex items-center gap-1.5 shadow-sm lg:hidden shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Ouvrir les filtres avancés"
          >
            <i className="fa-solid fa-sliders text-xs text-red-400" aria-hidden="true" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {[
            {
              id: 'all',
              label: 'Tous les Produits',
              isActive: filters.category === 'all' && !filters.productGroup && (filters.lensType === 'all' || !filters.lensType),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'all', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'cameras',
              label: '📷 Appareils Photo & Caméras',
              isActive: filters.category.toLowerCase().includes('appareil') || filters.category.toLowerCase().includes('caméra'),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Appareil Photo', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'lenses',
              label: '🔍 Objectifs Photo',
              isActive: (filters.category.toLowerCase().includes('objectif') || filters.category === 'lenses') && (filters.lensType === 'all' || !filters.lensType),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Objectifs', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'cinema',
              label: '🎬 Lentilles Cinéma',
              isActive: filters.lensType === 'cinema',
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Objectifs', lensType: 'cinema', productGroup: undefined })),
            },
            {
              id: 'lighting',
              label: '💡 Éclairage & Flash Godox',
              isActive: filters.category.toLowerCase().includes('éclairage') || filters.category.toLowerCase().includes('flash') || filters.category === 'studio',
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Éclairage & Flash', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'rigging',
              label: '🧰 Cages & Rigging SmallRig',
              isActive: filters.brand.toLowerCase() === 'smallrig' || filters.category.toLowerCase().includes('cage'),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Sacs & Accessoires', brand: 'SmallRig', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'stabilizers',
              label: '📐 Stabilisateurs & Trépieds',
              isActive: filters.category.toLowerCase().includes('stabilisateur') || filters.category.toLowerCase().includes('trépied'),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Stabilisateurs & Trépieds', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'audio',
              label: '🎙️ Audio & Micros Hollyland',
              isActive: filters.category.toLowerCase().includes('audio') || filters.category.toLowerCase().includes('micro'),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Audio & Micros', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'filters',
              label: '🔘 Filtres ND & CPL',
              isActive: filters.category.toLowerCase().includes('filtr'),
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Filtres', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'bags',
              label: '🎒 Sacs & Valises Vanguard',
              isActive: filters.brand.toLowerCase() === 'vanguard',
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'Sacs & Accessoires', brand: 'Vanguard', productGroup: undefined, lensType: 'all' })),
            },
            {
              id: 'occasions',
              label: '♻️ Occasions',
              isActive: filters.productGroup === 'used',
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'all', productGroup: 'used', lensType: 'all' })),
            },
            {
              id: 'location',
              label: '🏷️ Location',
              isActive: filters.productGroup === 'rental',
              onClick: () => setFilters(smartFilterUpdate(filters, { category: 'all', productGroup: 'rental', lensType: 'all' })),
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={pill.onClick}
              className={`px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-extrabold border transition cursor-pointer min-h-[38px] shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                pill.isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-500 hover:text-red-600 shadow-2xs'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* ── 4. Unified Cohesive Controls Bar with Active Filter Chips ───────── */}
        <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
          
          {/* Left: Product Count & Removable Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-2xs">
              {filteredProducts.length} équipement{filteredProducts.length > 1 ? 's' : ''}
            </span>

            {debouncedSearchQuery.trim() && (
              <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-magnifying-glass text-[10px] text-amber-600" aria-hidden="true" />
                <span>Recherche : "<strong>{debouncedSearchQuery}</strong>"</span>
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  className="ml-1 w-4 h-4 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 flex items-center justify-center text-xs cursor-pointer focus:outline-none"
                  aria-label="Effacer le terme de recherche"
                >
                  ×
                </button>
              </span>
            )}

            {filters.category !== 'all' && (
              <span className="bg-white text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-tag text-[10px] text-red-600" aria-hidden="true" />
                <span>{filters.category}</span>
                <button
                  type="button"
                  onClick={() => setFilters(smartFilterUpdate(filters, { category: 'all' }))}
                  className="ml-1 text-gray-400 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label={`Supprimer le filtre ${filters.category}`}
                >
                  ×
                </button>
              </span>
            )}

            {filters.brand !== 'all' && (
              <span className="bg-white text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-award text-[10px] text-red-600" aria-hidden="true" />
                <span>{filters.brand}</span>
                <button
                  type="button"
                  onClick={() => setFilters(smartFilterUpdate(filters, { brand: 'all' }))}
                  className="ml-1 text-gray-400 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label={`Supprimer le filtre marque ${filters.brand}`}
                >
                  ×
                </button>
              </span>
            )}

            {filters.mount !== 'all' && (
              <span className="bg-white text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-camera text-[10px] text-red-600" aria-hidden="true" />
                <span>Monture : {filters.mount}</span>
                <button
                  type="button"
                  onClick={() => setFilters(smartFilterUpdate(filters, { mount: 'all' }))}
                  className="ml-1 text-gray-400 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label={`Supprimer le filtre monture ${filters.mount}`}
                >
                  ×
                </button>
              </span>
            )}

            {filters.lensType && filters.lensType !== 'all' && (
              <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-circle-dot text-[10px] text-red-600" aria-hidden="true" />
                <span>
                  {filters.lensType === 'cinema'
                    ? 'Cinéma (T-Stop)'
                    : filters.lensType === 'autofocus'
                    ? 'Autofocus (AF)'
                    : 'Manuel Classique'}
                </span>
                <button
                  type="button"
                  onClick={() => setFilters(smartFilterUpdate(filters, { lensType: 'all' }))}
                  className="ml-1 text-red-400 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label="Supprimer le filtre type d'objectif"
                >
                  ×
                </button>
              </span>
            )}

            {filters.filterDiameter && (
              <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-circle-half-stroke text-[10px] text-red-600" aria-hidden="true" />
                <span>Diamètre : {filters.filterDiameter}</span>
                <button
                  type="button"
                  onClick={() => setFilters(smartFilterUpdate(filters, { filterDiameter: undefined }))}
                  className="ml-1 text-red-400 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label="Supprimer le filtre diamètre"
                >
                  ×
                </button>
              </span>
            )}

            {filters.productGroup && (
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-certificate text-[10px] text-emerald-600" aria-hidden="true" />
                <span>{filters.productGroup === 'used' ? 'Occasion' : filters.productGroup === 'rental' ? 'Location' : 'Neuf'}</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, productGroup: undefined })}
                  className="ml-1 text-emerald-500 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label="Supprimer le filtre condition"
                >
                  ×
                </button>
              </span>
            )}

            {filters.inStockOnly && (
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <i className="fa-solid fa-check text-[10px] text-emerald-600" aria-hidden="true" />
                <span>En stock</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, inStockOnly: false })}
                  className="ml-1 text-emerald-500 hover:text-red-600 font-black text-sm cursor-pointer focus:outline-none"
                  aria-label="Supprimer le filtre en stock"
                >
                  ×
                </button>
              </span>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
              >
                <i className="fa-solid fa-rotate-left text-[10px]" aria-hidden="true" />
                <span>Effacer tous les filtres</span>
              </button>
            )}
          </div>

          {/* Right: Sorting & Grid/List View Toggles */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1 shadow-2xs">
              <label htmlFor="sort-select" className="text-xs font-bold text-gray-500 whitespace-nowrap">
                Trier par :
              </label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="bg-transparent text-gray-900 font-bold text-xs focus:outline-none cursor-pointer py-1.5 pr-2 min-h-[40px]"
              >
                <option value="default">En Vedette</option>
                <option value="newest">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            <div className="flex items-center bg-gray-200/70 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 font-bold shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="Mode Grille"
                aria-pressed={viewMode === 'grid'}
              >
                <i className="fa-solid fa-grip-vertical text-sm" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 font-bold shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="Mode Liste"
                aria-pressed={viewMode === 'list'}
              >
                <i className="fa-solid fa-list text-sm" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. 2-Column Desktop Layout: Sticky Sidebar Left, Catalog Grid Right ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Left Sidebar Filters (Sticky on LG Screens) */}
          <div className="hidden lg:block w-72 shrink-0">
            <CatalogSidebar
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters as FilterState);
              }}
              products={products}
              filteredProducts={filteredProducts}
              categories={categories}
            />
          </div>

          {/* Main Catalog Grid */}
          <div className="flex-1 w-full space-y-6">
            {filteredProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6'
                      : 'flex flex-col gap-4'
                  }
                >
                  {filteredProducts.slice(0, displayLimit).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      siteConfig={siteConfig}
                      openWhatsappReserve={openWhatsappReserve}
                      generateStars={generateStars}
                      addToCart={addToCart}
                    />
                  ))}
                </div>

                {displayLimit < filteredProducts.length && (
                  <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((prev) => prev + 12)}
                      className="px-8 py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-black tracking-wider uppercase rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer min-h-[48px] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      <i className="fa-solid fa-plus text-xs" />
                      <span>Afficher 12 produits suivants</span>
                      <span className="bg-red-800/90 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                        ({filteredProducts.length - displayLimit} restants)
                      </span>
                    </button>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Affichage de {Math.min(displayLimit, filteredProducts.length)} sur {filteredProducts.length} équipements
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
                <div className="text-red-600 mb-4" aria-hidden="true">
                  <i className="fa-solid fa-search text-5xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun matériel ne correspond à ces critères
                </h2>
                <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
                  Essayez de réinitialiser la monture ou la marque pour afficher l'ensemble des équipements disponibles.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Off-Canvas Accessible Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        products={products}
        filteredCount={filteredProducts.length}
        categories={categories}
      />
    </section>
  );
};

export default Products;

