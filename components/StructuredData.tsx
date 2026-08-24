import React from 'react';
import { Product } from '../App';

interface StructuredDataProps {
  product?: Product | null;
  allProducts?: Product[];
}

// Comprehensive FAQ data — exported for use across FAQ component and schema
export const faqSchemaData = [
  {
    question: "Quels sont les délais et tarifs de livraison au Maroc ?",
    answer: "Livraison sous 24-48h à Casablanca. Pour les autres villes du Maroc (Rabat, Marrakech, Tanger, Fès, Agadir, etc.), comptez 2-4 jours ouvrables. La livraison est gratuite dès 500 DH d'achat."
  },
  {
    question: "GearShop est-il le revendeur officiel 7Artisans et K&F Concept au Maroc ?",
    answer: "Oui, GearShop est le revendeur agréé et importateur direct au Maroc des objectifs 7Artisans (autofocus et cinéma) ainsi que des filtres optiques professionnels K&F Concept. Tous nos produits sont 100% originaux avec garantie constructeur."
  },
  {
    question: "Les produits bénéficient-ils d'une garantie ?",
    answer: "Tous nos équipements neufs bénéficient d'une garantie constructeur de 1 an avec service après-vente et support technique basés localement à Casablanca."
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons le paiement à la livraison en espèces (Cash on Delivery), le virement bancaire sécurisé, et le paiement par carte bancaire. Des factures professionnelles sont fournies."
  },
  {
    question: "Quels objectifs 7Artisans sont compatibles avec mon boîtier ?",
    answer: "Nous disposons d'optiques pour toutes les montures majeures : Sony E-Mount, Canon RF, Nikon Z, Panasonic Lumix L-Mount, Fujifilm X-Mount et Micro 4/3. Contactez nos conseillers sur WhatsApp pour valider la compatibilité exacte de votre modèle."
  },
  {
    question: "Proposez-vous du matériel d'occasion ou de la location ?",
    answer: "Oui, nous disposons d'une sélection de matériel d'occasion certifié et testé par nos techniciens, ainsi que d'options de location pour tournages vidéo et cinéma au Maroc."
  },
  {
    question: "Comment choisir entre un filtre ND variable et un filtre Black Mist ?",
    answer: "Le filtre ND variable permet de contrôler la quantité de lumière pour conserver une vitesse d'obturation cinématographique (règle des 180°). Le filtre Black Mist adoucit les hautes lumières et réduit le contraste numérique pour un rendu organique et cinématographique."
  }
];

const StructuredData: React.FC<StructuredDataProps> = ({ product, allProducts }) => {
  const baseUrl = "https://gearshop.ma";

  // ===== 1. WebSite Schema with SearchAction =====
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "GearShop Maroc",
    "description": "Boutique officielle de matériel photo, objectifs 7Artisans, lentilles cinéma, filtres K&F Concept et éclairage professionnel au Maroc.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["fr-MA"]
  };

  // ===== 2. Organization / Store / LocalBusiness Schema =====
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": `${baseUrl}/#business`,
    "name": "GearShop Maroc",
    "alternateName": ["GearShop", "Soft Store Maroc", "GearShop Casablanca"],
    "description": "GearShop est distributeur et revendeur au Maroc d'objectifs photo & cinéma 7Artisans, de filtres optiques K&F Concept, de matériel DJI et d'éclairage studio professionnel. Showroom à Casablanca et livraison partout au Maroc.",
    "knowsAbout": [
      "Sony E-Mount Lenses",
      "Canon RF Lenses",
      "Nikon Z Lenses",
      "Lumix L-Mount Lenses",
      "Fujifilm X-Mount Lenses",
      "7Artisans Cinema Lenses",
      "K&F Concept Variable ND Filters",
      "DJI Osmo Pocket",
      "Studio Lighting & LED Panels",
      "Cameras & Filmmaking Equipment Morocco"
    ],
    "url": baseUrl,
    "telephone": "+212673011873",
    "email": "contact@gearshop.ma",
    "foundingDate": "2019",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Casablanca",
      "addressLocality": "Casablanca",
      "addressRegion": "Casablanca-Settat",
      "addressCountry": "MA",
      "postalCode": "20000"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.5731",
      "longitude": "-7.5898"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      }
    ],
    "priceRange": "$$",
    "currenciesAccepted": "MAD",
    "paymentAccepted": "Cash, Virement Bancaire, Carte Bancaire",
    "areaServed": {
      "@type": "Country",
      "name": "Maroc"
    },
    "image": [
      `${baseUrl}/banner_7artisans.jpg`,
      `${baseUrl}/cine_lens.jpg`,
      `${baseUrl}/photo_lens.jpg`
    ],
    "logo": `${baseUrl}/logo.png`,
    "sameAs": [
      "https://www.instagram.com/spidi8_8/",
      "https://wa.me/212673011873"
    ]
  };

  // ===== 3. FAQPage Schema =====
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSchemaData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const slugify = (text: string) => {
    return text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';
  };

  const getProductBrand = (p: Product): string | undefined => {
    if (p.brand && p.brand.trim()) return p.brand.trim();
    const t = `${p.name || ''} ${p.category || ''} ${p.desc || ''}`.toLowerCase();
    if (t.includes('k&f') || t.includes('concept') || t.includes('kf')) return 'K&F Concept';
    if (t.includes('godox')) return 'Godox';
    if (t.includes('sony')) return 'Sony';
    if (t.includes('canon')) return 'Canon';
    if (t.includes('nikon')) return 'Nikon';
    if (t.includes('dji')) return 'DJI';
    if (t.includes('fuji') || t.includes('fujifilm')) return 'Fujifilm';
    if (t.includes('lumix') || t.includes('panasonic')) return 'Panasonic';
    if (t.includes('rode') || t.includes('røde')) return 'Røde';
    if (t.includes('sandisk')) return 'SanDisk';
    if (t.includes('7artisans')) return '7Artisans';
    return undefined;
  };

  const resolvedBrand = product ? getProductBrand(product) : undefined;
  const productUrl = product ? `${baseUrl}/product/${product.id}-${slugify(product.name)}` : '';

  // ===== 4. Product Schema (when a product is selected) =====
  const isPreorder = product?.isPreorder === true;
  const hasRealPrice = product && product.price && product.price > 0;

  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": productUrl,
    "name": product.name,
    "image": [
      product.image,
      ...(Array.isArray(product.gallery) ? product.gallery.slice(0, 4) : [])
    ].filter(Boolean),
    "description": product.meta_description || product.desc || `Achetez ${product.name} chez GearShop Maroc. Produit garanti 1 an avec livraison rapide à Casablanca et partout au Maroc.`,
    ...(resolvedBrand ? {
      "brand": {
        "@type": "Brand",
        "name": resolvedBrand
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      "url": productUrl,
      "priceCurrency": "MAD",
      ...(hasRealPrice ? { "price": product.price.toString() } : {}),
      "availability": isPreorder 
        ? "https://schema.org/PreOrder" 
        : product.inStock 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
      "itemCondition": (product.category || '').toLowerCase().includes('occasion') 
        ? "https://schema.org/UsedCondition" 
        : "https://schema.org/NewCondition",
      "seller": {
        "@id": `${baseUrl}/#business`
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": (product.price || 0) >= 500 ? "0" : "35",
          "currency": "MAD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "MA"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "MA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/OriginalShippingFees"
      }
    },
    "isRelatedTo": allProducts ? allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4)
      .map(p => ({
        "@type": "Product",
        "name": p.name,
        "url": `${baseUrl}/product/${p.id}-${slugify(p.name)}`
      })) : []
  } : null;

  // ===== 5. BreadcrumbList Schema =====
  const breadcrumbSchema = product ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.category || "Matériel",
        "item": `${baseUrl}/categorie/${slugify(product.category || 'objectifs')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl
      }
    ]
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
};

export default StructuredData;
