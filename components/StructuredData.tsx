import React from 'react';

const StructuredData: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "SoftStore",
    "description": "Premium retailer of high-end videography lighting, studio LEDs, and precision Seven Artisans cinema lenses including full-frame primes and anamorphic lenses.",
    "url": "https://softstore-professional-lighting.vercel.app",
    "telephone": "+212673011873",
    "email": "professionalanass@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Casablanca",
      "addressCountry": "MA"
    },
    "sameAs": [
      "https://7artisans.store/"
    ],
    "department": [
      {
        "@type": "Store",
        "name": "Seven Artisans Cinema Lenses"
      },
      {
        "@type": "Store",
        "name": "Videography Lighting"
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
