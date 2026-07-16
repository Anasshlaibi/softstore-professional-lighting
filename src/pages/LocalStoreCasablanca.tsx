import React from 'react';
import { Helmet } from 'react-helmet-async';

const LocalStoreCasablanca: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>Magasin Matériel Photo & Vidéo Casablanca | GearShop Maroc</title>
        <meta name="description" content="Visitez GearShop à Casablanca. Le seul magasin certifié revendeur officiel 7Artisans au Maroc. Découvrez nos objectifs cinéma, photo, et accessoires professionnels." />
        <meta name="keywords" content="magasin materiel photo casablanca, revendeur 7artisans maroc, boutique photo casablanca, acheter objectif casablanca, gearshop maroc, materiel video" />
        <link rel="canonical" href="https://gearshop.ma/magasin-casablanca" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Votre Magasin Photo & Vidéo à Casablanca
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Passez nous voir pour tester en direct notre large gamme d'objectifs 7Artisans, lentilles cinéma et équipements de studio professionnels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          {/* Info Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
              Coordonnées et Horaires
            </h2>
            
            <div className="flex items-start text-gray-700 dark:text-gray-300">
              <i className="fa-solid fa-location-dot mt-1 w-6 text-indigo-600 dark:text-indigo-400"></i>
              <div>
                <p className="font-semibold">Adresse :</p>
                <p>Quartier Centre-Ville<br/>Casablanca 20000, Maroc</p>
              </div>
            </div>

            <div className="flex items-start text-gray-700 dark:text-gray-300">
              <i className="fa-solid fa-phone mt-1 w-6 text-indigo-600 dark:text-indigo-400"></i>
              <div>
                <p className="font-semibold">Téléphone / WhatsApp :</p>
                <p>+212 673 011 873</p>
              </div>
            </div>

            <div className="flex items-start text-gray-700 dark:text-gray-300">
              <i className="fa-solid fa-envelope mt-1 w-6 text-indigo-600 dark:text-indigo-400"></i>
              <div>
                <p className="font-semibold">Email :</p>
                <p>professionalanass@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start text-gray-700 dark:text-gray-300">
              <i className="fa-solid fa-clock mt-1 w-6 text-indigo-600 dark:text-indigo-400"></i>
              <div>
                <p className="font-semibold">Heures d'ouverture :</p>
                <p>Lundi - Samedi : 09h00 - 20h00</p>
                <p>Dimanche : Fermé</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t dark:border-gray-700">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service Client Premium</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 Que vous ayez besoin d'un objectif de focale spécifique pour votre hybride Sony, ou que vous souhaitiez équiper un studio entier avec des lentilles cinéma professionnelles, notre équipe basée à Casablanca est là pour vous conseiller.
               </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Google Maps embed targeting the coordinates provided in structured data */}
            <iframe 
              src="https://maps.google.com/maps?q=33.5731,-7.5898&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '400px' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte localisation GearShop Casablanca"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalStoreCasablanca;
