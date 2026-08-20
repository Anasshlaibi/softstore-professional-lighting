import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';

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
  'fuji': {
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
  'kf-concept': {
    name: 'K&F Concept (Filtres, Bagues & Accessoires)',
    metaTitle: 'K&F Concept Maroc | Filtres ND Variables, Black Mist, CPL & Bagues Casablanca',
    metaDesc: 'Distributeur officiel K&F Concept au Maroc. Filtres 3-en-1 Nano-Xcel, Black Diffusion 1/4, polarisants CPL, kits bagues d\'adaptation et sacs photo au meilleur prix.',
    keywords: 'kf concept maroc, k&f concept casablanca, filtre nd variable maroc, filtre black mist maroc, filtre cpl maroc, bagues adaptation kf maroc, sac camera kf maroc',
    heroH1: 'Produits K&F Concept au Maroc',
    heroSub: 'Filtres optiques de précision en verre japonais Nano-Xcel, bagues d\'adaptation métalliques et accessoires photo/vidéo professionnels.',
    whyTitle: 'La référence mondiale des filtres optiques désormais au Maroc',
    whyText: 'Les filtres K&F Concept garantissent une clarté optique parfaite sans dominante de couleur (True Color) et sans croix noire. Protégez et sublimez vos optiques avec les technologies Nano-Xcel et Nano-X.',
    matchTerms: ['k&f', 'kf', 'concept']
  }
};

const BrandCluster: React.FC<BrandClusterProps> = ({ products, onProductClick, siteConfig }) => {
  const { brand } = useParams<{ brand: string }>();
  const { addToCart } = useCart();

  const brandKey = (brand || '').toLowerCase().trim();
  const profile = BRAND_PROFILES[brandKey] || {
    name: brand ? brand.charAt(0).toUpperCase() + brand.slice(1).replace('-', ' ') : 'Marque',
    metaTitle: `Objectifs et Équipements ${brand} au Maroc | GearShop Casablanca`,
    metaDesc: `Découvrez notre sélection d'objectifs et d'équipements pour ${brand} au Maroc. Stock disponible à Casablanca et livraison express dans tout le Maroc.`,
    keywords: `objectif ${brand} maroc, materiel ${brand} casablanca, accessoires ${brand}, gearshop maroc`,
    heroH1: `Objectifs et Équipements pour ${brand}`,
    heroSub: `Sélection de matériel professionnel certifié compatible avec vos équipements ${brand} au Maroc.`,
    whyTitle: `Pourquoi choisir GearShop pour votre matériel ${brand} ?`,
    whyText: `GearShop garantit des produits authentiques avec garantie constructeur, stock disponible immédiatement à Casablanca et conseils techniques personnalisés.`,
    matchTerms: [brandKey]
  };

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212');
    const msg = `Bonjour, je souhaite réserver le produit : ${productName} (Catégorie ${profile.name})`;
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

  // Comprehensive filter matching for mounts, brand names, and aliases
  const brandProducts = products.filter(p => {
    const haystack = `${p.name || ''} ${p.desc || ''} ${p.category || ''} ${(p.specs || []).join(' ')}`.toLowerCase();
    return profile.matchTerms.some(term => haystack.includes(term.toLowerCase()));
  });

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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-red-600 transition-colors">Accueil</Link>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-900 dark:text-white font-semibold">{profile.name}</span>
        </nav>

        {/* Hero Banner for Brand */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/40 text-[#b91c1c] dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full mb-3">
            COMPATIBILITÉ &amp; SÉLECTION OFFICIELLE
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {profile.heroH1}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {profile.heroSub}
          </p>
        </div>

        {/* Product Count Badge */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {brandProducts.length} {brandProducts.length > 1 ? 'produits disponibles' : 'produit disponible'}
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En stock à Casablanca
          </div>
        </div>

        {/* Product Grid */}
        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brandProducts.map(product => (
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sélection en cours d'arrivage</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              Contactez-nous directement sur WhatsApp pour réserver vos optiques ou vérifier la compatibilité avec votre modèle.
            </p>
            <a
              href={`https://wa.me/${siteConfig.phone.replace('+', '')}?text=${encodeURIComponent(`Bonjour, je cherche du matériel pour ${profile.name}`)}`}
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
