import React from 'react';

interface FloatingWhatsAppProps {
  siteConfig: {
    phone?: string;
  };
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ siteConfig }) => {
  if (!siteConfig.phone) return null;
  const phone = siteConfig.phone.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300"
      aria-label="Chat on WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-3xl"></i>
    </a>
  );
};

export default FloatingWhatsApp;
