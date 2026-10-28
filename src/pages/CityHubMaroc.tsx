import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { moroccanCities, getCityBySlug } from '../data/moroccanCities';
import { Product } from '../../App';

const BASE_URL = 'https://www.gearshop.ma';

const regionalBuyerContext: Record<string, { audience: string; useCases: string; englishIntent: string }> = {
  'Casablanca-Settat': {
    audience: 'studios, agences, photographes professionnels et créateurs de contenu',
    useCases: 'production commerciale, interviews, photographie produit et tournages en studio',
    englishIntent: 'camera gear, cinema lenses and DJI equipment with fast local delivery',
  },
  'Rabat-Salé-Kénitra': {
    audience: 'vidéastes institutionnels, journalistes, studios et créateurs indépendants',
    useCases: 'documentaire, interview, événementiel et production institutionnelle',
    englishIntent: 'professional photo and video equipment delivered to Rabat and the surrounding region',
  },
  'Marrakech-Safi': {
    audience: 'photographes de mariage, hôtels, agences touristiques et producteurs événementiels',
    useCases: 'mariage, hôtellerie, voyage, immobilier et événementiel',
    englishIntent: 'photo, wedding and travel filmmaking equipment delivered in Marrakech',
  },
  'Tanger-Tétouan-Al Hoceïma': {
    audience: 'créateurs, sociétés de production, agences et photographes du nord du Maroc',
    useCases: 'contenu commercial, automobile, immobilier, voyage et production côtière',
    englishIntent: 'camera equipment and cinema lenses delivered across northern Morocco',
  },
  'Fès-Meknès': {
    audience: 'photographes, étudiants, studios et créateurs culturels',
    useCases: 'portrait, patrimoine, documentaire, éducation et contenu social',
    englishIntent: 'affordable camera lenses and creator equipment delivered to Fes and Meknes',
  },
  'Souss-Massa': {
    audience: 'créateurs outdoor, hôtels, surf camps, agences touristiques et photographes',
    useCases: 'voyage, sport, hôtellerie, immobilier et production en extérieur',
    englishIntent: 'outdoor, travel and creator camera gear delivered to Agadir',
  },
  "L'Oriental": {
    audience: 'photographes, vidéastes et créateurs de l’Oriental',
    useCases: 'portrait, événementiel, commerce local, voyage et création numérique',
    englishIntent: 'camera gear and DJI products delivered to Oujda and eastern Morocco',
  },
  'Drâa-Tafilalet': {
    audience: 'productions cinéma, guides, créateurs de voyage et photographes de paysage',
    useCases: 'cinéma, documentaire, désert, voyage et photographie de paysage',
    englishIntent: 'cinema, documentary and travel camera equipment delivered in southeast Morocco',
  },
};

interface CityHubMarocProps {
  products?: Product[];
  onProductClick?: (id: number) => void;
  siteConfig?: any;
}

export const CityHubMaroc: React.FC<CityHubMarocProps> = ({
  products = [],
  onProductClick,
  siteConfig
}) => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const city = getCityBySlug(citySlug || 'casablanca') || moroccanCities[0];

  const buyerContext = regionalBuyerContext[city.region] || {
    audience: 'photographes, vidéastes, studios et créateurs de contenu',
    useCases: 'photo, vidéo, événementiel, création numérique et production professionnelle',
    englishIntent: `professional camera and video equipment delivered to ${city.name}`,
  };

  const featuredLenses = products
    .filter(p => p.id && (p.category === 'lenses' || p.category === 'cinelenses' || (p.name || '').toLowerCase().includes('af') || (p.name || '').toLowerCase().includes('mm')))
    .slice(0, 4);

  const featuredFilters = products
    .filter(p => (p.category || '').toLowerCase().includes('filtre') || (p.name || '').toLowerCase().includes('filter') || (p.name || '').toLowerCase().includes('nd'))
    .slice(0, 4);

  const osmoPocket4 = products.find(product => {
    const name = (product.name || '').toLowerCase();
    return name.includes('osmo pocket 4') || name.includes('pocket 4 pro');
  });

  const formatPrice = (product?: Product) =>
    product?.price && Number(product.price) > 0
      ? `${Number(product.price).toLocaleString('fr-MA')} DH`
      : 'Prix à confirmer';

  const catalogProducts = [...featuredLenses, ...featuredFilters]
    .filter((product, index, list) => list.findIndex(item => item.id === product.id) === index)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/livraison-maroc/${city.slug}#webpage`,
        "url": `${BASE_URL}/livraison-maroc/${city.slug}`,
        "name": `Matériel photo et vidéo à ${city.name} | GearShop Maroc`,
        "inLanguage": ["fr-MA", "en"],
        "about": { "@id": `${BASE_URL}/#business` },
        "breadcrumb": { "@id": `${BASE_URL}/livraison-maroc/${city.slug}#breadcrumb` },
      },
      {
        "@type": "Service",
        "@id": `${BASE_URL}/livraison-maroc/${city.slug}#delivery-service`,
        "name": `Livraison de matériel photo et vidéo à ${city.name}`,
        "serviceType": "Livraison de matériel photo, vidéo et cinéma",
        "provider": { "@id": `${BASE_URL}/#business` },
        "areaServed": {
          "@type": "City",
          "name": city.name,
          "alternateName": city.nameAr,
          "containedInPlace": { "@type": "AdministrativeArea", "name": city.region },
        },
        "description": `${city.highlightText} Délai indicatif : ${city.deliveryTime}.`,
      },
      {
        "@type": "OfferCatalog",
        "@id": `${BASE_URL}/livraison-maroc/${city.slug}#catalog`,
        "name": `Produits disponibles avec livraison à ${city.name}`,
        "itemListElement": catalogProducts.map(product => ({
          "@type": "Offer",
          "url": `${BASE_URL}/product/${product.id}`,
          "priceCurrency": "MAD",
          ...(product.price && Number(product.price) > 0 ? { "price": Number(product.price) } : {}),
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": { "@id": `${BASE_URL}/#business` },
          "itemOffered": { "@type": "Product", "name": product.name },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE_URL}/livraison-maroc/${city.slug}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Livraison au Maroc", "item": `${BASE_URL}/livraison-maroc` },
          { "@type": "ListItem", "position": 3, "name": city.name, "item": `${BASE_URL}/livraison-maroc/${city.slug}` },
        ],
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Quels sont les délais de livraison pour le matériel photo et vidéo à ${city.name} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Pour ${city.name} (${city.region}), la livraison est effectuée en ${city.deliveryTime}. Chaque colis est scellé, assuré et suivi avec confirmation par SMS/WhatsApp avant l'arrivée du livreur.`
        }
      },
      {
        "@type": "Question",
        "name": `Puis-je commander la caméra DJI Osmo Pocket 4 Pro avec livraison à ${city.name} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Oui, GearShop Maroc livre la caméra DJI Osmo Pocket 4 Pro ainsi que toute la gamme DJI (stabilisateurs, micros, accessoires) directement à votre adresse à ${city.name} avec garantie officielle de 1 an.`
        }
      },
      {
        "@type": "Question",
        "name": `Le paiement à la livraison (Cash on Delivery) est-il disponible à ${city.name} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Absolument. Vous pouvez régler votre commande en espèces (en Dirhams MAD) directement au livreur lors de la réception de votre colis à ${city.name}.`
        }
      },
      {
        "@type": "Question",
        "name": `Tous les produits expédiés à ${city.name} sont-ils authentiques et garantis ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Oui, tous nos objectifs 7Artisans, filtres K&F Concept, boîtiers et accessoires DJI sont 100% originaux, neufs sous blister, avec une garantie constructeur de 1 an et un support technique joignable 6j/7.`
        }
      }
    ]
  };

  const faqs = [
    {
      q: `Quels sont les délais de livraison de matériel photo à ${city.name} ?`,
      a: `À ${city.name}, nous livrons vos objectifs, filtres et caméras en ${city.deliveryTime}. Votre colis est soigneusement emballé avec protection antichoc pour le matériel optique sensible.`
    },
    {
      q: `Comment précommander le DJI Osmo Pocket 4 Pro à ${city.name} ?`,
      a: `Vous pouvez vérifier le prix catalogue actuel et précommander le DJI Osmo Pocket 4 Pro via notre page dédiée ou directement sur WhatsApp (+212 673 011 873). La disponibilité et le délai vers ${city.name} sont confirmés avant la commande.`
    },
    {
      q: `Quels sont les modes de paiement acceptés pour ${city.name} ?`,
      a: `Nous acceptons le paiement à la livraison en espèces (Cash on Delivery partout à ${city.name} et sa région), ainsi que le virement bancaire instantané ou paiement par carte.`
    },
    {
      q: `Proposez-vous des conseils pour choisir une monture d'objectif ?`,
      a: `Oui ! Notre équipe technique vous guide gratuitement sur WhatsApp pour vérifier la compatibilité avec votre boîtier (Sony E-Mount, Canon RF, Nikon Z, Lumix L-Mount ou Fujifilm X).`
    }
  ];

  return (
    <div className="pt-24 pb-20 bg-slate-950 text-white min-h-screen">
      <Helmet>
        <title>{`Matériel Photo & DJI à ${city.name} | Livraison GearShop`}</title>
        <meta
          name="description"
          content={`Achetez votre matériel photo, vidéo, caméras DJI Osmo Pocket 4 Pro et objectifs 7Artisans à ${city.name} (${city.region}). Livraison ${city.deliveryTime}, garantie 1 an, paiement à la livraison.`}
        />
        <meta
          name="keywords"
          content={`materiel photo ${city.name.toLowerCase()}, dji ${city.name.toLowerCase()}, dji osmo pocket ${city.name.toLowerCase()}, objectif photo ${city.name.toLowerCase()}, 7artisans ${city.name.toLowerCase()}, k&f concept ${city.name.toLowerCase()}, camera ${city.name.toLowerCase()}, materiel video ${city.name.toLowerCase()}, livraison photo maroc`}
        />
        <link rel="canonical" href={`${BASE_URL}/livraison-maroc/${city.slug}`} />
        <meta property="og:title" content={`Matériel Photo & Vidéo à ${city.name} - GearShop Maroc`} />
        <meta property="og:description" content={`Distributeur officiel 7Artisans, K&F Concept et DJI au Maroc. Livraison rapide et sécurisée à ${city.name}.`} />
        <meta property="og:url" content={`${BASE_URL}/livraison-maroc/${city.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${BASE_URL}/banner_7artisans.jpg`} />
        <meta property="og:locale" content="fr_MA" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950/80 to-slate-950 pointer-events-none -z-10" />

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition">Accueil</Link>
          <span>/</span>
          <Link to="/camera-maroc" className="hover:text-white transition">Maroc</Link>
          <span>/</span>
          <span className="text-red-400 font-semibold">{city.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600/10 text-red-400 border border-red-600/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Livraison Express : {city.deliveryTime}</span>
              <span className="text-slate-500">|</span>
              <span>{city.nameAr}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Matériel Photo &amp; Vidéo Professionnel à <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">{city.name}</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
              {city.highlightText} Découvrez la plus large gamme d'objectifs cinéma &amp; photo <strong className="text-white">7Artisans</strong>, filtres optiques <strong className="text-white">K&amp;F Concept</strong>, caméras <strong className="text-white">DJI Osmo Pocket</strong> et projecteurs LED de studio avec garantie 1 an et SAV local.
            </p>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <i className="fa-solid fa-truck-fast text-red-500 text-lg mb-1 block" />
                <span className="text-xs font-bold text-white block">{city.deliveryTime}</span>
                <span className="text-[10px] text-slate-400">À {city.name}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <i className="fa-solid fa-money-bill-wave text-emerald-400 text-lg mb-1 block" />
                <span className="text-xs font-bold text-white block">Paiement à la livraison</span>
                <span className="text-[10px] text-slate-400">Cash en Dirhams</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <i className="fa-solid fa-shield-halved text-blue-400 text-lg mb-1 block" />
                <span className="text-xs font-bold text-white block">Garantie 1 An</span>
                <span className="text-[10px] text-slate-400">100% Original Neuf</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <i className="fa-solid fa-headset text-purple-400 text-lg mb-1 block" />
                <span className="text-xs font-bold text-white block">Support Direct</span>
                <span className="text-[10px] text-slate-400">WhatsApp 6j/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href={`https://wa.me/212673011873?text=Bonjour,%20je%20souhaite%20commander%20du%20matériel%20photo/vidéo%20avec%20livraison%20à%20${encodeURIComponent(city.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition flex items-center gap-2 text-sm"
              >
                <i className="fa-brands fa-whatsapp text-lg" />
                Commander pour {city.name} sur WhatsApp
              </a>

              <Link
                to="/dji-osmo-pocket-4-pro"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-xl transition flex items-center gap-2 text-sm"
              >
                <span>🔥</span> DJI Osmo Pocket 4 Pro ({formatPrice(osmoPocket4)})
              </Link>
            </div>
          </div>

          {/* Hero Right Card: Local Delivery Info */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Zone de Distribution</span>
              <h3 className="text-2xl font-bold text-white mt-1">{city.name} ({city.region})</h3>
              <p className="text-xs text-slate-400 mt-1">Code postal de référence : {city.postalCode || 'Maroc'}</p>
            </div>

            {city.districts && city.districts.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quartiers &amp; Zones Couvertes :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {city.districts.map(district => (
                    <span
                      key={district}
                      className="px-2.5 py-1 bg-slate-800/80 text-slate-300 text-xs rounded-md border border-slate-700/50"
                    >
                      {district}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-white font-semibold">
                <i className="fa-solid fa-box-check text-emerald-400" />
                <span>Expédition Sécurisée &amp; Assurée</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Toutes nos expéditions vers {city.name} sont conditionnées sous triple emballage de protection avec assurance transport incluse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED HERO PRODUCT: DJI OSMO POCKET 4 PRO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/40 via-slate-900 to-black border border-red-500/20 p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30">
                Nouveauté Phare · Disponible en Livraison à {city.name}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                DJI Osmo Pocket 4 Pro au Maroc
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                La caméra compacte 4K à double objectif et capteur 1 pouce CMOS LOFIC (17 stops de dynamique, D-Log 2 10-bit). Vérifiez sa disponibilité chez GearShop, revendeur spécialisé au Maroc, avec livraison à {city.name}.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Prix catalogue actuel</span>
                  <span className="text-3xl font-black text-white">{formatPrice(osmoPocket4)}</span>
                </div>
                <Link
                  to="/dji-osmo-pocket-4-pro"
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition text-sm flex items-center gap-2"
                >
                  Voir la Fiche Complète &amp; Précommander <i className="fa-solid fa-arrow-right text-xs" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <img
                src="https://www.gearshop.ma/images/products/dji-osmo-pocket-4-pro.webp"
                alt={`DJI Osmo Pocket 4 Pro disponible à ${city.name}`}
                className="max-h-64 object-contain filter drop-shadow-[0_20px_30px_rgba(239,68,68,0.25)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS DELIVERED TO THIS CITY */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Objectifs &amp; Lentilles Cinéma Recommandés pour {city.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Compatibles Sony E, Canon RF, Nikon Z, Lumix L-Mount et Fujifilm X
            </p>
          </div>
          <Link to="/categorie/objectifs" className="text-xs font-bold text-red-400 hover:text-red-300 transition">
            Voir tout le catalogue &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredLenses.map(product => (
            <div
              key={product.id}
              onClick={() => onProductClick?.(product.id)}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950/80 mb-3 flex items-center justify-center p-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {product.category || 'Objectif'}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-red-400 transition">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-sm font-black text-white">
                    {product.price ? `${product.price.toLocaleString()} DH` : 'Sur demande'}
                  </span>
                  <span className={`text-[10px] font-semibold ${product.inStock ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {product.inStock ? 'En stock' : 'Disponibilité à confirmer'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOCAL SEARCH INTENT — French-first with concise English coverage */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto my-16">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">Guide local GearShop</span>
          <h2 className="text-2xl font-black text-white mt-2">
            Quel matériel choisir pour une production à {city.name} ?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mt-4">
            À {city.name}, GearShop accompagne les {buyerContext.audience}. Pour les besoins de {buyerContext.useCases}, vérifiez la monture de votre caméra, le format du capteur, les conditions de lumière et le type de stabilisation avant de choisir un objectif, un filtre ou une caméra. Les prix affichés sur cette page proviennent du catalogue GearShop actuel ; lorsqu’un tarif ou un stock n’est pas confirmé, la page l’indique clairement.
          </p>
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-base font-bold text-white">
              Where can I buy professional camera gear in {city.name}, Morocco?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mt-2" lang="en">
              GearShop supplies {buyerContext.englishIntent}. Check the live catalog price and availability before ordering. Delivery is normally estimated at {city.deliveryTime}, with support available in French and English.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LOCAL FAQ SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto my-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">FAQ &amp; Réponses</span>
          <h2 className="text-3xl font-black text-white mt-1">
            Questions Fréquentes sur la Livraison à {city.name}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-white text-sm sm:text-base hover:text-red-400 transition"
              >
                <span>{faq.q}</span>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-red-500' : 'text-slate-400'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. ALL MOROCCAN CITIES INTERNAL LINKING MATRIX */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16 pt-12 border-t border-slate-900">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white">
            Toutes les Villes &amp; Régions Desservies au Maroc
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            GearShop livre l'intégralité du Royaume du Maroc en 24h à 48h express avec paiement à la livraison
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {moroccanCities.map(c => (
            <Link
              key={c.slug}
              to={`/livraison-maroc/${c.slug}`}
              className={`p-3 rounded-xl border text-xs transition flex flex-col justify-between ${
                c.slug === city.slug
                  ? 'bg-red-600/10 border-red-500/50 text-white font-bold'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="font-bold">{c.name} ({c.nameAr})</span>
              <span className="text-[10px] text-slate-400 mt-1">{c.deliveryTime}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CityHubMaroc;
