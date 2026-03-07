import React from 'react';
import trendData from '../src/data/seo_trends.json';

const TechnicalSEO: React.FC = () => {
  const trend = trendData;

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <details className="group">
          <summary className="list-none cursor-pointer text-[12px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 outline-none">
            <i className="fa-solid fa-chevron-right group-open:rotate-90 transition-transform duration-200"></i>
            Spécifications Techniques & Guide d'Achat
          </summary>
          
          <div className="mt-6 text-[13px] text-gray-500 leading-relaxed max-w-4xl animate-fade-in space-y-6">
            {/* Auto-Pilot Generated Content Section */}
            {trend && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-amber-900 font-bold text-base flex items-center gap-2">
                    <i className="fa-solid fa-fire text-orange-500"></i> {trend.title}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded">
                    Mise à jour: {trend.date}
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {trend.content}
                </p>
              </div>
            )}

            <div className="prose prose-sm prose-gray">
              <h3 className="text-gray-800 font-bold text-base mb-3">Choisir son Projecteur LED 300W au Maroc : Le Guide Complet</h3>
              <p>
                L'acquisition d'un <strong>Projecteur LED 300W prix Maroc</strong> est une étape cruciale pour tout vidéaste souhaitant passer au niveau professionnel. Contrairement aux éclairages classiques, les puces COB (Chip on Board) modernes offrent une puissance lumineuse exceptionnelle avec une consommation électrique maîtrisée. Pour un studio à Casablanca ou Rabat, la gestion de la chaleur est primordiale. Nos projecteurs intègrent des systèmes de ventilation ultra-silencieux (moins de 30dB), garantissant que vos prises de son ne soient jamais perturbées.
              </p>
              <p>
                La puissance brute ne fait pas tout ; la qualité chromatique est ce qui différencie un amateur d'un pro. En recherchant le <a href="#collection" className="text-black font-bold underline">300W LED</a> idéal, vérifiez toujours l'indice CRI (Color Rendering Index) et le TLCI. Chez GearShop.ma, nous ne proposons que du matériel affichant un CRI supérieur à 97, assurant des teintes de peau naturelles et une fidélité des couleurs parfaite pour le montage vidéo.
              </p>

              <h3 className="text-gray-800 font-bold text-base mt-6 mb-3">L'avantage des Softbox ZSYB à Casablanca</h3>
              <p>
                Utiliser une <a href="#collection" className="text-black font-bold underline">Softbox ZSYB Casablanca</a> permet de transformer une source de lumière ponctuelle et dure en une nappe de lumière douce et enveloppante. C'est l'accessoire indispensable pour le portrait ou les interviews YouTube. Nos boîtes à lumière sont conçues avec des matériaux réfléchissants haute performance et des diffuseurs doubles couches pour éliminer les points chauds. Que vous travailliez dans un petit studio en centre-ville ou un grand plateau à <strong>Bouskoura</strong>, la modularité des montures Bowens de nos Softbox permet une compatibilité totale avec toute notre gamme de projecteurs.
              </p>

              <h3 className="text-gray-800 font-bold text-base mt-6 mb-3">L'Innovation RGB Cube Light Video pour les Créateurs TikTok</h3>
              <p>
                Le <a href="#collection" className="text-black font-bold underline">RGB Cube Light Video</a> a révolutionné la création de contenu courte durée. Ces lampes compactes permettent de créer des ambiances colorées instantanées sans encombrer l'espace. Avec un contrôle via smartphone, vous pouvez synchroniser plusieurs unités pour créer des effets de transition dynamiques. Si vous cherchez à acheter un <a href="#collection" className="text-black font-bold underline">RGB Cube</a>, privilégiez les modèles avec batterie intégrée pour une mobilité totale lors de vos tournages en extérieur au Maroc.
              </p>

              <h3 className="text-gray-800 font-bold text-base mt-6 mb-3">Matériel Studio Photo Rabat : Disponibilité et SAV</h3>
              <p>
                Le marché du <strong>matériel studio photo Rabat</strong> exige non seulement de la performance, mais aussi une fiabilité à long terme. C'est pourquoi GearShop.ma s'engage sur le <strong>meilleur prix éclairage vidéo</strong> tout en offrant une garantie locale. Nous comprenons les besoins des photographes de mariage et des agences de communication qui ne peuvent se permettre une panne en plein shooting. Notre stock inclut également des références prestigieuses comme le <strong>Canon R6 Mark II stock</strong>, permettant une synergie parfaite entre votre capteur et votre éclairage.
              </p>

              <h3 className="text-gray-800 font-bold text-base mt-6 mb-3">Vente matériel audiovisuel Bouskoura : Pourquoi nous faire confiance ?</h3>
              <p>
                La <strong>vente matériel audiovisuel Bouskoura</strong> s'est développée autour d'une exigence : la précision technique. Nos produits supportent les modes Bi-color (ajustables de 2700K à 6500K) permettant de matcher la lumière naturelle du jour ou l'ambiance chaleureuse des intérieurs marocains. Chaque kit vendu subit des tests rigoureux de stabilité de tension pour s'adapter parfaitement aux réseaux électriques locaux. En choisissant GearShop, vous investissez dans du matériel durable, évolutif et soutenu par une expertise technique locale passionnée par l'image.
              </p>
              
              <p className="mt-4 italic">
                Mots-clés ciblés pour l'indexation : Éclairage cinéma Maroc, Projecteur COB professionnel, Kit studio YouTube Casablanca, Accessoires caméra Rabat, Éclairage LED professionnel prix, Distributeur ZSYB Afrique du Nord.
              </p>
            </div>
          </div>
        </details>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default TechnicalSEO;
