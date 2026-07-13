import React from 'react';
import { Product } from '../App';

interface StructuredDataProps {
  product?: Product | null;
}

// FAQ data â€” exported for use in FAQPage schema
export const faqSchemaData = [
  {
    question: "Quels sont les dÃ©lais de livraison?",
    answer: "Livraison sous 24-48h Ã  Casablanca. Pour les autres villes du Maroc, comptez 2-4 jours ouvrables. Livraison gratuite dÃ¨s 500 DH d'achat."
  },
  {
    question: "Proposez-vous de la location d'Ã©quipement?",
    answer: "Oui! Nous proposons la location pour certains produits. Les tarifs de location sont indiquÃ©s sur les fiches produits. Contactez-nous sur WhatsApp pour plus d'informations."
  },
  {
    question: "Quelle est votre politique de retour?",
    answer: "Retour sous 14 jours si le produit est dans son emballage d'origine et en parfait Ã©tat. Les frais de retour sont Ã  la charge du client sauf en cas de produit dÃ©fectueux."
  },
  {
    question: "Les produits sont-ils garantis?",
    answer: "Tous nos produits bÃ©nÃ©ficient d'une garantie constructeur de 1 an. En cas de problÃ¨me, nous assurons le service aprÃ¨s-vente et les rÃ©parations."
  },
  {
    question: "Quels modes de paiement acceptez-vous?",
    answer: "Nous acceptons: paiement Ã  la livraison (Cash), virement bancaire, et paiement par carte bancaire. Pour les entreprises, nous proposons des facilitÃ©s de paiement."
  },
  {
    question: "Puis-je obtenir des conseils techniques?",
    answer: "Absolument! Notre Ã©quipe d'experts est disponible pour vous conseiller sur le choix de votre matÃ©riel. Contactez-nous via WhatsApp ou email."
  },
  {
    question: "GearShop est-il le seul revendeur d'objectifs 7Artisans au Maroc?",
    answer: "Oui, GearShop est le revendeur exclusif et officiel des objectifs 7Artisans au Maroc, incluant les lentilles cinÃ©ma, les objectifs pour Canon EOS-R, Nikon Z et Sony E Mount."
  },
  {
    question: "Livrez-vous partout au Maroc?",
    answer: "Oui! Nous livrons dans toutes les villes du Maroc: Casablanca, Rabat, Marrakech, FÃ¨s, Tanger, Agadir, MeknÃ¨s et toutes les autres villes. Livraison rapide et sÃ©curisÃ©e."
  },
  {
    question: "Quels objectifs 7Artisans sont compatibles avec mon appareil?",
    answer: "Nous proposons des objectifs 7Artisans pour tous les boÃ®tiers populaires: Canon EOS-R Mount, Nikon Z Mount, Sony E Mount. Contactez-nous avec le modÃ¨le de votre appareil pour une recommandation personnalisÃ©e."
  },
  {
    question: "Effectuez-vous l'installation du matÃ©riel?",
    answer: "Oui, nous proposons un service d'installation et de configuration pour les studios professionnels. Tarifs sur devis."
  }
];

const StructuredData: React.FC<StructuredDataProps> = ({ product }) => {
  // ===== 1. LocalBusiness / Store Schema =====
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": "https://gearshop.ma/#business",
    "name": "GearShop Maroc",
    "alternateName": ["GearShop", "Soft Store Maroc", "GearShop Casablanca"],
    "description": "GearShop est le seul revendeur officiel au Maroc d'objectifs 7Artisans, de lentilles cinÃ©ma professionnelles, et d'objectifs photo pour Canon EOS-R, Nikon Z et Sony E. Livraison rapide dans tout le Maroc depuis Casablanca.",
    "url": "https://gearshop.ma",
    "telephone": "+212673011873",
    "email": "professionalanass@gmail.com",
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
      "https://gearshop.ma/banner_7artisans.jpg",
      "https://gearshop.ma/cine_lens.jpg",
      "https://gearshop.ma/photo_lens.jpg"
    ],
    "logo": "https://gearshop.ma/logo_7artisans.png",
    "sameAs": [
      "https://www.instagram.com/spidi8_8/",
      "https://wa.me/212673011873"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "87",
      "reviewCount": "87"
    },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Mohamed A." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "QualitÃ© exceptionnelle! Mon studio n'a jamais Ã©tÃ© aussi bien Ã©quipÃ©. Les objectifs 7Artisans sont parfaits."
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Fatima Z." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "MatÃ©riel professionnel, livraison rapide et excellent service client. Je recommande vivement!"
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Youssef K." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Les objectifs cinÃ©ma sont parfaits pour mes tournages. QualitÃ© cinÃ©matographique professionnelle!"
      }
    ]
  };

  // ===== 2. FAQPage Schema =====
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

  // ===== 3. Product Schema (when a product is selected) =====
  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `https://gearshop.ma/product/${product.id}`,
    "name": product.name,
    "image": [
      product.image,
      ...(Array.isArray(product.gallery) ? product.gallery.slice(0, 4) : [])
    ].filter(Boolean),
    "description": `Achetez le ${product.name} au Maroc chez GearShop - Seul revendeur officiel 7Artisans au Maroc. Livraison rapide Ã  Casablanca et dans tout le Maroc.`,
    "sku": product.id.toString(),
    "mpn": `7A-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "7Artisans"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "7Artisans"
    },
    "seller": {
      "@id": "https://gearshop.ma/#business"
    },
    "offers": {
      "@type": "Offer",
      "@id": `https://gearshop.ma/product/${product.id}#offer`,
      "url": `https://gearshop.ma/product/${product.id}`,
      "priceCurrency": "MAD",
      "price": product.price.toString(),
      "priceValidUntil": "2027-01-01",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@id": "https://gearshop.ma/#business"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
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
            "maxValue": 4,
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.stars.toString(),
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": "15"
    }
  } : null;

  // ===== 4. BreadcrumbList (when a product is selected) =====
  const breadcrumbSchema = product ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://gearshop.ma/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.category,
        "item": `https://gearshop.ma/?category=${encodeURIComponent(product.category)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://gearshop.ma/product/${product.id}`
      }
    ]
  } : null;

  return (
    <>
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


