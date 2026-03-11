import React from 'react';
interface FooterProps {
  siteConfig: {
    brandName: string;
    logo: string;
    displayPhone: string;
    phone: string;
    email: string;
  };
}

const Footer: React.FC<FooterProps> = ({ siteConfig }) => {
  return (
    <footer
      id="contact"
      className="bg-white py-16 text-xs border-t border-gray-100"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-500">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                <img 
                  src={siteConfig.logo} 
                  alt={siteConfig.brandName} 
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <h4 className="text-black font-bold text-lg">
                {siteConfig.brandName}
              </h4>
            </div>
            <p className="max-w-md leading-relaxed mb-6">
              L&apos;excellence de l&apos;éclairage. Casablanca, Maroc.
            </p>
          </div>

          <div>
            <h5 className="text-black font-bold mb-4 uppercase tracking-wider">
              Contact
            </h5>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="hover:text-black transition font-medium text-black"
                >
                  {siteConfig.displayPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-black transition"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>Casablanca, Maroc</li>
            </ul>
          </div>

          <div>
            <h5 className="text-black font-bold mb-4 uppercase tracking-wider">
              Suivez-nous
            </h5>
            <div className="flex gap-4 text-lg">
              <a
                href="https://www.instagram.com/spidi8_8/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black transition transform hover:scale-110"
                aria-label="Suivez-nous sur Instagram"
              >
                <i className="fa-brands fa-instagram" aria-hidden="true"></i>
              </a>
              <a
                href="https://wa.me/212673011873"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black transition transform hover:scale-110"
                aria-label="Contactez-nous sur WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-16 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} GearShop.ma. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
