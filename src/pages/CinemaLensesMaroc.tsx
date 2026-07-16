import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';

interface CinemaLensesMarocProps {
  products: Product[];
  onProductClick: (id: number) => void;
}

const CinemaLensesMaroc: React.FC<CinemaLensesMarocProps> = ({ products, onProductClick }) => {
  // Filter for cinema lenses. Adjust logic based on category keywords
  const cinemaLenses = products.filter(
    p => p.name.toLowerCase().includes('t2.0') || 
         p.name.toLowerCase().includes('t1.05') ||
         p.category.toLowerCase().includes('cine') ||
         p.name.toLowerCase().includes('cine')
  );

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>Lentilles Cinéma 7Artisans au Maroc | Objectifs Vidéo Professionnels</title>
        <meta name="description" content="Découvrez notre gamme complète de lentilles cinéma 7Artisans au Maroc. Objectifs professionnels T2.0 et T1.05 pour Sony E, Canon RF, et Nikon Z. Livraison rapide à Casablanca et partout au Maroc." />
        <meta name="keywords" content="lentille cinéma maroc, cine lens maroc, objectifs cinéma 7artisans, materiel video casablanca, 7artisans T2.0 maroc, objectifs monture E video" />
        <link rel="canonical" href="https://gearshop.ma/cinema-lenses-maroc" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Lentilles Cinéma 7Artisans au Maroc
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Élevez vos productions vidéo avec notre sélection exclusive d'objectifs cinéma 7Artisans. Parfaits pour les cinéastes et vidéastes au Maroc, ces objectifs offrent un rendu cinématographique exceptionnel à un prix imbattable.
          </p>
        </div>

        {/* SEO Rich Content Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pourquoi choisir 7Artisans pour vos tournages au Maroc ?</h2>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              Que vous tourniez un court-métrage à Casablanca, un documentaire à Marrakech ou un clip vidéo à Tanger, la gamme d'objectifs cinéma 7Artisans (comme les populaires séries T2.0 et T1.05 Vision) vous garantit une image nette, un bokeh magnifique et une ergonomie pensée pour les professionnels.
            </p>
            <p>
              <strong>Montures disponibles:</strong> Nous proposons des lentilles pour Sony E-Mount, Canon RF, Nikon Z, et MFT. Tous nos objectifs disposent de bagues crantées standard pour l'utilisation de Follow Focus, et d'une conception optique minimisant le focus breathing.
            </p>
            <p>
              En tant que <em>seul revendeur officiel au Maroc</em>, GearShop vous offre une garantie locale, des conseils d'experts, et une livraison sécurisée partout dans le royaume.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4 dark:border-gray-700">
            Notre Collection de Lentilles Cinéma
          </h3>
          {cinemaLenses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cinemaLenses.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chargement des lentilles cinéma... ou aucun produit trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CinemaLensesMaroc;
