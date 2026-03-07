import React from 'react';

const TrustBanner: React.FC = () => {
  return (
    <div className="bg-black text-white py-4 border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
              <i className="fa-solid fa-truck-fast text-green-400"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">Livraison</p>
              <p className="text-xs font-bold">24h à Casablanca</p>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
              <i className="fa-solid fa-hand-holding-dollar text-amber-400"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">Paiement</p>
              <p className="text-xs font-bold">À la livraison (Cash)</p>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
              <i className="fa-solid fa-user-shield text-blue-400"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">Garantie</p>
              <p className="text-xs font-bold">1 An & SAV Local</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBanner;
