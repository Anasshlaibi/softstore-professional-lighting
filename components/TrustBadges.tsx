import React from 'react';

const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: 'fa-truck-fast',
      title: 'Livraison Gratuite',
      subtitle: 'Dès 500 DH partout au Maroc'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Garantie 1 An',
      subtitle: 'Constructeur officielle certifiée'
    },
    {
      icon: 'fa-rotate-left',
      title: 'Retour 14 Jours',
      subtitle: 'Satisfait ou remboursé'
    },
    {
      icon: 'fa-lock',
      title: 'Paiement Sécurisé',
      subtitle: 'Paiement à la livraison & Virement'
    }
  ];

  return (
    <section className="py-6 md:py-8 bg-gray-50/70 border-y border-gray-200/80" aria-label="Engagements et Garanties GearShop">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-3 rounded-xl bg-white border border-gray-200/70 shadow-2xs hover:shadow-sm transition">
              <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <i className={`fa-solid ${badge.icon} text-lg`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                  {badge.title}
                </h3>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
