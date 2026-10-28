import React from 'react';
import DjiOsmoPocket4PShowcase from '../components/Showcase/DjiOsmoPocket4PShowcase';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';

interface OsmoPocket4PageProps {
  products?: Product[];
}

export const OsmoPocket4Page: React.FC<OsmoPocket4PageProps> = ({ products = [] }) => {
  const canonicalUrl = 'https://www.gearshop.ma/dji-osmo-pocket-4-pro';
  const productImage = 'https://www.gearshop.ma/images/products/dji-osmo-pocket-4-pro.webp';
  const product = products.find(item => {
    const name = (item.name || '').toLowerCase();
    return name.includes('osmo pocket 4') || name.includes('pocket 4 pro');
  });
  const livePrice = product?.price && Number(product.price) > 0 ? Number(product.price) : undefined;
  const priceText = livePrice ? `${livePrice.toLocaleString('fr-MA')} DH` : 'à confirmer dans le catalogue';
  // This landing page advertises a reservation flow. Keep the visible CTA,
  // Product markup and Merchant feed aligned until physical stock is confirmed.
  const availability = 'https://schema.org/PreOrder';

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "DJI Osmo Pocket 4P (Pro)",
    "alternateName": ["DJI Osmo Pocket 4P", "DJI Pocket 4 Pro", "Osmo Pocket 4 Pro Maroc"],
    "image": [
      productImage
    ],
    "description": "Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison à Casablanca, Rabat, Marrakech et partout au Maroc.",
    "brand": {
      "@type": "Brand",
      "name": "DJI"
    },
    "offers": {
      "@type": "Offer",
      "@id": `${canonicalUrl}#offer`,
      "url": canonicalUrl,
      "priceCurrency": "MAD",
      ...(livePrice ? { "price": livePrice } : {}),
      "priceValidUntil": "2027-12-31",
      "availability": availability,
      "itemCondition": "https://schema.org/NewCondition",
      "areaServed": {
        "@type": "Country",
        "name": "Maroc"
      },
      "seller": {
        "@type": "Organization",
        "name": "GearShop Maroc",
        "telephone": "+212673011873",
        "url": "https://www.gearshop.ma"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "MAD" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "MA" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "MA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnInStore",
        "returnFees": "https://schema.org/FreeReturn"
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
          "text": `Le prix actuel du DJI Osmo Pocket 4 Pro chez GearShop Maroc est ${priceText}. Consultez la disponibilité du catalogue avant de commander.`
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
        <title>DJI Osmo Pocket 4P (Pro) au Maroc – Prix &amp; Précommande | GearShop</title>
        <meta
          name="description"
          content="Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison à Casablanca, Rabat, Marrakech et partout au Maroc."
        />
        <meta
          name="keywords"
          content="DJI Osmo Pocket 4P, DJI Osmo Pocket 4 Pro Maroc, prix DJI Osmo Pocket 4P Maroc, acheter DJI Pocket 4P, caméra vlog 4K Maroc, DJI Casablanca, GearShop Maroc"
        />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="fr-MA" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <meta property="og:title" content="DJI Osmo Pocket 4P (Pro) au Maroc | GearShop" />
        <meta
          property="og:description"
          content="Découvrez le DJI Osmo Pocket 4P au Maroc chez GearShop. Prix en MAD, garantie 1 an et livraison nationale."
        />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:alt" content="DJI Osmo Pocket 4P (Pro) au Maroc" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJI Osmo Pocket 4P (Pro) au Maroc | GearShop" />
        <meta name="twitter:description" content="Prix en MAD, précommande, garantie 1 an et livraison au Maroc." />
        <meta name="twitter:image" content={productImage} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <DjiOsmoPocket4PShowcase
        price={livePrice}
        currency="DH"
        onPreorder={() => window.open(`https://wa.me/212673011873?text=${encodeURIComponent(`Bonjour, je souhaite connaître le prix actuel et précommander le DJI Osmo Pocket 4 Pro (${priceText}).`)}`, '_blank')}
        onContactWhatsApp={() => window.open('https://wa.me/212673011873?text=Bonjour,%20j%27ai%20une%20question%20sur%20la%20caméra%20DJI%20Osmo%20Pocket%204%20Pro%20au%20Maroc', '_blank')}
      />
    </div>
  );
};

export default OsmoPocket4Page;
