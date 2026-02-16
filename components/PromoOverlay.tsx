import React from 'react';

interface Promo {
  image: string;
  title: string;
  code: string;
}

interface PromoOverlayProps {
  siteConfig: { promo: Promo };
  onClose: () => void;
}

const PromoOverlay: React.FC<PromoOverlayProps> = ({ siteConfig, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(siteConfig.promo.code);
    alert('Code promo copié !');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row max-h-[85vh] md:max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white rounded-full p-2 transition text-black shadow-sm"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Image Side */}
        <div className="h-48 md:h-auto md:w-1/2 relative bg-gray-100 shrink-0">
          <img
            src={siteConfig.promo.image}
            alt="Promo"
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 md:p-14 flex flex-col justify-center items-start text-left bg-white relative z-10 overflow-y-auto">
          <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
            Offre Spéciale
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-black mb-3 leading-tight"
            dangerouslySetInnerHTML={{
              __html: siteConfig.promo.title.replace(/\n/g, '<br>'),
            }}
          ></h2>
          <p className="text-gray-500 text-sm md:text-lg mb-6">
            Profitez d&apos;une réduction exclusive sur tout le matériel d&apos;éclairage.
          </p>

          <div
            className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center mb-6 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleCopy}
          >
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Votre Code Promo
            </span>
            <div className="text-2xl md:text-3xl font-mono font-bold text-black tracking-wider">
              {siteConfig.promo.code}
            </div>
            <span className="text-[10px] text-green-600 font-bold mt-1">
              Cliquez pour copier
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-xl text-sm md:text-base"
          >
            Profiter de l&apos;offre
          </button>
        </div>
      </div>
      <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default PromoOverlay;
