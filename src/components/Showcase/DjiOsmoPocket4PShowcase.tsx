import React, { useState, useEffect, useRef } from 'react';

// ScrollReveal Wrapper for easy animations
const ScrollReveal: React.FC<{ children: React.ReactNode, delay?: number, direction?: 'up'|'left'|'right'|'scale' }> = ({ children, delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const base = "transition-all duration-1000 ease-out";
  const hidden = direction === 'up' ? "opacity-0 translate-y-16" :
                 direction === 'left' ? "opacity-0 -translate-x-16" :
                 direction === 'right' ? "opacity-0 translate-x-16" :
                 "opacity-0 scale-90";
  const visible = "opacity-100 translate-y-0 translate-x-0 scale-100";

  return (
    <div ref={ref} className={`${base} ${isVisible ? visible : hidden}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export interface DjiShowcaseProps {
  price?: number;
  currency?: string;
  onPreorder?: () => void;
  onContactWhatsApp?: () => void;
}

export const DjiOsmoPocket4PShowcase: React.FC<DjiShowcaseProps> = ({
  price = 8000,
  currency = 'DH',
  onPreorder,
  onContactWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState<'lenses' | 'color' | 'tracking'>('lenses');
  const [activeLens, setActiveLens] = useState<'wide' | 'tele'>('wide');
  const [activeColor, setActiveColor] = useState<'dlog2' | '10bit'>('dlog2');
  const [activeTracking, setActiveTracking] = useState<'all' | 'multi' | 'spotlight'>('all');

  return (
    <div className="w-full bg-slate-950 text-white font-sans overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center bg-gradient-to-b from-black via-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-slate-950/80 to-slate-950 pointer-events-none animate-pulse duration-[10000ms]" />

        <div className="relative max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-left z-10">
            <ScrollReveal delay={100} direction="up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-600/10 text-red-500 border border-red-600/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Dual-Lens Cinematic Pocket Gimbal Camera
              </span>
            </ScrollReveal>

            <ScrollReveal delay={200} direction="up">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-2xl">
                Osmo Pocket 4P
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={300} direction="up">
              <p className="text-2xl sm:text-3xl font-light text-gray-200 tracking-wide">
                See More. Tell More.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400} direction="up">
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal max-w-xl">
                Le premier système de caméra de poche à double objectif. Capteur principal 1 pouce CMOS LOFIC offrant 17 stops de dynamique, téléobjectif moyen 60mm f/1.8, profil D-Log 2 10-bit et stabilisation 3 axes avec ActiveTrack 8.0.
              </p>
            </ScrollReveal>

            {/* Price & Action Buttons */}
            <ScrollReveal delay={500} direction="up">
              <div className="pt-6 flex flex-wrap items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Prix Officiel</span>
                  <span className="text-4xl font-black text-white">
                    {price.toLocaleString()} <span className="text-xl font-medium text-red-500">{currency}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onPreorder}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/25 transition-all transform hover:-translate-y-1 flex items-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-cart-shopping" />
                    Réserver
                  </button>

                  <button
                    onClick={onContactWhatsApp}
                    className="px-6 py-4 bg-slate-800/50 hover:bg-slate-700/80 text-white border border-slate-700 backdrop-blur-md font-semibold rounded-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3 text-base"
                  >
                    <i className="fa-brands fa-whatsapp text-red-500 text-lg" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Hero Right Media Container */}
          <div className="lg:col-span-6 relative flex justify-center mt-10 lg:mt-0">
            <ScrollReveal delay={300} direction="scale">
              <div className="relative w-full max-w-lg aspect-[3/4] bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay"></div>
                <img
                  src="/images/products/dji-osmo-pocket-4-pro-3.png"
                  alt="DJI Osmo Pocket 4 Pro"
                  className="w-full h-full object-contain filter drop-shadow-[0_30px_50px_rgba(0,112,213,0.3)] transition-transform duration-[2000ms] ease-out group-hover:scale-110 relative z-10"
                />
                <div className="absolute bottom-6 right-6 z-20 transition-transform duration-700 group-hover:-translate-y-2">
                  <span className="text-[11px] uppercase font-mono tracking-widest text-white/70 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                    1" CMOS LOFIC
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & KEY FEATURES GRID */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <ScrollReveal direction="up">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Performance Cinématographique Sans Compromis
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Conçu pour les créateurs exigeants, le Pocket 4P rassemble les technologies vidéo les plus avancées dans un boîtier ultra-compact.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <ScrollReveal delay={100} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-red-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center text-2xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-camera" />
              </div>
              <h3 className="text-xl font-bold text-white">Double Capteur & 17 Stops LOFIC</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Grand-angle CMOS 1 pouce avec technologie LOFIC permettant 17 stops de plage dynamique pour conserver une exposition parfaite entre ombres et fortes lumières.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={200} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-gray-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-gray-600/10 text-gray-400 flex items-center justify-center text-2xl font-bold group-hover:bg-gray-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-crosshairs" />
              </div>
              <h3 className="text-xl font-bold text-white">Objectif Portrait 60mm f/1.8</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Second objectif téléobjectif moyen offrant un zoom optique 3× (jusqu'à 12× étendu) et un bokeh naturel f/1.8 sublimant les visages et portraits.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={300} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-red-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center text-2xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-film" />
              </div>
              <h3 className="text-xl font-bold text-white">D-Log 2 10-Bit & 1 Billion Couleurs</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Profil de couleur professionnel D-Log 2 10-bit capturant plus d'un milliard de nuances pour une étalonnage vidéo d'une souplesse absolue.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 4 */}
          <ScrollReveal delay={100} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-gray-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-gray-600/10 text-gray-400 flex items-center justify-center text-2xl font-bold group-hover:bg-gray-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-bolt" />
              </div>
              <h3 className="text-xl font-bold text-white">Ralenti Ultra-HD 4K / 240fps</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enregistrez vos moments forts en ralenti 10× 4K/240fps avec une netteté cristalline et un lissage de mouvement d'une précision remarquable.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 5 */}
          <ScrollReveal delay={200} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-red-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center text-2xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-arrows-to-eye" />
              </div>
              <h3 className="text-xl font-bold text-white">ActiveTrack 8.0 & Nacelle 3 Axes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stabilisation nacelle mécanique 3 axes alliée à ActiveTrack 8.0 pour garder les sujets automatiquement centrés jusqu'à 12× de zoom.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 6 */}
          <ScrollReveal delay={300} direction="up">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 space-y-5 hover:bg-slate-800 hover:border-gray-600/40 transition-all duration-500 hover:-translate-y-2 group h-full">
              <div className="w-14 h-14 rounded-2xl bg-gray-600/10 text-gray-400 flex items-center justify-center text-2xl font-bold group-hover:bg-gray-600 group-hover:text-white transition-colors duration-500">
                <i className="fa-solid fa-hard-drive" />
              </div>
              <h3 className="text-xl font-bold text-white">103 GB Stockage & 800 MB/s Transfert</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stockage interne intégré haute vitesse de 103 Go pour filmer immédiatement. Transfert USB 3.1 ultra-rapide jusqu'à 800 Mo/s.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. INTERACTIVE SHOWCASE TABS */}
      <section className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 border-y border-slate-900 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white">Explorez les Capacités Avancées</h2>
              <div className="inline-flex p-2 bg-slate-900 rounded-3xl border border-slate-800 text-sm font-bold shadow-xl flex-wrap justify-center gap-2">
                <button
                  onClick={() => setActiveTab('lenses')}
                  className={`px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'lenses' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  Système Optique
                </button>
                <button
                  onClick={() => setActiveTab('color')}
                  className={`px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'color' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  Couleur & Dynamique
                </button>
                <button
                  onClick={() => setActiveTab('tracking')}
                  className={`px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'tracking' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  Suivi Intelligent
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Tab 1: LENSES */}
          {activeTab === 'lenses' && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-8 sm:p-12 space-y-10 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
              <div className="flex flex-wrap gap-4 border-b border-slate-800/80 pb-6 justify-center">
                <button
                  onClick={() => setActiveLens('wide')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeLens === 'wide' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Grand-Angle 20mm f/2.0
                </button>
                <button
                  onClick={() => setActiveLens('tele')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeLens === 'tele' ? 'bg-slate-800 text-gray-400 border border-gray-600/50 shadow-lg shadow-gray-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Téléobjectif Moyen 60mm f/1.8
                </button>
              </div>

              {activeLens === 'wide' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <span className="text-sm uppercase font-black text-red-500 tracking-widest bg-red-600/10 px-4 py-2 rounded-lg">Objectif Principal</span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">17 Stops de Plage Dynamique</h3>
                    <p className="text-base text-slate-300 leading-relaxed">
                      Équipé de la technologie LOFIC, le capteur 1 pouce évite la surexposition en plein soleil et conserve tous les détails dans les zones d'ombres intenses, révélant une richesse cinématographique inégalée.
                    </p>
                    <ul className="space-y-4 text-sm sm:text-base text-slate-400 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500"><i className="fa-solid fa-check" /></div> Équivalent 20mm Grand-Angle f/2.0</li>
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500"><i className="fa-solid fa-check" /></div> Ralenti Ultra-HD jusqu'à 4K/240fps</li>
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500"><i className="fa-solid fa-check" /></div> Profil D-Log 2 10-Bit étendu</li>
                    </ul>
                  </div>
                  <div className="rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 p-2 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src="/images/products/dji-osmo-pocket-4-pro-6.png" alt="Wide Lens Preview" className="w-full h-80 object-cover rounded-[2rem] transform transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <span className="text-sm uppercase font-black text-gray-400 tracking-widest bg-gray-600/10 px-4 py-2 rounded-lg">Objectif Secondaire</span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">Zoom Optique 3× & Bokeh f/1.8</h3>
                    <p className="text-base text-slate-300 leading-relaxed">
                      Spécialement optimisé pour la vidéo portrait et les interviews. Le focale 60mm compresse délicatement l'arrière-plan pour isoler votre sujet avec une séparation 3D époustouflante.
                    </p>
                    <ul className="space-y-4 text-sm sm:text-base text-slate-400 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600/20 flex items-center justify-center text-gray-400"><i className="fa-solid fa-check" /></div> Zoom Optique 3× & Zoom Numérique 12×</li>
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600/20 flex items-center justify-center text-gray-400"><i className="fa-solid fa-check" /></div> Ouverture f/1.8 pour flou d'arrière-plan naturel</li>
                      <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600/20 flex items-center justify-center text-gray-400"><i className="fa-solid fa-check" /></div> Enregistrement vidéo 4K/200fps</li>
                    </ul>
                  </div>
                  <div className="rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 p-2 shadow-2xl relative group">
                    <img src="/images/products/dji-osmo-pocket-4-pro-1.jpg" alt="Telephoto Portrait Sample" className="w-full h-80 object-cover rounded-[2rem] transform transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: COLOR */}
          {activeTab === 'color' && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-8 sm:p-12 space-y-10 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
              <div className="flex flex-wrap gap-4 border-b border-slate-800/80 pb-6 justify-center">
                <button
                  onClick={() => setActiveColor('dlog2')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeColor === 'dlog2' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Nouveau Profil D-Log 2
                </button>
                <button
                  onClick={() => setActiveColor('10bit')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeColor === '10bit' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Profondeur de Couleur 10-Bit
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">Étalonnage & Rendu Professionnel</h3>
                  <p className="text-base text-slate-300 leading-relaxed bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    {activeColor === 'dlog2'
                      ? "Le profil couleur D-Log 2 offre la plage dynamique la plus vaste à ce jour pour préserver la douceur des hautes lumières et la richesse des ombres, vous laissant une latitude incroyable en post-production."
                      : "La profondeur de couleur 10-bit enregistre plus de 1.07 milliard de nuances de couleurs pour éliminer complètement le banding colorimétrique et offrir des dégradés de ciel et de peau parfaits."}
                  </p>
                </div>
                <div className="rounded-[3rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 text-center shadow-[inset_0_0_50px_rgba(0,150,255,0.1)] flex flex-col justify-center min-h-[320px]">
                  <span className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 block mb-6 drop-shadow-lg">1,073,741,824</span>
                  <span className="text-sm uppercase tracking-widest text-slate-400 font-bold">Couleurs 10-Bit D-Log 2</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: TRACKING */}
          {activeTab === 'tracking' && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-8 sm:p-12 space-y-10 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
              <div className="flex flex-wrap gap-4 border-b border-slate-800/80 pb-6 justify-center">
                <button
                  onClick={() => setActiveTracking('all')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTracking === 'all' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  ActiveTrack 8.0
                </button>
                <button
                  onClick={() => setActiveTracking('multi')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTracking === 'multi' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Suivi Multi-Personnes
                </button>
                <button
                  onClick={() => setActiveTracking('spotlight')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTracking === 'spotlight' ? 'bg-slate-800 text-red-500 border border-red-600/50 shadow-lg shadow-red-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                  Mode Spotlight
                </button>
              </div>

              <div className="space-y-6 max-w-3xl mx-auto text-center">
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">Centrage Automatique & Cadrage Précis</h3>
                <p className="text-lg text-slate-300 leading-relaxed bg-slate-950/80 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
                  {activeTracking === 'all' && "ActiveTrack 8.0 analyse la scène en temps réel et maintient automatiquement les sujets (personnes, animaux, véhicules) parfaitement cadrés au centre, même lors de mouvements brusques jusqu'à un zoom 12×."}
                  {activeTracking === 'multi' && "Le mode Multi-Personnes ajuste la nacelle dynamiquement pour inclure jusqu'à 8 personnes dans le champ visuel tout en conservant l'équilibre harmonieux du groupe. Parfait pour les vlogs de groupe."}
                  {activeTracking === 'spotlight' && "Le mode Spotlight verrouille intelligemment le sujet principal au centre de l'image, permettant au créateur de déplacer librement la caméra pour des prises de vues cinématographiques complexes sans perdre le point."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SPECIFICATIONS COMPARISON TABLE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        <ScrollReveal direction="up">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white">Comparatif Gamme Osmo Pocket</h2>
            <p className="text-lg text-slate-400">Découvrez les évolutions majeures du Pocket 4P par rapport aux générations précédentes.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} direction="up">
          <div className="overflow-x-auto rounded-[2.5rem] border border-slate-800 bg-slate-900/40 shadow-2xl backdrop-blur-sm p-4">
            <table className="w-full text-left text-sm sm:text-base text-slate-300 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-700 bg-slate-900 text-white font-black rounded-t-2xl overflow-hidden">
                  <th className="p-6 rounded-tl-2xl">Spécification</th>
                  <th className="p-6 text-red-500 bg-red-900/10">Osmo Pocket 4P (Nouveau)</th>
                  <th className="p-6 text-slate-400">Osmo Pocket 4</th>
                  <th className="p-6 text-slate-500 rounded-tr-2xl">Osmo Pocket 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Capteur Image</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">1" CMOS LOFIC (17 Stops) + 60mm</td>
                  <td className="p-6">1" CMOS (14 Stops)</td>
                  <td className="p-6 text-slate-500">1" CMOS Standard</td>
                </tr>
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Zoom & Focale</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">3× Optique (jusqu'à 12×)</td>
                  <td className="p-6">2× Zoom sans perte</td>
                  <td className="p-6 text-slate-500">2× Zoom sans perte</td>
                </tr>
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Vidéo Max & Ralenti</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">4K / 240fps (10× Ralenti)</td>
                  <td className="p-6">4K / 240fps</td>
                  <td className="p-6 text-slate-500">4K / 120fps</td>
                </tr>
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Profil Couleur</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">Nouveau D-Log 2 10-Bit</td>
                  <td className="p-6">D-Log 10-Bit</td>
                  <td className="p-6 text-slate-500">D-Log M / HLG</td>
                </tr>
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Suivi Intelligent</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">ActiveTrack 8.0 (12× zoom)</td>
                  <td className="p-6">ActiveTrack 6.0</td>
                  <td className="p-6 text-slate-500">ActiveTrack 6.0</td>
                </tr>
                <tr className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-6 font-bold text-slate-200">Stockage Interne</td>
                  <td className="p-6 text-white font-bold bg-red-900/5">103 GB (800 Mo/s)</td>
                  <td className="p-6">107 GB (USB 3.1)</td>
                  <td className="p-6 text-slate-500">Aucun (MicroSD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. FOOTER CALL TO ACTION */}
      <section className="relative py-32 bg-slate-950 border-t border-slate-900 px-4 sm:px-6 lg:px-8 text-center space-y-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <ScrollReveal direction="scale">
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">Prêt à Transformer vos Vidéos Mobile ?</h2>
            <p className="text-lg text-slate-400">
              Réservez dès aujourd'hui votre DJI Osmo Pocket 4 Pro chez GearShop Maroc avec garantie officielle d'un an et livraison rapide.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <button
                onClick={onPreorder}
                className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-2xl shadow-2xl shadow-red-600/30 transition-transform transform hover:-translate-y-1 text-lg flex items-center gap-3"
              >
                <i className="fa-solid fa-cart-shopping" />
                Précommander - {price.toLocaleString()} {currency}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
      
      {/* Keyframes injection for simple animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default DjiOsmoPocket4PShowcase;
