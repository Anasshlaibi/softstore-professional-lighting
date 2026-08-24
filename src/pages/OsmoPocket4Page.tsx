import React from 'react';
import DjiOsmoPocket4PShowcase from '../components/Showcase/DjiOsmoPocket4PShowcase';

import { Helmet } from 'react-helmet-async';

export const OsmoPocket4Page: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "DJI Osmo Pocket 4 Pro",
    "image": "https://gearshop.ma/images/products/dji-osmo-pocket-4-pro-3.png",
    "description": "Achetez le nouveau DJI Osmo Pocket 4 Pro (Osmo Pocket 4P) au Maroc. Caméra vlog 4K avec capteur CMOS 1 pouce, double objectif, et stabilisation 3 axes. Meilleur prix Garanti chez GearShop Maroc.",
    "brand": {
      "@type": "Brand",
      "name": "DJI"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://gearshop.ma/dji-osmo-pocket-4-pro",
      "priceCurrency": "MAD",
      "price": "8000",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "GearShop Maroc"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>DJI Osmo Pocket 4 Pro Prix Maroc | GearShop Casablanca</title>
        <meta name="description" content="Achetez le nouveau DJI Osmo Pocket 4 Pro (Osmo Pocket 4P) au Maroc. Capteur CMOS 1 pouce, stabilisation 3 axes, double objectif. Précommandez au meilleur prix chez GearShop Maroc." />
        <meta name="keywords" content="DJI Osmo Pocket 4 Pro, Osmo Pocket 4P, DJI Maroc, acheter DJI Osmo Pocket 4, prix DJI Osmo Pocket 4 Maroc, GearShop Casablanca, caméra vlog 4k" />
        <link rel="canonical" href="https://gearshop.ma/dji-osmo-pocket-4-pro" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <DjiOsmoPocket4PShowcase
        price={8000}
        currency="DH"
        onPreorder={() => window.open('https://wa.me/212673011873?text=Bonjour,%20je%20souhaite%20précommander%20le%20DJI%20Osmo%20Pocket%204%20Pro', '_blank')}
        onContactWhatsApp={() => window.open('https://wa.me/212673011873?text=Bonjour,%20j%27ai%20une%20question%20sur%20le%20DJI%20Osmo%20Pocket%204%20Pro', '_blank')}
      />
    </div>
  );
};

export default OsmoPocket4Page;
