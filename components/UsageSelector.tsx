import React from 'react';

const UsageSelector: React.FC = () => {
  const usages = [
    {
      title: 'TikTok & Reels',
      desc: 'Lumière compacte, RGB et portable pour des vidéos éclatantes sur mobile.',
      icon: 'fa-mobile-screen-button',
      color: 'from-pink-500 to-purple-600',
      keywords: 'Éclairage TikTok Maroc'
    },
    {
      title: 'YouTube & Podcast',
      desc: 'Éclairage 3 points professionnel pour un rendu visage parfait et sans ombres.',
      icon: 'fa-video',
      color: 'from-blue-500 to-cyan-600',
      keywords: 'Kit YouTube Casablanca'
    },
    {
      title: 'Studio & Cinéma',
      desc: 'Puissance maximale 300W+ et fidélité de couleur CRI 97+ pour les pros.',
      icon: 'fa-clapperboard',
      color: 'from-orange-500 to-red-600',
      keywords: 'Projecteur ZSYB Maroc'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-black mb-4">
            Quel est votre usage ?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Sélectionnez votre type de création et nous vous montrerons le matériel idéal pour votre studio au Maroc.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {usages.map((usage, idx) => (
            <div 
              key={idx} 
              className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-2"
              onClick={() => {
                const el = document.getElementById('collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${usage.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                <i className={`fa-solid ${usage.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{usage.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {usage.desc}
              </p>
              <span className="mt-auto text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
                Voir les produits →
              </span>
              <span className="sr-only">{usage.keywords}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UsageSelector;
