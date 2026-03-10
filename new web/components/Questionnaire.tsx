import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Video, Clapperboard, ArrowRight } from 'lucide-react';

const usages = [
  {
    title: "TikTok & Reels",
    desc: "Lumière compacte, RGB et portable pour des vidéos éclatantes sur mobile.",
    icon: <Smartphone className="w-8 h-8 text-pink-500" />,
    bg: "bg-pink-50",
    link: "#collection"
  },
  {
    title: "YouTube & Podcast",
    desc: "Éclairage 3 points professionnel pour un rendu visage parfait et sans ombres.",
    icon: <Video className="w-8 h-8 text-blue-500" />,
    bg: "bg-blue-50",
    link: "#collection"
  },
  {
    title: "Studio & Cinéma",
    desc: "Puissance maximale 300W+ et fidélité de couleur CRI 97+ pour les pros.",
    icon: <Clapperboard className="w-8 h-8 text-orange-500" />,
    bg: "bg-orange-50",
    link: "#collection"
  }
];

const Questionnaire: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Quel est votre usage ?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Sélectionnez votre type de création et nous vous montrerons le matériel idéal pour votre studio au Maroc.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {usages.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group p-8 md:p-12 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                Voir les produits <ArrowRight size={14} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Questionnaire;
