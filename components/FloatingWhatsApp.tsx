import React from 'react';
import { recordWhatsAppClick } from '../src/services/attributionTracker';
import { trackContact } from '../src/services/metaCapiService';

interface FloatingWhatsAppProps {
  siteConfig: {
    phone?: string;
  };
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ siteConfig }) => {
  if (!siteConfig.phone) return null;
  const phone = siteConfig.phone.replace(/\D/g, '');

  const handleClick = () => {
    recordWhatsAppClick();
    trackContact('WhatsApp');
  };

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-slate-900/95 hover:bg-red-600 text-white border border-slate-700/80 hover:border-red-500 w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all duration-300 group"
      aria-label="Contacter GearShop sur WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-2xl sm:text-3xl text-red-500 group-hover:text-white transition-colors duration-200"></i>
    </a>
  );
};

export default FloatingWhatsApp;
