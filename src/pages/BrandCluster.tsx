import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../../App';
import ProductCard from '../../components/ProductCard';
import { useParams } from 'react-router-dom';

interface BrandClusterProps {
  products: Product[];
  onProductClick: (id: number) => void;
}

const BrandCluster: React.FC<BrandClusterProps> = ({ products, onProductClick }) => {
  const { brand } = useParams<{ brand: string }>();
  
  // Format brand name for display and matching
  const formattedBrand = brand 
    ? brand.charAt(0).toUpperCase() + brand.slice(1).replace('-', ' ')
    : 'Brand';

  // Filter products by brand (assuming name or description contains brand)
  const brandProducts = products.filter(p => 
    p.name.toLowerCase().includes(formattedBrand.toLowerCase()) ||
    p.desc.toLowerCase().includes(formattedBrand.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>Objectifs {formattedBrand} au Maroc | GearShop</title>
        <meta name="description" content={`Découvrez notre sélection d'objectifs et d'équipements pour ${formattedBrand} au Maroc. Revendeur officiel 7Artisans. Livraison rapide à Casablanca et partout au Maroc.`} />
        <meta name="keywords" content={`objectif ${formattedBrand} maroc, lentille ${formattedBrand} casablanca, accessoires ${formattedBrand}, gearshop`} />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Objectifs et Équipements pour {formattedBrand}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Optimisez votre boîtier {formattedBrand} avec notre gamme de lentilles cinéma et photo 7Artisans. 
            Conçus pour les professionnels exigeants au Maroc.
          </p>
        </div>

        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brandProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <i className="fa-solid fa-camera text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
             <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
             <p className="text-gray-500 dark:text-gray-400">Nous n'avons pas encore de produits spécifiquement associés à cette marque en ligne. Contactez-nous pour plus d'informations.</p>
          </div>
        )}
        
        {/* SEO Content block for this brand */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pourquoi choisir 7Artisans pour votre {formattedBrand} ?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Les optiques 7Artisans offrent un rapport qualité-prix inégalé pour les utilisateurs de {formattedBrand}. Que vous fassiez de la photographie de rue, du portrait ou de la production vidéo cinématographique, ces objectifs entièrement manuels vous redonnent le contrôle total sur votre image.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              GearShop est le premier distributeur officiel au Maroc, garantissant un stock local à Casablanca, une garantie constructeur, et un service après-vente dédié.
            </p>
        </div>
      </div>
    </div>
  );
};

export default BrandCluster;
