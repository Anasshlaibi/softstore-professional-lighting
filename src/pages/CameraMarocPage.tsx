import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';

interface CameraMarocPageProps {
  products: Product[];
  openProductModal: (id: number) => void;
  siteConfig: { currency: string; phone: string; brandName: string };
}

type CameraTypeFilter = 'all' | 'vlog' | 'cinema' | 'lenses' | 'lighting' | 'used';

const CameraMarocPage: React.FC<CameraMarocPageProps> = ({
  products,
  openProductModal,
  siteConfig,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<CameraTypeFilter>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedFilter === 'vlog') {
      list = list.filter(p => {
        const text = `${p.name} ${p.category} ${p.desc}`.toLowerCase();
        return text.includes('dji') || text.includes('pocket') || text.includes('osmo') || text.includes('vlog') || text.includes('action');
      });
    } else if (selectedFilter === 'cinema') {
      list = list.filter(p => {
        const text = `${p.name} ${p.category} ${p.desc}`.toLowerCase();
        return text.includes('t2.0') || text.includes('t2.1') || text.includes('cine') || text.includes('cinema') || text.includes('pl-');
      });
    } else if (selectedFilter === 'lenses') {
      list = list.filter(p => (p.category || '').toLowerCase().includes('objectifs') || (p.category || '').toLowerCase().includes('lenses') || /\b\d+mm\b/i.test(p.name));
    } else if (selectedFilter === 'lighting') {
      list = list.filter(p => (p.category || '').toLowerCase().includes('light') || (p.category || '').toLowerCase().includes('eclairage') || (p.category || '').toLowerCase().includes('led'));
    } else if (selectedFilter === 'used') {
      list = list.filter(p => (p.category || '').toLowerCase().includes('occasion') || (p.name || '').toLowerCase().includes('occasion'));
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [products, selectedFilter, sortBy]);

  const pageTitle = "Caméra Maroc | Achat Caméra Photo, Vidéo & Vlogging à Casablanca | GearShop";
  const metaDesc = "Achetez votre caméra au Maroc chez GearShop. Caméras 4K nomades DJI, caméras cinéma, objectifs pour boîtiers Sony, Canon, Nikon, Lumix, Fuji et accessoires. Garantie 1 an et livraison 24h à Casablanca et partout au Maroc.";
  const canonicalUrl = "https://gearshop.ma/camera-maroc";

  // JSON-LD Schemas
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Caméras et Matériel Audiovisuel au Maroc",
    "url": canonicalUrl,
    "description": metaDesc,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredProducts.slice(0, 12).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": p.name,
        "url": `https://gearshop.ma/product/${p.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      }))
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Où acheter une caméra de qualité au Maroc avec garantie ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GearShop Maroc est la boutique spécialisée pour l'achat de caméras, caméras compactes de vlogging DJI, objectifs de caméras et équipements vidéo à Casablanca avec livraison dans toutes les villes marocaines et garantie officielle de 1 an."
        }
      },
      {
        "@type": "Question",
        "name": "Quel est le prix moyen d'une caméra ou d'un équipement vidéo au Maroc ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Les prix débutent à partir de 1 500 DH pour des éclairages et accessoires, de 3 000 à 7 000 DH pour les objectifs professionnels et caméras nomades 4K (comme la gamme DJI Osmo Pocket), et au-delà pour les configurations cinéma complètes."
        }
      },
      {
        "@type": "Question",
        "name": "Puis-je tester la caméra ou les optiques dans votre showroom à Casablanca ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, GearShop dispose d'un showroom à Casablanca où vous pouvez tester le matériel avec votre propre boîtier et bénéficier des conseils de nos techniciens avant de commander."
        }
      },
      {
        "@type": "Question",
        "name": "Quelles caméras recommandez-vous pour le vlogging et YouTube au Maroc ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pour le vlogging nomade, nous recommandons la gamme DJI Osmo Pocket (stabilisation 3 axes, capteur 1 pouce, 4K 120fps). Pour les créateurs en studio, les boîtiers hybrides Sony Alpha ou Panasonic Lumix équipés d'objectifs autofocus lumineux 7Artisans F1.8 et de filtres ND variables K&F Concept sont idéaux."
        }
      }
    ]
  };

  const filterChips: { id: CameraTypeFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'Tout le Matériel Caméra', icon: 'fa-solid fa-camera' },
    { id: 'vlog', label: 'Caméras Vlogging & 4K', icon: 'fa-solid fa-video' },
    { id: 'cinema', label: 'Caméras & Cinéma Pro', icon: 'fa-solid fa-film' },
    { id: 'lenses', label: 'Objectifs pour Caméras', icon: 'fa-solid fa-bullseye' },
    { id: 'lighting', label: 'Éclairage & Studio', icon: 'fa-solid fa-lightbulb' },
    { id: 'used', label: 'Occasion Garantie', icon: 'fa-solid fa-recycle' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-red-600 font-medium">Accueil</Link>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-300"></i>
          <span className="text-gray-900 font-bold">Caméra Maroc</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <i className="fa-solid fa-camera"></i> Spécialiste Caméra &amp; Vidéo au Maroc
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Caméra au Maroc : Appareils Photo, Vlogging &amp; Cinéma
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Trouvez la caméra et l'équipement audiovisuel idéal pour vos projets au Maroc. De la caméra nomade 4K pour créateurs de contenu aux configurations de tournage professionnelles, découvrez un matériel garanti 1 an avec livraison rapide à Casablanca, Rabat, Marrakech et partout au Maroc.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-300">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <i className="fa-solid fa-truck-fast text-red-400"></i> Expédition 24h au Maroc
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <i className="fa-solid fa-shield-halved text-red-400"></i> Garantie 1 an officielle
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <i className="fa-solid fa-store text-red-400"></i> Showroom &amp; Tests à Casablanca
            </span>
          </div>
        </div>
      </header>

      {/* Filter and Sort Toolbar */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {filterChips.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedFilter(chip.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    selectedFilter === chip.id
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className={chip.icon}></i>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown & Count */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <span className="text-xs text-gray-500 font-medium">
                <strong className="text-black font-bold">{filteredProducts.length}</strong> produits trouvés
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="featured">Tri : Recommandés</option>
                <option value="price-asc">Prix : Croissant</option>
                <option value="price-desc">Prix : Décroissant</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                openProductModal={openProductModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <i className="fa-solid fa-camera text-4xl text-gray-300 mb-3"></i>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun produit dans cette sélection</h3>
            <p className="text-xs text-gray-500 mb-4">Essayez un autre filtre ou contactez nos conseillers techniques.</p>
            <button
              onClick={() => setSelectedFilter('all')}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
            >
              Afficher tout le matériel
            </button>
          </div>
        )}

        {/* Camera Buyer's Guide Article */}
        <article className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 block mb-1">
              GUIDE EXPERT GEARSHOP MAROC
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Comment Bien Choisir Sa Caméra au Maroc en 2026 ?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Que vous cherchiez votre première caméra pour YouTube, un boîtier hybride pour vos mariages et reportages au Maroc, ou une configuration cinéma complète, voici les critères essentiels pour faire le bon investissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Création de Contenu &amp; Vlogging</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Optez pour des caméras ultra-portables avec stabilisation sur 3 axes, comme la gamme <strong>DJI Osmo Pocket</strong>, offrant un capteur haute performance et un enregistrement 4K 60/120fps direct.
              </p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Photo &amp; Vidéo Polyvalente (Hybrides)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Les boîtiers hybrides plein format (Sony Alpha, Canon EOS R, Nikon Z, Panasonic Lumix S) associés à des <strong>objectifs autofocus 7Artisans F1.8</strong> offrent le meilleur ratio piqué/prix au Maroc.
              </p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Production Cinéma &amp; Vidéo Pro</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pour un rendu cinéma organique, équipez votre caméra d'<strong>optiques cinéma T2.0</strong> et de <strong>filtres ND variables K&amp;F Concept</strong> pour maîtriser la profondeur de champ sous le soleil marocain.
              </p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-circle-question text-red-600"></i> Foire Aux Questions : Achat Caméra au Maroc
            </h3>

            <div className="space-y-3">
              {faqSchema.mainEntity.map((item, idx) => (
                <details
                  key={idx}
                  className="group bg-gray-50/80 rounded-xl border border-gray-200 overflow-hidden transition open:bg-white open:border-red-400"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-bold text-xs sm:text-sm text-gray-900 group-open:text-red-600">
                    <span>{item.name}</span>
                    <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {item.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default CameraMarocPage;
