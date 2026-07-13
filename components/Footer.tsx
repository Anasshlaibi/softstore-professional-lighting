import React from 'react';

interface FooterProps {
  siteConfig: {
    brandName: string;
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
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      {/* Hidden schema metadata for Google */}
      <meta itemProp="name" content="GearShop Maroc" />
      <meta itemProp="url" content="https://gearshop.ma" />
      <meta itemProp="telephone" content="+212673011873" />
      <meta itemProp="email" content="professionalanass@gmail.com" />
      <meta itemProp="priceRange" content="$$" />
      <meta itemProp="image" content="https://gearshop.ma/banner_7artisans.jpg" />
      <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
        <meta itemProp="addressLocality" content="Casablanca" />
        <meta itemProp="addressCountry" content="MA" />
        <meta itemProp="postalCode" content="20000" />
      </span>
      <span itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates" className="hidden">
        <meta itemProp="latitude" content="33.5731" />
        <meta itemProp="longitude" content="-7.5898" />
      </span>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-500">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-black font-bold text-lg mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bolt"></i>
              <span itemProp="name">{siteConfig.brandName}</span>
            </h4>
            <p className="max-w-md leading-relaxed mb-4">
              Seul revendeur officiel au Maroc d&apos;objectifs{' '}
              <strong className="text-black">7Artisans</strong> pour Canon, Nikon Z et Sony E.
              Lentilles cinéma, filtres et accessoires — Casablanca, Maroc.
            </p>
            <p className="text-xs text-gray-400">
              📍 Casablanca, Maroc &nbsp;·&nbsp; Livraison partout au Maroc
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
                  itemProp="telephone"
                  aria-label="Appeler GearShop Maroc"
                >
                  {siteConfig.displayPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-black transition"
                  itemProp="email"
                  aria-label="Envoyer un email à GearShop Maroc"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="addressLocality">Casablanca</span>,{' '}
                <span itemProp="addressCountry">Maroc</span>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Casablanca,Maroc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition text-blue-500"
                  aria-label="Voir GearShop Maroc sur Google Maps"
                >
                  📍 Voir sur Google Maps
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-black font-bold mb-4 uppercase tracking-wider">
              Suivez-nous
            </h5>
            <div className="flex gap-4 text-lg mb-6">
              <a
                href="https://www.instagram.com/spidi8_8/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black transition transform hover:scale-110"
                aria-label="GearShop Maroc sur Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://wa.me/212673011873"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black transition transform hover:scale-110"
                aria-label="GearShop Maroc sur WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>

            {/* Quick SEO links */}
            <h5 className="text-black font-bold mb-3 uppercase tracking-wider text-xs">
              Objectifs par marque
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#collection" className="hover:text-black transition">Objectifs Canon EOS-R</a></li>
              <li><a href="#collection" className="hover:text-black transition">Objectifs Nikon Z</a></li>
              <li><a href="#collection" className="hover:text-black transition">Objectifs Sony E</a></li>
              <li><a href="#collection" className="hover:text-black transition">Lentilles Cinéma</a></li>
              <li><a href="#collection" className="hover:text-black transition">Filtres 7Artisans</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 gap-3">
          <p>
            &copy; {new Date().getFullYear()} GearShop Maroc. Tous droits réservés.
          </p>
          <p className="text-xs">
            Revendeur officiel <strong className="text-gray-600">7Artisans</strong> au Maroc · Casablanca
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
