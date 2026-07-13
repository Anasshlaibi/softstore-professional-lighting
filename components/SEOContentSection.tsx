import React, { useState } from 'react';

/**
 * SEOContentSection - Rich keyword-targeted content for Google & AI search ranking.
 * 
 * This section provides detailed, informative content about 7Artisans products
 * targeting Morocco searches. Content is rendered as real HTML text (not behind
 * a tab or in a modal), so Google and AI crawlers can fully index it.
 * 
 * Target keywords:
 * - "objectifs 7artisans maroc"
 * - "lentilles cinéma maroc"
 * - "objectif canon nikon sony maroc"
 * - "cine lens maroc casablanca"
 * - "revendeur 7artisans maroc"
 */

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
    id: 'nikon-z',
    icon: '🎯',
    title: 'Objectifs 7Artisans pour Nikon Z',
    subtitle: 'La gamme complète pour boîtiers Nikon Z6, Z7, Z50, Z8, Z9',
    content: 'GearShop Maroc propose la gamme complète des objectifs 7Artisans compatibles avec le mount Nikon Z. Que vous soyez cinéaste ou photographe professionnel, nous disposons de tous les focales: du grand angle 24mm aux téléobjectifs 135mm. Nos objectifs autofocus (AF) et manuels sont disponibles en stock à Casablanca avec livraison rapide dans tout le Maroc. Les objectifs 7Artisans pour Nikon Z offrent une qualité optique exceptionnelle à un prix accessible pour le marché marocain.',
    tags: ['AF24mm F1.8', 'AF35mm F1.8', 'AF50mm F1.8', 'AF135mm F1.8', '35mm T2.0 Ciné'],
    mounts: ['Nikon Z']
  },
  {
    id: 'sony-e',
    icon: '📸',
    title: 'Objectifs 7Artisans pour Sony E Mount',
    subtitle: 'Compatibles Sony A7 III, A7 IV, A7R V, ZV-E1, FX3, FX30',
    content: 'Pour les utilisateurs de boîtiers Sony plein format et APS-C, GearShop est votre seul partenaire officiel au Maroc pour les objectifs 7Artisans E Mount. Notre sélection comprend les objectifs autofocus haute performance (AF40mm F2.5, AF35mm F1.8, AF50mm F1.8) et les lentilles cinéma T2.0 pour productions professionnelles. Idéaux pour la photographie de portrait, de mariage, de mode et la production vidéo au Maroc.',
    tags: ['AF40mm F2.5', 'AF35mm F1.8', 'AF50mm F1.8', 'AF24mm F1.8', '50mm T2.0 Ciné'],
    mounts: ['Sony E']
  },
  {
    id: 'canon-rf',
    icon: '🎬',
    title: 'Objectifs 7Artisans pour Canon EOS-R',
    subtitle: 'Pour Canon R5, R6, R3, R50, R100, R7, R10',
    content: 'Les utilisateurs Canon EOS-R au Maroc peuvent désormais accéder à la gamme premium 7Artisans via GearShop. Nos objectifs Canon RF Mount (EOS-R) incluent des focales fixes de haute qualité: 35mm F1.4 plein format Mark III et les lentilles cinéma T2.0. Ces objectifs sont parfaits pour la photographie créative et la réalisation vidéo professionnelle au Maroc. Obtenez des images avec un bokeh cinématographique exceptionnel.',
    tags: ['35mm F1.4 FF', '50mm T2.0 Ciné', '35mm T2.0 Ciné', 'Adaptateur PL 4-en-1'],
    mounts: ['Canon RF']
  },
  {
    id: 'cine',
    icon: '🎥',
    title: 'Lentilles Cinéma 7Artisans — Cine Lenses Maroc',
    subtitle: 'Objectifs T2.0 pour productions cinématographiques professionnelles',
    content: 'GearShop est le seul fournisseur au Maroc de lentilles cinéma 7Artisans T2.0. Ces objectifs sont conçus spécifiquement pour la production cinématographique et vidéo professionnelle: bagues de mise au point longues et lisses, ouverture T-stop calibrée, rendu cinématographique authentique. Disponibles en mount Nikon Z, Sony E et Canon RF. Parfaits pour les cinéastes marocains, réalisateurs, vidéastes et studios de production basés à Casablanca, Rabat, Marrakech et dans tout le Maroc.',
    tags: ['35mm T2.0', '50mm T2.0', '75mm T2.0', 'Série Ciné Complète'],
    mounts: ['Nikon Z', 'Sony E', 'Canon RF']
  },
  {
    id: 'filters',
    icon: '🔮',
    title: 'Filtres & Accessoires 7Artisans',
    subtitle: 'Filtres VND, Black Mist, adaptateurs PL — disponibles au Maroc',
    content: 'Complétez votre kit optique avec nos filtres et accessoires 7Artisans disponibles chez GearShop Maroc. Notre gamme comprend: filtres True Color VND (6-9 stops) pour le contrôle parfait de l\'exposition, filtres Black Mist 1/8 pour un effet cinématographique doux, et l\'adaptateur PL 4-en-1 universel compatible avec les mounts E, L, RF et Z. Tous disponibles en stock à Casablanca avec livraison rapide dans tout le Maroc.',
    tags: ['VND 6-9 Stops', 'Black Mist 1/8', 'Adaptateur PL 4-en-1', 'Adaptateur Canon EF-NZ'],
    mounts: ['Universel']
  }
];

const SEOContentSection: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<string>(guides[0].id);
  const current = guides.find(g => g.id === activeGuide) || guides[0];

  return (
    <section
      id="guide-objectifs"
      className="py-20 md:py-28 bg-gray-50"
      aria-label="Guide complet des objectifs 7Artisans disponibles au Maroc"
    >
      <div className="container mx-auto px-4 md:px-6">

        {/* Section Header — Rich in keywords for Google */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Seul Revendeur Officiel au Maroc
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-5 leading-tight">
            Objectifs 7Artisans &amp; Lentilles Cinéma
            <br className="hidden md:block" />
            <span className="text-gray-400 text-2xl md:text-3xl font-normal"> disponibles au Maroc</span>
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            GearShop Casablanca est le <strong className="text-black">seul revendeur officiel au Maroc</strong> d'objectifs{' '}
            <strong className="text-black">7Artisans</strong> pour <strong className="text-black">Canon EOS-R</strong>,{' '}
            <strong className="text-black">Nikon Z</strong> et <strong className="text-black">Sony E</strong>.
            Livraison rapide dans tout le Maroc — Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et plus.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {guides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setActiveGuide(guide.id)}
              aria-pressed={activeGuide === guide.id}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeGuide === guide.id
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-black'
              }`}
            >
              <span>{guide.icon}</span>
              <span className="hidden sm:inline">{guide.mounts[0]}</span>
              <span className="sm:hidden">{guide.mounts[0]}</span>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Left: Info */}
            <div className="md:w-3/5 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{current.icon}</span>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black">{current.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{current.subtitle}</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-sm md:text-base">
                {current.content}
              </p>

              {/* Mount badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {current.mounts.map(mount => (
                  <span key={mount} className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                    {mount} Mount
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#collection"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                Voir les {current.mounts[0]} objectifs
              </a>
            </div>

            {/* Right: Product Tags */}
            <div className="md:w-2/5 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-8 md:p-12">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                Produits Disponibles
              </h4>
              <ul className="space-y-3" role="list">
                {current.tags.map((tag, i) => (
                  <li key={i}>
                    <a
                      href="#collection"
                      className="flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 group-hover:border-black group-hover:text-black transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700 group-hover:text-black transition-colors font-medium">
                        7Artisans {tag}
                      </span>
                      <i className="fa-solid fa-arrow-right text-xs text-gray-300 group-hover:text-black transition-colors ml-auto"></i>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Availability badge */}
              <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider">En Stock</span>
                </div>
                <p className="text-xs text-green-600">
                  Disponible à Casablanca. Livraison 24-48h.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text — Pure SEO keyword content */}
        <div className="mt-16 max-w-4xl mx-auto prose prose-gray">
          <h3 className="text-xl font-bold text-center text-black mb-6">
            Pourquoi choisir GearShop pour vos objectifs 7Artisans au Maroc?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
            {[
              {
                icon: '🏆',
                title: 'Revendeur Exclusif',
                desc: 'Seul distributeur officiel et agréé d\'objectifs 7Artisans au Maroc. Authenticité garantie sur tous nos produits.'
              },
              {
                icon: '🚚',
                title: 'Livraison Maroc',
                desc: 'Livraison rapide dans toutes les villes: Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès et plus.'
              },
              {
                icon: '🛡️',
                title: 'Garantie Officielle',
                desc: 'Tous les objectifs 7Artisans sont vendus avec garantie constructeur officielle de 1 an et service après-vente.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-black mb-2 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SEOContentSection;

