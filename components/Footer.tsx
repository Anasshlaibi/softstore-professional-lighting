import React from 'react';
import { Link } from 'react-router-dom';

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
      className="bg-white dark:bg-gray-950 py-16 text-xs border-t border-gray-100 dark:border-gray-850 transition-colors"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      {/* Hidden schema metadata for Google */}
      <meta itemProp="name" content="GearShop Maroc" />
      <meta itemProp="url" content="https://gearshop.ma" />
      <meta itemProp="telephone" content="+212673011873" />
      <meta itemProp="email" content="contact@gearshop.ma" />
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-gray-500 dark:text-gray-400">
          {/* Col 1: Store Intro */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-black dark:text-white font-black text-xl flex items-center gap-2 tracking-tight">
              <i className="fa-solid fa-bolt text-red-600"></i>
              <span>{siteConfig.brandName}</span>
            </Link>
            <p className="leading-relaxed max-w-sm text-gray-600 dark:text-gray-300">
              Distributeur officiel et revendeur de référence au Maroc pour les objectifs photo &amp; cinéma{' '}
              <strong className="text-black dark:text-white font-bold">7Artisans</strong>, les filtres optiques{' '}
              <strong className="text-black dark:text-white font-bold">K&amp;F Concept</strong>, le matériel{' '}
              <strong className="text-black dark:text-white font-bold">DJI</strong> et l'éclairage studio professionnel.
            </p>
            <div className="pt-2 text-xs text-gray-400 dark:text-gray-500 flex flex-col gap-1">
              <span>📍 Showroom à Casablanca · Livraison express dans tout le Maroc</span>
              <span>🔒 Matériel 100% original · Garantie constructeur 1 an</span>
            </div>

            <div className="flex gap-4 text-lg pt-2">
              <a
                href="https://www.instagram.com/spidi8_8/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black dark:hover:text-white transition transform hover:scale-110"
                aria-label="GearShop Maroc sur Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://wa.me/212673011873"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-emerald-500 transition transform hover:scale-110"
                aria-label="GearShop Maroc sur WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="text-black dark:text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Catégories
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link to="/categorie/objectifs" className="hover:text-red-600 transition">
                  Objectifs Photo &amp; Cinéma
                </Link>
              </li>
              <li>
                <Link to="/categorie/filtres" className="hover:text-red-600 transition">
                  Filtres ND &amp; Black Mist
                </Link>
              </li>
              <li>
                <Link to="/categorie/eclairage-studio" className="hover:text-red-600 transition">
                  Éclairage Studio LED
                </Link>
              </li>
              <li>
                <Link to="/categorie/eclairage-portable" className="hover:text-red-600 transition">
                  Éclairage Nomade &amp; RGB
                </Link>
              </li>
              <li>
                <Link to="/categorie/accessoires" className="hover:text-red-600 transition">
                  Accessoires &amp; Bagues
                </Link>
              </li>
              <li>
                <Link to="/categorie/occasion" className="hover:text-red-600 transition">
                  Matériel d'Occasion Garanti
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Brands */}
          <div>
            <h5 className="text-black dark:text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Marques &amp; Montures
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link to="/marque/7artisans" className="hover:text-red-600 transition font-medium">
                  7Artisans Maroc (Officiel)
                </Link>
              </li>
              <li>
                <Link to="/marque/kf-concept" className="hover:text-red-600 transition">
                  K&amp;F Concept Maroc
                </Link>
              </li>
              <li>
                <Link to="/marque/sony" className="hover:text-red-600 transition">
                  Sony E-Mount &amp; FX
                </Link>
              </li>
              <li>
                <Link to="/marque/canon" className="hover:text-red-600 transition">
                  Canon RF &amp; EOS R
                </Link>
              </li>
              <li>
                <Link to="/marque/nikon" className="hover:text-red-600 transition">
                  Nikon Z-Mount
                </Link>
              </li>
              <li>
                <Link to="/marque/panasonic" className="hover:text-red-600 transition">
                  Panasonic Lumix (L / M43)
                </Link>
              </li>
              <li>
                <Link to="/marque/fujifilm" className="hover:text-red-600 transition">
                  Fujifilm X-Mount
                </Link>
              </li>
              <li>
                <Link to="/marque/dji" className="hover:text-red-600 transition">
                  DJI Osmo &amp; Caméras
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Guides & Support */}
          <div>
            <h5 className="text-black dark:text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Guides d'Achat
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link to="/guide/filmmakers" className="hover:text-red-600 transition">
                  Guide pour Cinéastes
                </Link>
              </li>
              <li>
                <Link to="/guide/videographers" className="hover:text-red-600 transition">
                  Guide pour Vidéastes
                </Link>
              </li>
              <li>
                <Link to="/guide/content-creators" className="hover:text-red-600 transition">
                  Guide Vlogs &amp; Créateurs
                </Link>
              </li>
              <li>
                <Link to="/guide/photographers" className="hover:text-red-600 transition">
                  Guide Photographie
                </Link>
              </li>
              <li>
                <Link to="/camera-maroc" className="hover:text-red-600 transition font-medium">
                  Caméras &amp; Vidéo Maroc
                </Link>
              </li>
              <li>
                <Link to="/cinema-lenses-maroc" className="hover:text-red-600 transition">
                  Lentilles Cinéma Maroc
                </Link>
              </li>
              <li>
                <Link to="/magasin-casablanca" className="hover:text-red-600 transition">
                  Magasin à Casablanca
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-red-600 transition">
                  À Propos &amp; Partenaires
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300">
            <a href={`tel:${siteConfig.phone}`} className="hover:text-black dark:hover:text-white flex items-center gap-2">
              <i className="fa-solid fa-phone text-red-600"></i>
              <span>{siteConfig.displayPhone}</span>
            </a>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-black dark:hover:text-white flex items-center gap-2">
              <i className="fa-solid fa-envelope text-red-600"></i>
              <span>{siteConfig.email}</span>
            </a>
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-clock text-gray-400"></i>
              <span>Lun - Sam : 09:00 - 20:00</span>
            </span>
          </div>

          <div className="text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} GearShop Maroc. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
