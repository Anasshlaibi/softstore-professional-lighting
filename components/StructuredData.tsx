import React from 'react';

const StructuredData: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "GearShop.ma",
    "description": "Premium retailer of high-end videography lighting, studio LEDs, and precision cinema optics including full-frame primes and anamorphic lenses.",
    "url": "https://gearshop.ma",
    "telephone": "+212000000000",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA"
    },
    "sameAs": [
      "https://7artisans.store/"
    ],
    "department": [
      {
        "@type": "Store",
        "name": "Videography Lighting"
      },
      {
        "@type": "Store",
        "name": "Cinema Optics"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData;
