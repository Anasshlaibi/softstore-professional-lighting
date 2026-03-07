import React from 'react';

const Comparison: React.FC = () => {
  return (
    <section id="comparison" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-black mb-4">
            Pourquoi GearShop.ma ?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Comparaison de nos solutions d'éclairage ZSYB face aux alternatives classiques du marché marocain.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-left bg-white border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 md:p-6 font-bold">Caractéristiques</th>
                <th className="p-4 md:p-6 font-bold text-center bg-gray-900 italic">GearShop (ZSYB)</th>
                <th className="p-4 md:p-6 font-bold text-center">Éclairage Basique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 md:p-6 font-medium">Qualité de Lumière (CRI)</td>
                <td className="p-4 md:p-6 text-center bg-green-50 text-green-700 font-bold">97+ (Couleurs Réelles)</td>
                <td className="p-4 md:p-6 text-center text-gray-500">80-85 (Teint blafard)</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium">Chaleur & Bruit</td>
                <td className="p-4 md:p-6 text-center bg-green-50 text-green-700 font-bold">Ventilation Silencieuse</td>
                <td className="p-4 md:p-6 text-center text-gray-500">Chauffage excessif</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium">Contrôle App (Bluetooth)</td>
                <td className="p-4 md:p-6 text-center bg-green-50 text-green-700 font-bold">Oui (iOS / Android)</td>
                <td className="p-4 md:p-6 text-center text-gray-500">Manuel uniquement</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium">Garantie & SAV</td>
                <td className="p-4 md:p-6 text-center bg-green-50 text-green-700 font-bold">1 An à Casablanca</td>
                <td className="p-4 md:p-6 text-center text-gray-500">Aucune garantie</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium">Usage TikTok / Reels</td>
                <td className="p-4 md:p-6 text-center bg-green-50 text-green-700 font-bold">Optimisé (Modes FX)</td>
                <td className="p-4 md:p-6 text-center text-gray-500">Lumière fixe brute</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 p-8 bg-black text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold mb-2">Besoin d'un conseil personnalisé ?</h4>
            <p className="text-gray-400 text-sm">Nos experts vous guident pour choisir le kit idéal selon votre espace.</p>
          </div>
          <a 
            href="#collection" 
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition whitespace-nowrap"
          >
            Voir les Kits Créateurs
          </a>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
