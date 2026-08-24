import React from 'react';
import { Product } from '../App';
import { generateProductSEOPackage } from '../src/utils/seoGenerator';

interface ProductSEOSectionProps {
  product: Product;
  allProducts?: Product[];
  onSelectProduct?: (id: number) => void;
}

export const ProductSEOSection: React.FC<ProductSEOSectionProps> = ({
  product,
  allProducts = [],
  onSelectProduct,
}) => {
  const seoPackage = generateProductSEOPackage(product, allProducts);

  return (
    <section aria-label="Informations Produit & SEO" className="space-y-8 mt-6">
      {/* 1. INTRODUCTION & POINTS FORTS */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1 block">
            PRÉSENTATION OFFICIELLE GEARSHOP
          </span>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            {product.name}
          </h3>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-2">
            {seoPackage.introduction}
          </p>
        </div>

        {/* Highlights Grid */}
        {seoPackage.highlights.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-star text-amber-500"></i> Points forts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {seoPackage.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-xs flex flex-col justify-center"
                >
                  <span className="text-[11px] font-medium text-gray-500 block truncate">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 block truncate mt-0.5">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. TECHNICAL SPECIFICATIONS TABLE */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-red-600"></i> Caractéristiques techniques
          </h3>
          <span className="text-xs text-gray-400 font-medium">Spécifications officielles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <tbody>
              {seoPackage.specifications.map((spec, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition border-b border-gray-100 last:border-b-0">
                  <td className="font-bold bg-gray-50/60 p-3.5 w-1/3 text-gray-700 text-xs md:text-sm">
                    {spec.label}
                  </td>
                  <td className="p-3.5 text-gray-800 font-medium text-xs md:text-sm">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. WHO IS THIS PRODUCT FOR & USE CASES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-user-check text-red-600"></i> Pour quel usage ?
            </h3>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              {seoPackage.targetAudience}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-emerald-600"></i> Idéal pour
            </h3>
            <div className="flex flex-wrap gap-2">
              {seoPackage.useCases.map((useCase, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1.5 rounded-full text-xs font-bold"
                >
                  ✓ {useCase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPATIBILITY SEO & INTERNAL LINKS */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-link text-red-600"></i> Compatibilité & Accessoires
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {seoPackage.compatibilityText}
          </p>
        </div>

        {seoPackage.compatibilityLink && (
          <a
            href={seoPackage.compatibilityLink.url}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 inline-flex items-center gap-2"
          >
            {seoPackage.compatibilityLink.label}
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        )}
      </div>

      {/* 5. RECOMMENDED / RELATED PRODUCTS */}
      {seoPackage.relatedProducts.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-boxes-packing text-purple-600"></i> Produits associés &amp; recommandés
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {seoPackage.relatedProducts.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct && onSelectProduct(rel.id)}
                className="group border border-gray-200/80 rounded-xl p-3 hover:border-black transition cursor-pointer flex flex-col justify-between bg-white"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-2 mb-2 flex items-center justify-center">
                  <img
                    src={rel.image}
                    alt={`${rel.name} - GearShop Maroc`}
                    title={`${rel.name} - GearShop Maroc`}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                    {rel.name}
                  </h4>
                  <span className="text-xs font-black text-black block mt-2">
                    {rel.price > 0 ? `${rel.price.toLocaleString('fr-MA')} DH` : 'Sur demande'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PRODUCT-SPECIFIC FAQ ACCORDION */}
      {seoPackage.faqs.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-circle-question text-red-600"></i> Questions fréquentes sur {product.name}
          </h3>

          <div className="space-y-3">
            {seoPackage.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-gray-50/70 rounded-xl border border-gray-200/80 overflow-hidden transition open:bg-white open:border-red-400"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-bold text-xs md:text-sm text-gray-900 group-open:text-red-600">
                  <span>{faq.question}</span>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductSEOSection;
