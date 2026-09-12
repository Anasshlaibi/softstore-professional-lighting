import React from 'react';
import DjiOsmoPocket4PShowcase from '../components/Showcase/DjiOsmoPocket4PShowcase';
import { Helmet } from 'react-helmet-async';

export const OsmoPocket4Page: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "DJI Osmo Pocket 4 Pro",
    "alternateName": ["DJI Osmo Pocket 4P", "DJI Pocket 4 Pro", "Osmo Pocket 4 Pro Maroc"],
    "image": [
      "https://gearshop.ma/images/products/dji-osmo-pocket-4-pro-3.png"
    ],
    "description": "Achetez le nouveau DJI Osmo Pocket 4 Pro (Osmo Pocket 4P) au Maroc. Caméra vlog 4K avec capteur CMOS 1 pouce LOFIC (17 stops de dynamique), téléobjectif 60mm f/1.8, D-Log 2 10-bit et stabilisation 3 axes. Meilleur prix garanti au Maroc chez GearShop Casablanca.",
    "brand": {
      "@type": "Brand",
      "name": "DJI"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "24",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Yassine B."
        },
        "datePublished": "2026-08-20",
        "reviewBody": "Excellente caméra compacte pour le vlogging au Maroc. Stabilisation 3 axes impeccable et qualité 4K bluffante.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        }
      }
    ],
    "offers": {
      "@type": "Offer",
      "url": "https://gearshop.ma/dji-osmo-pocket-4-pro",
      "priceCurrency": "MAD",
      "price": "8000",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition",
      "areaServed": {
        "@type": "Country",
        "name": "Maroc"
      },
      "seller": {
        "@type": "Organization",
        "name": "GearShop Maroc",
        "telephone": "+212673011873",
        "url": "https://gearshop.ma"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quel est le prix de la caméra DJI Osmo Pocket 4 Pro au Maroc ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le prix officiel du DJI Osmo Pocket 4 Pro chez GearShop Maroc est de 8 000 DH (Dirhams marocains), avec garantie constructeur de 1 an et support technique inclus."
        }
      },
      {
        "@type": "Question",
        "name": "Où acheter le DJI Osmo Pocket 4 Pro à Casablanca, Rabat, Marrakech et au Maroc ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GearShop Maroc est le premier distributeur spécialisé au Maroc à proposer le DJI Osmo Pocket 4 Pro en précommande avec livraison rapide partout au Maroc (Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, Oujda, etc.) et paiement à la livraison."
        }
      },
      {
        "@type": "Question",
        "name": "Quelles sont les nouveautés du DJI Osmo Pocket 4 Pro par rapport au Pocket 3 ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le DJI Osmo Pocket 4 Pro introduit un système révolutionnaire à double objectif (grand-angle 20mm et téléobjectif moyen 60mm), un capteur 1 pouce CMOS LOFIC avec 17 stops de plage dynamique, l'enregistrement D-Log 2 10-bit et la stabilisation 3 axes avec ActiveTrack 8.0."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>DJI Osmo Pocket 4 Pro Maroc | Prix Officiel 8000 DH &amp; Livraison | GearShop</title>
        <meta
          name="description"
          content="Achetez le nouveau DJI Osmo Pocket 4 Pro au Maroc chez GearShop. Prix officiel 8 000 DH. Capteur CMOS 1 pouce LOFIC, double objectif, D-Log 2, garantie 1 an et livraison 24h partout au Maroc."
        />
        <meta
          name="keywords"
          content="DJI Osmo Pocket 4 Pro, DJI Osmo Pocket 4 Pro Maroc, prix dji osmo pocket 4 maroc, acheter dji osmo pocket maroc, dji pocket 4 maroc, camera vlog 4k maroc, dji casablanca, gearshop maroc"
        />
        <link rel="canonical" href="https://gearshop.ma/dji-osmo-pocket-4-pro" />
        <meta property="og:title" content="DJI Osmo Pocket 4 Pro au Maroc | GearShop Casablanca" />
        <meta
          property="og:description"
          content="Précommandez la caméra DJI Osmo Pocket 4 Pro au Maroc au prix de 8 000 DH. Garantie officielle 1 an et livraison express dans toutes les villes du Maroc."
        />
        <meta property="og:image" content="https://gearshop.ma/images/products/dji-osmo-pocket-4-pro-3.png" />
        <meta property="og:url" content="https://gearshop.ma/dji-osmo-pocket-4-pro" />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <DjiOsmoPocket4PShowcase
        price={8000}
        currency="DH"
        onPreorder={() => window.open('https://wa.me/212673011873?text=Bonjour,%20je%20souhaite%20précommander%20le%20DJI%20Osmo%20Pocket%204%20Pro%20à%208000%20DH', '_blank')}
        onContactWhatsApp={() => window.open('https://wa.me/212673011873?text=Bonjour,%20j%27ai%20une%20question%20sur%20la%20caméra%20DJI%20Osmo%20Pocket%204%20Pro%20au%20Maroc', '_blank')}
      />
    </div>
  );
};

export default OsmoPocket4Page;
