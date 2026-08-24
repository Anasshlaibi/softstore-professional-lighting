import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { getCategories, getCategoryBySlug, slugify } from '../utils/catalogEngine';
import { extractProductAttributes } from '../utils/productMetadata';

interface CategoryPageProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
}

interface CategoryEditorial {
  title: string;
  sub: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  description: string;
  buyingTips: string[];
}

const CATEGORY_EDITORIALS: Record<string, CategoryEditorial> = {
  'objectifs': {
    title: 'Objectifs Photo & Cinéma au Maroc',
    sub: 'Focales fixes lumineuses, objectifs autofocus et lentilles cinéma professionnelles pour Sony E, Canon RF, Nikon Z, Lumix L et Fuji X.',
    metaTitle: 'Objectifs Photo & Cinéma au Maroc | 7Artisans, Sony, Canon, Nikon | GearShop',
    metaDesc: 'Achetez vos objectifs photo et cinéma au Maroc au meilleur prix. Large choix d\'optiques autofocus et manuelles garanties 1 an avec livraison rapide.',
    keywords: 'objectif photo maroc, objectif cinema maroc, lentille cinema casablanca, 7artisans maroc, lens camera maroc',
    description: 'Que vous soyez photographe portraitiste, vidéaste de mariage ou réalisateur de cinéma indépendant, découvrez notre sélection d\'objectifs haute résolution à grande ouverture (F1.2, F1.4, F1.8, T2.0) pour sublimer vos images.',
    buyingTips: [
      'Pour le portrait : privilégiez les focales 50mm, 85mm ou 135mm avec grande ouverture.',
      'Pour le paysage et le vlog : optez pour le grand-angle 10mm, 24mm ou 35mm.',
      'Pour la vidéo et le cinéma : choisissez une optique cinéma avec bague d\'ouverture continue et engrenages 0.8 MOD standard.'
    ]
  },
  'filtres': {
    title: 'Filtres Photographiques & Vidéo au Maroc',
    sub: 'Filtres ND variables, CPL polarisants, Black Mist diffusion et bagues adaptatrices K&F Concept.',
    metaTitle: 'Filtres Photo K&F Concept au Maroc | ND Variable, CPL, Black Mist | GearShop',
    metaDesc: 'Gamme officielle de filtres K&F Concept au Maroc. Filtres ND variables, filtres polarisants et filtres Black Mist pour un rendu cinéma. En stock à Casablanca.',
    keywords: 'filtre photo maroc, filtre nd variable maroc, filtre black mist casablanca, filtre cpl maroc, filtre kf concept',
    description: 'Les filtres optiques sont indispensables pour contrôler l\'exposition en plein soleil, éliminer les reflets indésirables ou créer une atmosphère cinématographique douce.',
    buyingTips: [
      'Filtre ND Variable : idéal pour respecter la règle des 180° en vidéo sous forte lumière.',
      'Filtre Black Mist : adoucit les hautes lumières et atténue la dureté numérique des capteurs modernes.',
      'Filtre CPL : sature les bleus du ciel et supprime les reflets sur l\'eau et le verre.'
    ]
  },
  'eclairage-studio': {
    title: 'Éclairage Studio Professionnel au Maroc',
    sub: 'Projecteurs LED COB, panneaux bicolores et diffuseurs pour studio photo et plateaux vidéo.',
    metaTitle: 'Éclairage Studio & Projecteurs LED au Maroc | GearShop Casablanca',
    metaDesc: 'Équipez votre studio photo et vidéo au Maroc avec nos projecteurs LED haute puissance, softboxes et éclairages continus. Prix directs et conseils pro.',
    keywords: 'eclairage studio maroc, projecteur led cob maroc, eclairage video casablanca, softbox maroc, lumiere studio',
    description: 'Un bon éclairage transforme radicalement la qualité de vos productions. Découvrez nos solutions d\'éclairage continu à haute fidélité chromatique (CRI 96+).',
    buyingTips: [
      'Choisissez une puissance adaptée : 60W-100W pour YouTube/Interviews, 200W-300W+ pour les grands plateaux.',
      'Utilisez des modeleurs (softbox, dôme) pour adoucir les ombres sur le visage.',
      'Vérifiez la température de couleur (Bi-Color 2700K-6500K) pour matcher la lumière ambiante.'
    ]
  },
  'eclairage-portable': {
    title: 'Éclairage Portable & Nomade au Maroc',
    sub: 'Torches LED sur batterie, mini-projecteurs de poche et barres RGB pour tournages extérieurs.',
    metaTitle: 'Éclairage Portable & Torches LED au Maroc | GearShop Casablanca',
    metaDesc: 'Achetez vos torches LED portables et lumières nomades au Maroc. Compactes, rechargeables et puissantes pour vos tournages nomades.',
    keywords: 'eclairage portable maroc, torche led video casablanca, lumiere rgb maroc, mini eclairage camera',
    description: 'Conçus pour les créateurs mobiles et les tournages run-and-gun, nos éclairages portables se glissent dans un sac à dos et fonctionnent sur batterie autonome.',
    buyingTips: [
      'Optez pour des modèles avec monture sabot flash (cold-shoe) pour fixation directe sur caméra.',
      'Les barres RGB permettent des effets créatifs d\'ambiance en arrière-plan.',
      'Vérifiez l\'autonomie sur batterie et la recharge rapide en USB-C.'
    ]
  },
  'accessoires': {
    title: 'Accessoires Photo & Cinéma au Maroc',
    sub: 'Bagues d\'adaptation, trépieds, batteries, cages et bagagerie professionnelle.',
    metaTitle: 'Accessoires Photo & Vidéo au Maroc | GearShop Casablanca',
    metaDesc: 'Large gamme d\'accessoires professionnels pour photographes et vidéastes au Maroc : bagues, supports, cages et connectiques.',
    keywords: 'accessoire photo maroc, bague adaptation maroc, cage camera casablanca, materiel photo casablanca',
    description: 'Complétez votre équipement avec des accessoires robustes conçus pour sécuriser votre matériel et fluidifier vos journées de tournage.',
    buyingTips: [
      'Vérifiez la compatibilité exacte de vos montures et filetages.',
      'Privilégiez les accessoires en aluminium aéronautique usiné CNC pour une durabilité maximale.'
    ]
  },
  'occasion': {
    title: 'Matériel Photo & Vidéo d\'Occasion Garanti au Maroc',
    sub: 'Appareils, objectifs et accessoires d\'occasion certifiés et testés par nos techniciens.',
    metaTitle: 'Matériel Photo & Vidéo d\'Occasion au Maroc | Garanti | GearShop Casablanca',
    metaDesc: 'Achetez du matériel photo et optiques d\'occasion certifiés au Maroc. Testés et garantis avec remise en main propre à Casablanca ou livraison.',
    keywords: 'materiel photo occasion maroc, objectif occasion casablanca, camera occasion maroc, occasion certifiee',
    description: 'Accédez au meilleur du matériel professionnel à prix réduit grâce à notre sélection d\'occasion scrupuleusement inspectée.',
    buyingTips: [
      'Tous nos produits d\'occasion sont testés sur banc optique avant mise en vente.',
      'Possibilité d\'inspection et d\'essai sur place à notre showroom de Casablanca.'
    ]
  }
};

const CategoryPage: React.FC<CategoryPageProps> = ({ products, onProductClick, siteConfig }) => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { addToCart } = useCart();
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const slug = (categorySlug || '').toLowerCase().trim();
  const catalogCat = getCategoryBySlug(products, slug);

  const editorial: CategoryEditorial = useMemo(() => {
    if (CATEGORY_EDITORIALS[slug]) return CATEGORY_EDITORIALS[slug];
    const catName = catalogCat ? catalogCat.nameFr : (categorySlug ? categorySlug.replace('-', ' ') : 'Catégorie');
    return {
      title: `${catName} au Maroc`,
      sub: `Découvrez notre sélection officielle de ${catName.toLowerCase()} chez GearShop Maroc.`,
      metaTitle: `${catName} au Maroc | GearShop Casablanca`,
      metaDesc: `Achetez ${catName.toLowerCase()} au Maroc au meilleur prix chez GearShop. Produits garantis 1 an et livraison rapide à Casablanca et partout au Maroc.`,
      keywords: `${catName.toLowerCase()} maroc, ${catName.toLowerCase()} casablanca, gearshop maroc`,
      description: `Sélection professionnelle de ${catName.toLowerCase()} sélectionnée pour sa qualité optique et sa robustesse.`,
      buyingTips: [
        'Produits testés et certifiés originaux.',
        'Livraison rapide et sécurisée dans toutes les villes du Maroc.'
      ]
    };
  }, [slug, catalogCat, categorySlug]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212').replace(/\s+/g, '');
    const msg = `Bonjour, je souhaite réserver le produit : ${productName} (Catégorie : ${editorial.title})`;
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

  // Filter products by category
  const categoryProducts = useMemo(() => {
    return products.filter(p => {
      const attrs = extractProductAttributes(p);
      if (catalogCat && catalogCat.productIds.includes(p.id)) return true;
      const cat = (p.category || '').toLowerCase();
      if (slug === 'objectifs' && (cat.includes('lenses') || cat.includes('objectif') || attrs.product_type === 'lens')) return true;
      if (slug === 'filtres' && (cat.includes('filter') || cat.includes('filtre') || attrs.product_type === 'filter')) return true;
      if (slug === 'eclairage-studio' && (cat.includes('studio') || (attrs.product_type === 'light' && Number(p.price) >= 1500))) return true;
      if (slug === 'eclairage-portable' && (cat.includes('portable') || (attrs.product_type === 'light' && Number(p.price) < 1500))) return true;
      if (slug === 'occasion' && (cat.includes('occasion') || attrs.condition === 'used')) return true;
      if (slug === 'accessoires' && (cat.includes('access') || attrs.product_type === 'accessory' || attrs.product_type === 'adapter')) return true;
      return slugify(cat) === slug;
    });
  }, [products, catalogCat, slug]);

  // Extract available brands for filter chips
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    categoryProducts.forEach(p => {
      const attrs = extractProductAttributes(p);
      if (attrs.brand) brands.add(attrs.brand);
    });
    return Array.from(brands).sort();
  }, [categoryProducts]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = categoryProducts.filter(p => {
      if (selectedBrand === 'all') return true;
      const attrs = extractProductAttributes(p);
      return attrs.brand === selectedBrand;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [categoryProducts, selectedBrand, sortBy]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": editorial.title,
    "description": editorial.metaDesc,
    "url": `https://gearshop.ma/categorie/${slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": categoryProducts.length,
      "itemListElement": categoryProducts.slice(0, 12).map((p, idx) => ({
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
        <title>{editorial.metaTitle}</title>
        <meta name="description" content={editorial.metaDesc} />
        <meta name="keywords" content={editorial.keywords} />
        <link rel="canonical" href={`https://gearshop.ma/categorie/${slug}`} />
        <meta property="og:title" content={editorial.metaTitle} />
        <meta property="og:description" content={editorial.metaDesc} />
        <meta property="og:url" content={`https://gearshop.ma/categorie/${slug}`} />
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
          <span className="text-gray-400">Catégories</span>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-900 dark:text-white font-semibold">{editorial.title}</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/40 text-[#b91c1c] dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full mb-3">
            CATALOGUE OFFICIEL GEARSHOP
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {editorial.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {editorial.sub}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-500 mr-1 uppercase">Marque :</span>
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedBrand === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
              }`}
            >
              Toutes ({categoryProducts.length})
            </button>
            {availableBrands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedBrand === b
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                }`}
              >
                {b}
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
            {filteredProducts.length} {filteredProducts.length > 1 ? 'produits disponibles' : 'produit disponible'}
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
            <i className="fa-solid fa-box-open text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun produit dans cette sélection</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              Contactez nos conseillers techniques pour une demande spéciale ou une commande sur-mesure.
            </p>
            <a
              href={`https://wa.me/${siteConfig.phone.replace('+', '')}?text=${encodeURIComponent(`Bonjour, je cherche un produit dans la catégorie ${editorial.title}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <i className="fa-brands fa-whatsapp text-lg" />
              Demander sur WhatsApp
            </a>
          </div>
        )}

        {/* Buying Guide Editorial Block */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100/70 dark:from-gray-800 dark:to-gray-850 rounded-3xl p-8 md:p-10 border border-gray-200/80 dark:border-gray-700">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b91c1c] dark:text-red-400 mb-2 block">
              CONSEILS D'EXPERTS GEARSHOP MAROC
            </span>
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">
              Bien choisir votre équipement : {editorial.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              {editorial.description}
            </p>

            <div className="space-y-3 mb-8">
              {editorial.buyingTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-check-circle text-red-600 mt-1" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-truck-fast text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Livraison 24h Casa &amp; 48h Maroc</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-shield-check text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Garantie 1 An &amp; SAV Local</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-store text-[#b91c1c] text-lg" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Boutique &amp; Retrait Casablanca</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
