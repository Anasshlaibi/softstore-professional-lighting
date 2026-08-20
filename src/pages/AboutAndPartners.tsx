import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const AboutAndPartners: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-16">
      <Helmet>
        <title>À Propos &amp; Marques Partenaires | GearShop Maroc</title>
        <meta
          name="description"
          content="Découvrez GearShop Maroc: Premier importateur d'optiques cinéma 7Artisans, filtres K&F Concept, et distributeur d'équipements audiovisuels pro à Casablanca et partout au Maroc."
        />
        <link rel="canonical" href="https://gearshop.ma/a-propos" />
      </Helmet>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-red-700 font-bold">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">À Propos &amp; Partenaires</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-14 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#b91c1c] mb-3 block">
            QUI SOMMES-NOUS &amp; NOS ENGAGEMENTS
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            L'Excellence Audiovisuelle au Service des Créateurs Marocains
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
            GearShop Maroc est la référence en matière d'équipements photo et cinéma professionnels. 
            Nous sommes fiers d'être le <strong>premier et seul importateur direct</strong> de lentilles cinéma 7Artisans et de filtres optiques K&amp;F Concept au Maroc.
          </p>
        </div>

        {/* 2 Flagship Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* 7Artisans Pillar */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  Partenaire Exclusif
                </span>
                <span className="text-xs font-bold text-gray-400">Optiques Ciné &amp; Photo</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">7Artisans Maroc</h2>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed space-y-2">
                Pionnier des optiques cinéma accessibles, 7Artisans conçoit des séries d'objectifs cinéma T2.0 et T2.1 (Vision &amp; Spectrum Series) ainsi qu'une gamme complète d'autofocus plein format pour Sony E, Nikon Z, Canon RF, L-Mount et Fuji FX.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-red-600 text-xs" />
                  Premier importateur officiel au Maroc
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-red-600 text-xs" />
                  Garantie 1 an constructeur &amp; SAV direct à Casablanca
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-red-600 text-xs" />
                  Disponibilité immédiate en stock
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link to="/#products" className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1.5">
                Voir les objectifs 7Artisans en stock
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </Link>
            </div>
          </div>

          {/* K&F Concept Pillar */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  Filtres &amp; Accessoires Pro
                </span>
                <span className="text-xs font-bold text-gray-400">Verre Optique Nano</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">K&amp;F Concept Maroc</h2>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Leader mondial des filtres optiques en verre haute définition. Filtres ND Variables (VND), filtres Black Mist pour diffusion cinématographique, polarisants circulaires (CPL) et bagues d'adaptation de haute précision.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-amber-600 text-xs" />
                  Tous diamètres disponibles (49mm à 95mm)
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-amber-600 text-xs" />
                  Traitement multicouches anti-reflet Nano-X
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-amber-600 text-xs" />
                  Bagues d'adaptation de monture compatibles AF
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link to="/#products" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5">
                Découvrir la gamme de filtres K&amp;F
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Full Brand Ecosystem Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Un Écosystème Multimarques Complet</h2>
            <p className="text-xs text-gray-500 mt-1">Nous sélectionnons rigoureusement les meilleures marques internationales pour équiper vos tournages.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Sony', desc: 'Boîtiers hybrides Alpha, FX3, FX30 et gamme d\'accessoires vidéo.' },
              { name: 'Canon', desc: 'Systèmes EOS-R plein format, hybrides APS-C et optiques de légende.' },
              { name: 'Nikon', desc: 'Boîtiers hybrides système Z, Z6, Z8, Z9 et adaptateurs.' },
              { name: 'Godox', desc: 'Éclairage studio continu, projecteurs LED COB et flashes de reportage.' },
              { name: 'Røde', desc: 'Microphones sans fil Wireless GO, micros canon et interfaces audio pro.' },
              { name: 'Insta360', desc: 'Caméras d\'action, capture 360° et stabilisateurs intelligents pour smartphone.' },
              { name: 'SanDisk', desc: 'Cartes mémoires haute vitesse Extreme Pro, SDXC et CFexpress.' },
              { name: 'Yongnuo', desc: 'Tubes LED RVB créatifs, torches compactes et panneaux bicolores.' },
            ].map(b => (
              <div key={b.name} className="p-4 bg-white border border-gray-200/80 rounded-2xl">
                <h3 className="text-sm font-black text-gray-900 mb-1">{b.name}</h3>
                <p className="text-xs text-gray-500 leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Casablanca Showroom */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-2">
              DISPONIBLE À CASABLANCA &amp; LIVRAISON PARTOUT AU MAROC
            </span>
            <h2 className="text-xl md:text-3xl font-black">Besoin d'un conseil technique ou d'un devis ?</h2>
            <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-xl">
              Notre équipe d'experts audiovisuels est à votre disposition par WhatsApp ou directement à notre magasin de Casablanca.
            </p>
          </div>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-2xl text-xs uppercase tracking-wider hover:brightness-110 transition-all shrink-0 flex items-center gap-2"
          >
            <i className="fa-brands fa-whatsapp text-base" />
            Contacter par WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutAndPartners;
