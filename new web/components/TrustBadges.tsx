import React from 'react';

const TrustBadges: React.FC = () => {
    const badges = [
        {
            icon: 'fa-truck-fast',
            title: 'Livraison Gratuite',
            subtitle: 'Dès 500 DH'
        },
        {
            icon: 'fa-shield -check',
            title: 'Garantie 1 An',
            subtitle: 'Sur tous nos produits'
        },
        {
            icon: 'fa-rotate-left',
            title: 'Retour 14 Jours',
            subtitle: 'Satisfait ou remboursé'
        },
        {
            icon: 'fa-lock',
            title: 'Paiement Sécurisé',
            subtitle: 'Transactions protégées'
        }
    ];

    return (
        <section className="py-12 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {badges.map((badge, index) => (
                        <div key={index} className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-3">
                                <i className={`fa-solid ${badge.icon} text-xl text-black`}></i>
                            </div>
                            <h3 className="text-sm md:text-base font-bold text-black mb-1">
                                {badge.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {badge.subtitle}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Social Proof Bar */}
                <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-6">
                        Ils nous font confiance
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:opacity-100 transition-all duration-500 uppercase">
                        <span className="text-lg md:text-xl font-black text-gray-800 tracking-tighter">Omar binfo</span>
                        <span className="text-lg md:text-xl font-black text-gray-800 tracking-tighter italic">Akbali</span>
                        <span className="text-lg md:text-xl font-black text-gray-800 tracking-tighter underline underline-offset-4">Influencers</span>
                        <span className="text-lg md:text-xl font-black text-gray-800 tracking-tighter">SNRT</span>
                    </div>                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
