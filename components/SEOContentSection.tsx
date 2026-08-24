import React from 'react';

interface GuideItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  mounts: string[];
}

const guides: GuideItem[] = [
  {
    id: 'lumix-panasonic',
    icon: '⚡',
    title: 'Objectifs pour Panasonic Lumix (L-Mount & Micro 4/3)',
    subtitle: 'Pour Lumix S5, S5II, S5IIX, S1H (Plein Format) & GH5, GH6, G9 (M43)',
    content: 'GearShop Maroc est la première référence pour équiper vos appareils Panasonic Lumix au Maroc. Nous proposons une sélection complète d\'objectifs autofocus F1.8 plein format en monture L-Mount (AF24mm, AF35mm, AF50mm, AF135mm), des optiques cinéma plein format T2.0 (35mm, 50mm) ainsi que les optiques ciné grand angle Micro 4/3 (10mm T2.1, 16mm T2.1). Idéal pour les vidéastes, documentaristes et photographes utilisant la gamme Lumix S et Lumix GH à Casablanca, Rabat et partout au Maroc.',
    tags: ['AF24mm F1.8 L-Mount', 'AF35mm F1.8 L-Mount', 'AF50mm F1.8 L-Mount', 'AF135mm F1.8 L-Mount', '35mm T2.0 Ciné L-Mount', '10mm T2.1 M43', '16mm T2.1 M43', '50mm F1.2 M43'],
    mounts: ['L Mount', 'M43 (Panasonic Lumix)']
  },
  {
    id: 'fujifilm-x',
    icon: '📷',
    title: 'Objectifs pour Fujifilm X-Series & Hybrides Fuji',
    subtitle: 'Pour Fujifilm X-T5, X-T4, X-H2, X-H2S, X-T30, X-S20 (FX Mount)',
    content: 'Découvrez la gamme d\'optiques haute performance pour boîtiers Fujifilm au Maroc. GearShop propose les nouveaux objectifs autofocus lumineux (AF35mm F1.4, AF35mm F1.8, AF50mm F1.8) et les focales fixes manuelles ultra-lumineuses (50mm F1.2, 35mm F1.4, 50mm F1.8) ainsi que les objectifs cinéma grand angle (10mm T2.1, 16mm T2.1). Obtenez le rendu argentique inimitable et le piqué maximal sur vos capteurs X-Trans Fujifilm.',
    tags: ['AF35mm F1.4 Fuji FX', 'AF35mm F1.8 Fuji FX', 'AF50mm F1.8 Fuji FX', '50mm F1.2 Fuji FX', '10mm T2.1 Ciné FX', '16mm T2.1 Ciné FX'],
    mounts: ['Fuji FX (X-Mount)']
  },
  {
    id: 'sony-e',
    icon: '📸',
    title: 'Objectifs pour Sony E-Mount (Alpha, FX3, FX30)',
    subtitle: 'Pour Sony A7 III, A7 IV, A7R V, A7C, ZV-E1, FX3, FX30',
    content: 'Pour les utilisateurs de boîtiers Sony plein format et APS-C au Maroc, GearShop est votre partenaire officiel pour les objectifs 7Artisans E-Mount. Notre sélection comprend les objectifs autofocus haute performance (AF24mm F1.8, AF35mm F1.8, AF40mm F2.5, AF50mm F1.8, AF135mm F1.8) et les lentilles cinéma T2.0 / T2.1 pour productions professionnelles.',
    tags: ['AF24mm F1.8', 'AF35mm F1.8', 'AF40mm F2.5', 'AF50mm F1.8', 'AF135mm F1.8', '35mm T2.0 Ciné', '50mm T2.0 Ciné', '10mm T2.1 Ciné'],
    mounts: ['Sony E (Plein Format & APS-C)']
  },
  {
    id: 'nikon-z',
    icon: '🎯',
    title: 'Objectifs pour Nikon Z-Mount (Z5, Z6, Z7, Z8, Z9, Z50)',
    subtitle: 'Pour boîtiers hybrides Nikon Z plein format et APS-C',
    content: 'GearShop Maroc propose la gamme complète des objectifs compatibles Nikon Z. Que vous soyez cinéaste ou photographe professionnel, nous disposons de toutes les focales: du grand angle AF24mm aux téléobjectifs AF135mm F1.8, ainsi que les focales fixes cinéma T2.0. Disponibles en stock immédiat à Casablanca avec livraison rapide partout au Maroc.',
    tags: ['AF24mm F1.8', 'AF35mm F1.8', 'AF50mm F1.8', 'AF135mm F1.8', '50mm F1.2', '35mm T2.0 Ciné', '50mm T2.0 Ciné'],
    mounts: ['Nikon Z']
  },
  {
    id: 'canon-rf',
    icon: '🎬',
    title: 'Objectifs pour Canon EOS-R & RF-Mount',
    subtitle: 'Pour Canon R5, R6, R6 II, R3, R50, R100, R7, R10, C70',
    content: 'Les créateurs sur Canon EOS-R au Maroc peuvent équiper leurs caméras avec les optiques 7Artisans en monture native RF (EOS-R): focales fixes haute résolution (35mm F1.4 Mark III FF, 35mm F1.4) et lentilles cinéma professionnelles (10mm T2.1, 16mm T2.1, 35mm T2.0, 50mm T2.0).',
    tags: ['35mm F1.4 Mark III FF', '35mm T2.0 Ciné RF', '50mm T2.0 Ciné RF', '10mm T2.1 RF', '16mm T2.1 RF', 'Adaptateur EF-EOS R'],
    mounts: ['Canon RF (EOS-R)']
  },
  {
    id: 'kf-filters',
    icon: '💎',
    title: 'Filtres Optiques K&F Concept (VND, Black Mist, CPL & Bagues)',
    subtitle: 'Verre Optique Japonais Nano-Xcel, Nano-X & Nano-C (Diamètres 49mm à 95mm)',
    content: 'Premier distributeur officiel K&F Concept au Maroc, GearShop propose la gamme complète de filtres optiques professionnels: filtres ND variables True Color sans croix noire (ND2-32, ND2-400, ND8-2000), filtres de diffusion Black Mist 1/4 & 1/8 pour rendu cinématographique doux, filtres polarisants CPL et kits de bagues d\'adaptation métalliques Step-Up & Step-Down 37mm-82mm.',
    tags: ['82mm 3-in-1 VND+CPL+Black Mist', '82mm Black Diffusion 1/4', '82mm CPL Slim', '82mm VND ND2-32 Nano-Xcel Pro', 'Kit 18pcs Bagues Step-Up/Down', 'Kit Nettoyage 3-en-1'],
    mounts: ['Tous Diamètres (49mm à 95mm)']
  },
  {
    id: 'cine-series',
    icon: '🎥',
    title: 'Lentilles Cinéma Professionnelles au Maroc (Vision & Spectrum Series)',
    subtitle: 'Premier importateur d\'optiques cinéma au Maroc (Ouverture T2.0 & T2.1)',
    content: 'Découvrez la série cinéma professionnelle 7Artisans Vision et Spectrum Series avec ouverture constante T2.0 et T2.1. Conçues pour le cinéma, les clips musicaux et les séries télévisées au Maroc avec engrenages de mise au point 0.8 MOD, bagues de diaphragme fluides sans clic et piqué cinématographique.',
    tags: ['10mm T2.1', '16mm T2.1', '35mm T2.0', '50mm T2.0', 'Adaptateur PL 4-en-1'],
    mounts: ['Sony E', 'Nikon Z', 'Canon RF', 'L Mount (Lumix)', 'M43 (Lumix)', 'Fuji FX']
  },
  {
    id: 'dji-osmo',
    icon: '🎥',
    title: 'Produits DJI, Osmo Pocket & Drones au Maroc',
    subtitle: 'Revendeur DJI Maroc : Osmo Pocket 4 Pro, Gimbals et Accessoires',
    content: 'GearShop Maroc propose les derniers équipements DJI pour les créateurs de contenu, vloggeurs et professionnels de l\'audiovisuel. Découvrez la gamme DJI Osmo Pocket (incluant le tout nouveau DJI Osmo Pocket 4 Pro), les stabilisateurs pour smartphones et caméras, ainsi que divers accessoires de la marque DJI. Disponibles en précommande et en stock à Casablanca.',
    tags: ['DJI Osmo Pocket 4 Pro', 'Osmo Action', 'DJI Ronin', 'Stabilisateurs DJI'],
    mounts: ['DJI']
  }
];

const SEOContentSection: React.FC = () => {
  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100" aria-label="Guide et Compatibilité Optique">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Accordion Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b91c1c] mb-1.5">
            GUIDE TECHNIQUE &amp; COMPATIBILITÉ BOÎTIERS
          </p>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Compatibilité Optique par Marque &amp; Monture au Maroc
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl mx-auto">
            Trouvez les meilleurs objectifs photo et cinéma pour Panasonic Lumix, Fujifilm, Sony, Nikon, Canon, les filtres K&amp;F Concept et les produits DJI en stock à Casablanca.
          </p>
        </div>

        {/* Collapsible SEO Accordions */}
        <div className="space-y-3">
          {guides.map((guide) => (
            <details
              key={guide.id}
              className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-300 open:border-red-400 open:shadow-md"
            >
              <summary className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none list-none group-hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0 group-open:bg-red-50">
                    {guide.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 group-open:text-[#b91c1c] transition-colors leading-tight">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
                      {guide.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    {guide.mounts.join(', ')}
                  </span>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                </div>
              </summary>

              <div className="px-5 pb-5 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{guide.content}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Modèles disponibles :</span>
                  {guide.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SEOContentSection;
