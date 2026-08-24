import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { getBrands, getBrandBySlug, slugify } from '../utils/catalogEngine';
import { extractProductAttributes } from '../utils/productMetadata';

interface BrandClusterProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
}

interface BrandSEOProfile {
  name: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  heroH1: string;
  heroSub: string;
  whyTitle: string;
  whyText: string;
  matchTerms: string[];
}

const BRAND_PROFILES: Record<string, BrandSEOProfile> = {
  '7artisans': {
    name: '7Artisans',
    metaTitle: 'Objectifs 7Artisans Maroc | Distributeur Officiel Casablanca — Prix les plus bas',
    metaDesc: 'Importateur direct et revendeur officiel 7Artisans au Maroc. Objectifs autofocus F1.8 et ciné T2.0 pour Sony E, Canon RF, Nikon Z, Fuji FX, Lumix L-Mount. Garantie 1 an, stock Casablanca.',
    keywords: '7artisans maroc, objectif 7artisans casablanca, objectif 7artisans af maroc, 7artisans cinema lens maroc, 7artisans sony e, 7artisans nikon z, 7artisans canon rf',
    heroH1: 'Objectifs 7Artisans au Maroc',
    heroSub: 'Distributeur officiel 7Artisans au Maroc. Découvrez la gamme complète d\'objectifs autofocus plein format et lentilles cinéma professionnelles.',
    whyTitle: 'Pourquoi choisir les objectifs 7Artisans chez GearShop Maroc ?',
    whyText: 'GearShop est le revendeur officiel et partenaire exclusif de 7Artisans au Maroc. Vous bénéficiez de l\'importation directe d\'usine sans intermédiaire, garantissant les prix les plus bas du marché, un stock réel à Casablanca et un service après-vente dédié avec garantie 1 an.',
    matchTerms: ['7artisans', 'sevenartisans', '7 artisans']
  },
  'kf-concept': {
    name: 'K&F Concept',
    metaTitle: 'Filtres K&F Concept Maroc | ND Variable, Black Mist, CPL & Bagues | GearShop',
    metaDesc: 'Distributeur officiel K&F Concept au Maroc. Filtres ND variables Nano-Xcel, Black Diffusion 1/4, filtres polarisants CPL, kits bagues d\'adaptation et sacs photo à Casablanca.',
    keywords: 'kf concept maroc, k&f concept casablanca, filtre nd variable maroc, filtre black mist maroc, filtre cpl maroc, bagues adaptation kf maroc',
    heroH1: 'Filtres & Accessoires K&F Concept au Maroc',
    heroSub: 'Filtres optiques de haute précision en verre optique japonais Nano-Xcel, bagues d\'adaptation métalliques et accessoires photo/vidéo professionnels.',
    whyTitle: 'La référence mondiale des filtres optiques désormais disponible au Maroc',
    whyText: 'Les filtres K&F Concept garantissent une clarté optique parfaite sans dominante de couleur (True Color) et sans croix noire (vignettage en X). Protégez et sublimez vos optiques avec les technologies de traitement Nano-Xcel et Nano-X.',
    matchTerms: ['k&f', 'kf', 'concept', 'kent faith']
  },
  'lumix': {
    name: 'Panasonic Lumix (L-Mount & M43)',
    metaTitle: 'Objectifs Panasonic Lumix au Maroc (L-Mount & Micro 4/3) | GearShop Casa',
    metaDesc: 'Achetez vos objectifs pour Panasonic Lumix au Maroc. Gamme complète autofocus F1.8 L-Mount (S5, S5II, S1H) et Cinéma T2.0 / Micro 4/3 (GH5, GH6, G9). Stock à Casablanca, livraison 24h.',
    keywords: 'objectif lumix maroc, lens lumix casa, lumix maroc, objectif panasonic lumix maroc, panasonic s5ii objectifs maroc, optique l mount maroc, lumix gh5 lens casablanca, 7artisans lumix maroc',
    heroH1: 'Objectifs pour Panasonic Lumix au Maroc',
    heroSub: 'Découvrez notre gamme complète d\'objectifs autofocus F1.8 et ciné T2.0 compatibles avec les boîtiers Lumix Plein Format (L-Mount) et Micro 4/3.',
    whyTitle: 'Pourquoi équiper votre boîtier Lumix chez GearShop Maroc ?',
    whyText: 'Que vous tourniez sur Lumix S5, S5II, S5IIX, S1H ou sur la gamme Micro 4/3 (GH5, GH6, G9), nos optiques 7Artisans autofocus et cinéma offrent une netteté exceptionnelle, des bokehs crémeux et un contrôle tactile précis pour vos tournages professionnels au Maroc.',
    matchTerms: ['lumix', 'panasonic', 'l mount', 'l-mount', 'm43', 'micro 4/3', 'olympus']
  },
  'panasonic': {
    name: 'Panasonic Lumix (L-Mount & M43)',
    metaTitle: 'Objectifs Panasonic Lumix au Maroc (L-Mount & Micro 4/3) | GearShop Casa',
    metaDesc: 'Achetez vos objectifs pour Panasonic Lumix au Maroc. Gamme complète autofocus F1.8 L-Mount (S5, S5II, S1H) et Cinéma T2.0 / Micro 4/3 (GH5, GH6, G9). Stock à Casablanca, livraison 24h.',
    keywords: 'objectif lumix maroc, lens lumix casa, lumix maroc, objectif panasonic lumix maroc, panasonic s5ii objectifs maroc, optique l mount maroc, lumix gh5 lens casablanca, 7artisans lumix maroc',
    heroH1: 'Objectifs pour Panasonic Lumix au Maroc',
    heroSub: 'Découvrez notre gamme complète d\'objectifs autofocus F1.8 et ciné T2.0 compatibles avec les boîtiers Lumix Plein Format (L-Mount) et Micro 4/3.',
    whyTitle: 'Pourquoi équiper votre boîtier Lumix chez GearShop Maroc ?',
    whyText: 'Que vous tourniez sur Lumix S5, S5II, S5IIX, S1H ou sur la gamme Micro 4/3 (GH5, GH6, G9), nos optiques 7Artisans autofocus et cinéma offrent une netteté exceptionnelle, des bokehs crémeux et un contrôle tactile précis pour vos tournages professionnels au Maroc.',
    matchTerms: ['lumix', 'panasonic', 'l mount', 'l-mount', 'm43', 'micro 4/3', 'olympus']
  },
  'fujifilm': {
    name: 'Fujifilm (X-Mount & FX)',
    metaTitle: 'Objectifs Fujifilm au Maroc (X-Mount / FX) | Focales Fixes & Cinéma GearShop',
    metaDesc: 'Trouvez les meilleurs objectifs pour Fujifilm au Maroc. Optiques autofocus AF35mm, AF50mm et objectifs cinéma grand angle pour X-T5, X-T4, X-H2S, X-T30. En stock à Casablanca.',
    keywords: 'objectif fujifilm maroc, lens fuji maroc, objectif fuji x mount maroc, objectif fujifilm casablanca, optique fuji xt5 maroc, 7artisans fuji fx maroc, fujifilm cinema lens maroc',
    heroH1: 'Objectifs pour Fujifilm au Maroc (X-Mount)',
    heroSub: 'Sublimez le rendu de votre capteur X-Trans avec nos objectifs autofocus lumineux, focales fixes manuelles et optiques cinéma pour boîtiers Fuji.',
    whyTitle: 'Le mariage parfait avec la colorimétrie argentique Fujifilm',
    whyText: 'Nos optiques 7Artisans pour monture Fuji FX exploitent à 100% le potentiel des simulations de film Fujifilm. Profitez d\'ouvertures ultra-lumineuses F1.2 / F1.4 et de verres haute résolution pour le portrait, la street photography et la vidéo 4K/6K.',
    matchTerms: ['fuji', 'fujifilm', 'fx mount', 'fx-mount', 'x mount', 'x-mount']
  },
  'sony': {
    name: 'Sony (E-Mount & Full Frame)',
    metaTitle: 'Objectifs Sony E-Mount au Maroc | AF F1.8 & Cinéma T2.0 GearShop Casablanca',
    metaDesc: 'Large gamme d\'objectifs pour Sony E-Mount au Maroc (A7 IV, A7R V, FX3, FX30, ZV-E1). Autofocus ultra-rapide et optiques cinéma plein format garanties avec livraison rapide.',
    keywords: 'objectif sony e mount maroc, lens sony maroc, objectif sony a7iv casablanca, objectif fx3 maroc, 7artisans sony e maroc, cine lens sony maroc',
    heroH1: 'Objectifs pour Sony E-Mount au Maroc',
    heroSub: 'Objectifs autofocus AF24mm, AF35mm, AF40mm, AF50mm, AF135mm F1.8 et série cinéma Spectrum T2.0 pour boîtiers Sony Alpha & Cinema Line.',
    whyTitle: 'Performance et compatibilité totale avec le système Sony',
    whyText: 'Tirez le meilleur parti du suivi autofocus et de la stabilisation de vos boîtiers Sony A7 et FX avec nos objectifs 7Artisans de dernière génération, calibrés pour une netteté maximale.',
    matchTerms: ['sony', 'e mount', 'e-mount', 'fe mount']
  },
  'nikon': {
    name: 'Nikon (Z-Mount Full Frame & APS-C)',
    metaTitle: 'Objectifs Nikon Z au Maroc | Gamme AF F1.8 & Cinéma GearShop Casablanca',
    metaDesc: 'Équipez votre Nikon Z (Z6, Z7, Z8, Z9, Z50) avec les meilleurs objectifs au Maroc. Focales fixes autofocus F1.8 lumineuses et lentilles cinéma plein format T2.0 en stock.',
    keywords: 'objectif nikon z maroc, lens nikon z casablanca, objectif nikon z6 z8 maroc, 7artisans nikon z maroc, optique nikon hybride maroc',
    heroH1: 'Objectifs pour Nikon Z au Maroc',
    heroSub: 'Toutes les focales fixes en monture native Nikon Z pour la photo professionnelle et la production vidéo cinématographique.',
    whyTitle: 'Excellence optique sur la monture large Nikon Z',
    whyText: 'Grâce au grand diamètre de la monture Nikon Z, nos objectifs 7Artisans délivrent un piqué exceptionnel du centre jusqu\'aux bords de l\'image, sans vignetage.',
    matchTerms: ['nikon', 'z mount', 'z-mount']
  },
  'canon': {
    name: 'Canon (EOS-R & RF-Mount)',
    metaTitle: 'Objectifs Canon EOS-R (RF-Mount) au Maroc | GearShop Casablanca',
    metaDesc: 'Objectifs et lentilles cinéma pour boîtiers Canon EOS-R au Maroc (R5, R6 II, R3, R7, R10, C70). Haute définition et optiques cinéma T2.0 / T2.1 en stock local.',
    keywords: 'objectif canon rf maroc, objectif canon eos r casablanca, lens canon r6 maroc, cine lens canon rf maroc, 7artisans canon eos-r maroc',
    heroH1: 'Objectifs pour Canon EOS-R au Maroc',
    heroSub: 'Focales fixes manuelles haute résolution et série cinéma Vision & Spectrum T2.0 natives pour votre système hybride Canon RF.',
    whyTitle: 'Qualité cinéma sur vos caméras Canon',
    whyText: 'Conçus avec un corps en aluminium de qualité aéronautique et des bagues fluides sans clic, nos objectifs Canon RF sont l\'outil idéal pour les productions audiovisuelles au Maroc.',
    matchTerms: ['canon', 'eos-r', 'eos r', 'rf mount', 'rf-mount']
  },
  'dji': {
    name: 'DJI',
    metaTitle: 'Matériel DJI au Maroc | Osmo Pocket, Stabilisateurs & Caméras | GearShop Casa',
    metaDesc: 'Achetez votre matériel DJI au Maroc : DJI Osmo Pocket 4 Pro, stabilisateurs et accessoires de vlogging. Prix officiels, garantie 1 an et livraison rapide.',
    keywords: 'dji maroc, dji osmo pocket maroc, dji pocket 4 maroc, stabilisateur dji maroc, dji casablanca',
    heroH1: 'Matériel DJI & Caméras au Maroc',
    heroSub: 'Découvrez la sélection DJI chez GearShop : caméras nomades stabilisées, solutions de vlogging 4K et accessoires certifiés.',
    whyTitle: 'Votre spécialiste DJI à Casablanca',
    whyText: 'Profitez de conseils d\'experts pour choisir vos équipements DJI avec assistance à la configuration, garantie 1 an et disponibilité immédiate à Casablanca.',
    matchTerms: ['dji', 'osmo', 'pocket']
  },
  'godox': {
    name: 'Godox',
    metaTitle: 'Éclairage & Flashs Godox au Maroc | Éclairage Studio & Vidéo | GearShop',
    metaDesc: 'Gamme complète d\'éclairage studio Godox au Maroc : projecteurs LED COB, torches portables, softboxes et flashs cobra. Stock Casablanca.',
    keywords: 'godox maroc, eclairage godox casablanca, flash godox maroc, projecteur led godox maroc',
    heroH1: 'Éclairage Studio & Vidéo Godox au Maroc',
    heroSub: 'Solutions d\'éclairage continu et flashs professionnels pour photographes, vidéastes et studios de production.',
    whyTitle: 'L\'éclairage de référence pour votre studio au Maroc',
    whyText: 'Les éclairages Godox offrent un rendu des couleurs fidèle (CRI/TLCI 96+) et une fiabilité éprouvée pour sublimer vos créations visuelles.',
    matchTerms: ['godox']
  }
};

const BrandCluster: React.FC<BrandClusterProps> = ({ products, onProductClick, siteConfig }) => {
  const { brand } = useParams<{ brand: string }>();
  const { addToCart } = useCart();
  const [selectedMount, setSelectedMount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const brandKey = (brand || '').toLowerCase().trim();
  const catalogBrand = getBrandBySlug(products, brandKey);

  const profile: BrandSEOProfile = useMemo(() => {
    if (BRAND_PROFILES[brandKey]) return BRAND_PROFILES[brandKey];
    const cleanName = catalogBrand ? catalogBrand.name : (brand ? brand.charAt(0).toUpperCase() + brand.slice(1).replace('-', ' ') : 'Marque');
    return {
      name: cleanName,
      metaTitle: `Matériel et Équipements ${cleanName} au Maroc | GearShop Casablanca`,
      metaDesc: `Découvrez notre sélection officielle de matériel ${cleanName} au Maroc chez GearShop. Stock disponible à Casablanca et livraison express 24-48h.`,
      keywords: `${cleanName} maroc, materiel ${cleanName} casablanca, accessoires ${cleanName}, gearshop maroc`,
      heroH1: `Produits & Équipements ${cleanName} au Maroc`,
      heroSub: `Sélection de matériel professionnel certifié ${cleanName} disponible chez GearShop Maroc.`,
      whyTitle: `Pourquoi acheter votre matériel ${cleanName} chez GearShop Maroc ?`,
      whyText: `GearShop garantit des produits 100% originaux avec garantie constructeur 1 an, stock vérifié à Casablanca et conseils techniques sur-mesure.`,
      matchTerms: [brandKey, slugify(cleanName)]
    };
  }, [brandKey, catalogBrand, brand]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212').replace(/\s+/g, '');
    const msg = `Bonjour, je souhaite réserver le produit : ${productName} (Marque : ${profile.name})`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star text-[10px] ${i < rating ? 'text-[#c53030]' : 'text-gray-200'}`}
      />
    ));
  };

  // 1. Initial brand filtering
  const brandProducts = useMemo(() => {
    return products.filter(p => {
      const attrs = extractProductAttributes(p);
      if (catalogBrand && catalogBrand.productIds.includes(p.id)) return true;
      if (attrs.brand && slugify(attrs.brand) === brandKey) return true;
      const haystack = `${p.name || ''} ${p.desc || ''} ${p.category || ''} ${(p.specs || []).join(' ')}`.toLowerCase();
      return profile.matchTerms.some(term => haystack.includes(term.toLowerCase()));
    });
  }, [products, catalogBrand, brandKey, profile.matchTerms]);

  // Extract available mounts within this brand
  const availableMounts = useMemo(() => {
    const mounts = new Set<string>();
    brandProducts.forEach(p => {
      const attrs = extractProductAttributes(p);
      if (attrs.mount && attrs.mount !== 'Universel') mounts.add(attrs.mount);
    });
    return Array.from(mounts).sort();
  }, [brandProducts]);

  // 2. Apply mount and sort filters
  const filteredProducts = useMemo(() => {
    let result = brandProducts.filter(p => {
      if (selectedMount === 'all') return true;
      const attrs = extractProductAttributes(p);
      return attrs.mount === selectedMount;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [brandProducts, selectedMount, sortBy]);

  // Structured Data Schema for CollectionPage
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": profile.heroH1,
    "description": profile.metaDesc,
    "url": `https://gearshop.ma/marque/${brandKey}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": brandProducts.length,
      "itemListElement": brandProducts.slice(0, 12).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": p.name,
        "url": `https://gearshop.ma/product/${p.id}-${slugify(p.name)}`
      }))
    }
  };

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>{profile.metaTitle}</title>
        <meta name="description" content={profile.metaDesc} />
        <meta name="keywords" content={profile.keywords} />
        <link rel="canonical" href={`https://gearshop.ma/marque/${brandKey}`} />
        <meta property="og:title" content={profile.metaTitle} />
        <meta property="og:description" content={profile.metaDesc} />
        <meta property="og:url" content={`https://gearshop.ma/marque/${brandKey}`} />
      </Helmet>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-red-600 transition-colors">Accueil</Link>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-400">Marques</span>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-900 dark:text-white font-semibold">{profile.name}</span>
        </nav>

        {/* Hero Banner for Brand */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/40 text-[#b91c1c] dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full mb-3">
            REVEnDEUR AGRÉÉ &amp; SÉLECTION OFFICIELLE
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {profile.heroH1}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {profile.heroSub}
          </p>
        </div>

        {/* Filters Bar: Mounts & Sorting */}
        <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mount Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-500 mr-1 uppercase">Monture :</span>
            <button
              onClick={() => setSelectedMount('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedMount === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
              }`}
            >
              Toutes ({brandProducts.length})
            </button>
            {availableMounts.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMount(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedMount === m
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <span className="font-bold text-gray-500">Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 font-bold text-gray-800 dark:text-gray-100"
            >
              <option value="featured">Recommandés</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
            </select>
          </div>
        </div>

        {/* Product Count Badge */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {filteredProducts.length} {filteredProducts.length > 1 ? 'produits affichés' : 'produit affiché'}
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stock garanti à Casablanca
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
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
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
            <i className="fa-solid fa-camera text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun produit dans cette monture</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              Contactez-nous directement sur WhatsApp pour vérifier les disponibilités ou commander votre référence spécifique.
            </p>
            <a
              href={`https://wa.me/${siteConfig.phone.replace('+', '')}?text=${encodeURIComponent(`Bonjour, je cherche un produit ${profile.name}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <i className="fa-brands fa-whatsapp text-lg" />
              Demander sur WhatsApp
            </a>
          </div>
        )}
        
        {/* SEO Editorial block for this brand */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100/70 dark:from-gray-800 dark:to-gray-850 rounded-3xl p-8 md:p-10 border border-gray-200/80 dark:border-gray-700">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b91c1c] dark:text-red-400 mb-2 block">
              EXPERTISE &amp; CONSEILS TECHNIQUES AU MAROC
            </span>
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">
              {profile.whyTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-4">
              {profile.whyText}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-truck-fast text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Livraison 24h Casa &amp; 48h Maroc</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-shield-check text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Garantie 1 An &amp; SAV Dédié</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-store text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Showroom à Casablanca</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandCluster;
