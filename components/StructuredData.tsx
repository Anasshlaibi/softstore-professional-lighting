import React from 'react';
import { Product } from '../App';

interface StructuredDataProps {
  product?: Product | null;
}

const StructuredData: React.FC<StructuredDataProps> = ({ product }) => {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "SoftStore",
    "description": "Premium retailer of high-end videography lighting, studio LEDs, and precision Seven Artisans cinema lenses including full-frame primes and anamorphic lenses.",
    "url": "https://softstore.ma",
    "telephone": "+212673011873",
    "email": "professionalanass@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Casablanca",
      "addressCountry": "MA"
    },
    "sameAs": [
      "https://7artisans.store/"
    ]
  };

  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": `Buy ${product.name} at SoftStore Morocco.`,
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "7Artisans"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://softstore.ma/product/${product.id}`,
      "priceCurrency": "MAD",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.stars.toString(),
      "reviewCount": "15"
    }
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
    </>
  );
};

export default StructuredData;
