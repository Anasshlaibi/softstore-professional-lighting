import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { getUseCases, getUseCaseBySlug, slugify } from '../utils/catalogEngine';
import { extractProductAttributes } from '../utils/productMetadata';

interface UseCaseGuideProps {
  products: Product[];
  onProductClick: (id: number) => void;
  siteConfig: { currency: string; phone: string };
}

interface GuideContent {
  title: string;
  badge: string;
  sub: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  intro: string;
  essentialGear: string[];
  proTips: string[];
}

const GUIDE_CONTENTS: Record<string, GuideContent> = {
  'filmmakers': {
    title: 'Guide d\'Équipement pour Cinéastes & Réalisateurs au Maroc',
    badge: 'CINÉMATOGRAPHIE & PRODUCTION NARRATIVE',
    sub: 'Sélection d\'objectifs cinéma plein format T2.0, optiques anamorphiques, projecteurs puissants et accessoires de tournage professionnel.',
    metaTitle: 'Guide Matériel Cinéma au Maroc | Lentilles Ciné T2.0 & Studio | GearShop',
    metaDesc: 'Découvrez le guide complet du matériel de tournage cinéma au Maroc. Objectifs cinéma 7Artisans Vision/Spectrum, filtres Black Mist et éclairage LED.',
    keywords: 'materiel cinema maroc, objectif cinema casablanca, lentille cine t2 maroc, equipement tournage maroc, camera cinema maroc',
    intro: 'La production d\'un film ou d\'un court-métrage exige des optiques avec un contrôle d\'ouverture fluide (sans clics), un faible breathing optique et un rendu colorimétrique chaud et organique.',
    essentialGear: [
      'Série d\'objectifs cinéma T2.0 (25mm, 35mm, 50mm, 85mm) avec mise au point geared 0.8 MOD standard.',
      'Filtre Black Mist 1/4 pour adoucir le piqué numérique et diffuser les hautes lumières.',
      'Filtre ND Variable haute fidélité pour maintenir l\'ouverture à T2.0 en plein jour.',
      'Éclairage continu COB 200W-300W avec boîte à lumière parabolique pour la lumière principale.'
    ],
    proTips: [
      'Harmonisez votre série d\'objectifs pour conserver la même colorimétrie et le même diamètre de filtre (82mm) sur tout le tournage.',
      'Utilisez le Follow Focus pour des bascules de point précises et répétables.',
      'Conservez une vitesse d\'obturation au 1/50s en tournant en 24/25 fps pour un flou de mouvement naturel.'
    ]
  },
  'videographers': {
    title: 'Guide d\'Équipement pour Vidéastes & Cadreurs au Maroc',
    badge: 'PRODUCTION VIDÉO PROFESSIONNELLE',
    sub: 'Matériel polyvalent pour tournages corporate, documentaires, publicités et vidéos promotionnelles.',
    metaTitle: 'Guide Matériel Vidéo au Maroc | Objectifs AF & Éclairage | GearShop Casa',
    metaDesc: 'Guide d\'achat pour vidéastes au Maroc : optiques autofocus ultra-rapides, éclairages continus bicolores et filtres vidéo. Stock Casablanca.',
    keywords: 'materiel videaste maroc, camera video casablanca, objectif video maroc, eclairage video maroc',
    intro: 'Pour les tournages run-and-gun et les prestations vidéo professionnelles, la rapidité d\'autofocus, la stabilisation et la polyvalence de l\'éclairage sont capitales.',
    essentialGear: [
      'Objectifs autofocus lumineux F1.8 (24mm, 35mm, 50mm) avec suivi visage/yeux instantané.',
      'Filtre ND variable ND2-ND32 pour adapter l\'exposition en continu sans toucher au shutter.',
      'Torche LED nomade sur batterie avec fixation sur griffe flash.',
      'Microphone sans fil double canal pour captation sonore sans fil.'
    ],
    proTips: [
      'Privilégiez les focales fixes autofocus lumineuses pour filmer en basse lumière sans monter les ISO.',
      'Ayez toujours un filtre ND variable vissé sur votre objectif principal pour les transitions extérieur/intérieur.',
      'Prévoyez des batteries de secours et des cartes mémoire haute vitesse V60/V90.'
    ]
  },
  'content-creators': {
    title: 'Guide d\'Équipement pour Créateurs de Contenu & Vlogs au Maroc',
    badge: 'YOUTUBE, TIKTOK, INSTAGRAM & VLOGGING',
    sub: 'Caméras compactes stabilisées, grand-angles légers, éclairages ring-light et micros sans fil pour créateurs modernes.',
    metaTitle: 'Guide Créateurs de Contenu & Vlogs au Maroc | DJI, Lenses, Éclairage | GearShop',
    metaDesc: 'Le meilleur matériel pour créateurs de contenu au Maroc : DJI Osmo Pocket 4 Pro, grand-angles 10mm autofocus, mini-LED et accessoires.',
    keywords: 'materiel vlog maroc, dji pocket 4 maroc, camera youtube maroc, mini eclairage createur maroc',
    intro: 'Pour produire du contenu dynamique et engageant sur les réseaux sociaux, votre setup doit être léger, rapide à mettre en route et offrir une qualité 4K impeccable.',
    essentialGear: [
      'Caméra stabilisée 3 axes type DJI Osmo Pocket pour vlogs et plans en mouvement.',
      'Objectif ultra grand-angle autofocus (ex: 10mm F2.5) pour cadrer visage et arrière-plan à bout de bras.',
      'Mini projecteur LED RGB de poche avec fixation magnétique.',
      'Micro cravate sans fil compact avec réduction de bruit active.'
    ],
    proTips: [
      'Un bon éclairage frontal doux (lumière diffuse) améliore instantanément le teint et la qualité perçue de vos vidéos.',
      'Placez votre micro au plus près de la source vocale (à 15-20cm du menton) pour une clarté optimale.',
      'Travaillez vos miniatures avec un objectif à grande ouverture pour un beau flou d\'arrière-plan (bokeh).'
    ]
  },
  'photographers': {
    title: 'Guide d\'Équipement pour Photographes Professionnels au Maroc',
    badge: 'PHOTOGRAPHIE DE PORTRAIT, MODE & STUDIO',
    sub: 'Focales fixes ultra-lumineuses, verres optiques haute résolution et éclairages flash/continu de studio.',
    metaTitle: 'Guide Matériel Photographie au Maroc | Focales Fixes & Studio | GearShop',
    metaDesc: 'Guide d\'achat pour photographes au Maroc : objectifs portrait 50mm/85mm/135mm F1.8, éclairage studio et filtres polarisants. Casablanca.',
    keywords: 'materiel photographe maroc, objectif portrait maroc, objectif 85mm casablanca, eclairage studio photo maroc',
    intro: 'La photographie professionnelle requiert un piqué chirurgical, une fidélité chromatique parfaite et un modelé d\'arrière-plan crémeux.',
    essentialGear: [
      'Objectif 50mm ou 85mm F1.8 pour détacher le sujet avec un bokeh doux.',
      'Téléobjectif 135mm F1.8 pour les portraits serrés et la mode en extérieur.',
      'Filtre polarisant CPL pour éliminer les reflets et saturer les couleurs naturelles.',
      'Projecteur studio avec boîte à lumière octogonale pour un éclairage doux et flatteur.'
    ],
    proTips: [
      'Fermez d\'un tiers ou deux tiers de stop (ex: F2.0 au lieu de F1.8) pour maximiser le piqué sur les yeux tout en gardant un beau flou.',
      'Nettoyez régulièrement vos lentilles avec des lingettes optiques microfibres non pelucheuses.',
      'Utilisez un réflecteur pliable pour déboucher les ombres sous le nez et le menton en lumière naturelle.'
    ]
  },
  'interviews': {
    title: 'Guide d\'Équipement pour Tournage d\'Interviews & Podcasts au Maroc',
    badge: 'INTERVIEWS, PODCASTS & CORPORATE',
    sub: 'Éclairage 3 points flatteur, focales fixes pour interviews et captation audio cristalline.',
    metaTitle: 'Guide Matériel Tournage Interviews au Maroc | Setup Pro | GearShop',
    metaDesc: 'Comment réussir vos tournages d\'interviews au Maroc : éclairage 3 points, objectifs 50mm/85mm et micros professionnels. Conseils GearShop.',
    keywords: 'materiel interview maroc, setup podcast video casablanca, eclairage interview maroc, eclairage 3 points',
    intro: 'Une interview professionnelle réussie repose sur un cadrage soigné avec une profondeur de champ maîtrisée et un éclairage équilibré à 3 sources (Key, Fill, Rim).',
    essentialGear: [
      'Lumière principale (Key Light) : Projecteur LED 100W-200W avec diffuseur dôme.',
      'Lumière de contre-jour (Rim/Hair Light) pour détacher le sujet du fond.',
      'Objectif 50mm ou 85mm pour compresser les perspectives sans déformation.',
      'Micro cravate sans fil discret avec bonnette anti-vent.'
    ],
    proTips: [
      'Positionnez la lumière principale à 45° du sujet et légèrement au-dessus du niveau des yeux (éclairage Rembrandt).',
      'Éloignez le sujet du mur arrière d\'au moins 2 mètres pour créer de la profondeur visuelle.',
      'Vérifiez toujours le niveau audio au casque avant de lancer l\'enregistrement définitif.'
    ]
  },
  'weddings': {
    title: 'Guide d\'Équipement pour Photo & Vidéo de Mariage au Maroc',
    badge: 'MARIAGES, SOIRÉES & ÉVÉNEMENTIEL',
    sub: 'Objectifs autofocus rapides en basse lumière, optiques de portrait et torches nomades puissantes.',
    metaTitle: 'Guide Matériel Mariage & Événementiel au Maroc | GearShop Casablanca',
    metaDesc: 'Sélection d\'équipement pour photographes et vidéastes de mariage au Maroc. Optiques F1.8 lumineuses, éclairage nomade et filtres créatifs.',
    keywords: 'materiel mariage maroc, objectif mariage casablanca, photographe mariage equipement, eclairage fete maroc',
    intro: 'Les mariages marocains imposent des cadences intenses, des changements rapides de luminosité et des moments uniques qui ne se rejouent jamais.',
    essentialGear: [
      'Trio d\'objectifs autofocus : 24mm (grand angle salle), 50mm (ambiance) et 85mm (portraits mariés).',
      'Torche LED puissante et compacte avec batterie longue durée pour les entrées de mariés.',
      'Filtre Black Mist pour diffuser la lumière des bougies et lustres avec une ambiance féerique.',
      'Cartes mémoires doubles slots et disques SSD externes de déchargement.'
    ],
    proTips: [
      'Doublez systématiquement vos enregistrements grâce aux deux slots de cartes de votre boîtier.',
      'Ayez toujours deux boîtiers prêts avec deux focales différentes (ex: 24mm sur l\'un, 85mm sur l\'autre).',
      'Anticipez les moments clés (Amariya, échange d\'alliances, gâteau) en préparant votre exposition à l\'avance.'
    ]
  }
};

const UseCaseGuide: React.FC<UseCaseGuideProps> = ({ products, onProductClick, siteConfig }) => {
  const { useCaseSlug } = useParams<{ useCaseSlug: string }>();
  const { addToCart } = useCart();

  const slug = (useCaseSlug || '').toLowerCase().trim();
  const catalogUseCase = getUseCaseBySlug(products, slug);

  const guide: GuideContent = useMemo(() => {
    if (GUIDE_CONTENTS[slug]) return GUIDE_CONTENTS[slug];
    const name = catalogUseCase ? catalogUseCase.nameFr : (useCaseSlug ? useCaseSlug.replace('-', ' ') : 'Guide');
    return {
      title: `Guide d'Équipement pour ${name} au Maroc`,
      badge: 'SÉLECTION SPÉCIALISÉE GEARSHOP',
      sub: `Matériel recommandé pour réussir vos projets de ${name.toLowerCase()} au Maroc.`,
      metaTitle: `Guide d'Équipement ${name} au Maroc | GearShop Casablanca`,
      metaDesc: `Découvrez les recommandations de nos experts pour votre équipement de ${name.toLowerCase()} au Maroc. Garantie 1 an et stock à Casablanca.`,
      keywords: `${name.toLowerCase()} maroc, materiel ${name.toLowerCase()} casablanca, gearshop maroc`,
      intro: `Découvrez le matériel sélectionné par nos spécialistes pour répondre aux contraintes et exigences de vos projets.`,
      essentialGear: [
        'Objectifs adaptés à vos sujets et conditions de prise de vue.',
        'Éclairage continu ou flash pour un contrôle total de la lumière.',
        'Accessoires et filtres pour protéger et maximiser vos performances.'
      ],
      proTips: [
        'Vérifiez la compatibilité complète avec votre boîtier avant achat.',
        'Profitez des conseils de nos techniciens à Casablanca sur WhatsApp.'
      ]
    };
  }, [slug, catalogUseCase, useCaseSlug]);

  const openWhatsappReserve = (productName: string) => {
    const phone = siteConfig.phone.replace('+212', '212').replace(/\s+/g, '');
    const msg = `Bonjour, je souhaite réserver le produit recommandé : ${productName} (Guide : ${guide.title})`;
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

  // Filter products matching this use case
  const guideProducts = useMemo(() => {
    if (catalogUseCase && catalogUseCase.productIds.length > 0) {
      return products.filter(p => catalogUseCase.productIds.includes(p.id));
    }
    // Fallback matching
    return products.filter(p => {
      const attrs = extractProductAttributes(p);
      const text = `${p.name} ${p.desc} ${p.category}`.toLowerCase();
      if (slug === 'filmmakers') return attrs.lens_type === 'cinema' || (attrs.product_type === 'light' && Number(p.price) >= 1500);
      if (slug === 'videographers') return attrs.product_type === 'light' || (attrs.product_type === 'filter' && /nd|vnd/i.test(p.name)) || attrs.lens_type === 'cinema';
      if (slug === 'content-creators') return /vlog|pocket|compact|micro/i.test(text);
      if (slug === 'photographers') return attrs.product_type === 'lens' || attrs.product_type === 'filter';
      if (slug === 'interviews') return attrs.product_type === 'light' || /50mm|85mm|micro/i.test(p.name);
      if (slug === 'weddings') return attrs.focus_type === 'autofocus' || (attrs.product_type === 'light' && text.includes('portable'));
      return false;
    });
  }, [products, catalogUseCase, slug]);

  const guideSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.metaDesc,
    "url": `https://gearshop.ma/guide/${slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "GearShop Maroc",
      "logo": "https://gearshop.ma/logo.png"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://gearshop.ma/guide/${slug}`
    }
  };

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>{guide.metaTitle}</title>
        <meta name="description" content={guide.metaDesc} />
        <meta name="keywords" content={guide.keywords} />
        <link rel="canonical" href={`https://gearshop.ma/guide/${slug}`} />
        <meta property="og:title" content={guide.metaTitle} />
        <meta property="og:description" content={guide.metaDesc} />
        <meta property="og:url" content={`https://gearshop.ma/guide/${slug}`} />
      </Helmet>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-red-600 transition-colors">Accueil</Link>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-400">Guides d'Achat</span>
          <i className="fa-solid fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-900 dark:text-white font-semibold">{guide.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/40 text-[#b91c1c] dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full mb-3">
            {guide.badge}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {guide.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {guide.sub}
          </p>
        </div>

        {/* Essential Gear & Pro Tips 2-Column Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-slate-100/80 dark:from-gray-800 dark:to-gray-850 p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-red-600" />
              Éléments indispensables du kit
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {guide.intro}
            </p>
            <ul className="space-y-3">
              {guide.essentialGear.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-gray-700 dark:text-gray-200">
                  <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50/50 to-amber-50/50 dark:from-gray-850 dark:to-gray-800 p-6 md:p-8 rounded-3xl border border-red-100 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-amber-500" />
              Conseils de tournage sur le terrain
            </h3>
            <ul className="space-y-3">
              {guide.proTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-gray-700 dark:text-gray-200">
                  <i className="fa-solid fa-star text-amber-500 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-red-200/40 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">Besoin d'un conseil personnalisé ?</span>
              <a
                href={`https://wa.me/${siteConfig.phone.replace('+', '')}?text=${encodeURIComponent(`Bonjour, j'ai besoin d'un conseil pour le guide : ${guide.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
              >
                <i className="fa-brands fa-whatsapp text-sm" />
                Conseiller WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Product Selection Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {guideProducts.length} équipements sélectionnés pour cet usage
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stock vérifié à Casablanca
          </div>
        </div>

        {/* Product Grid */}
        {guideProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {guideProducts.map(product => (
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sélection en cours d'actualisation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              Contactez nos experts sur WhatsApp pour composer un kit sur-mesure adapté à votre budget et vos objectifs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UseCaseGuide;
