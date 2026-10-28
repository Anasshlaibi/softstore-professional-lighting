/*
 * Script to enrich all 42 P0 products in Supabase with complete specifications,
 * professional French descriptions, and SEO-optimized product titles.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const enrichments = {
  // --- Studio Lighting ---
  3: {
    name: 'BKL 400Bi Éclairage Studio Bi-Color 400W (Monture Bowens)',
    desc: 'Le projecteur studio BKL 400Bi est un éclairage LED professionnel bi-color de 400W haute puissance conçu pour les tournages cinéma, plateaux TV et studios photo au Maroc. Doté d\'une plage de température de couleur variable de 2700K à 6500K, d\'un indice CRI/TLCI supérieur à 96 pour un rendu des couleurs fidèle, et d\'une monture standard Bowens compatible avec tous vos modificateurs de lumière (boîtes à lumière, bols réflecteurs). Disponible chez GearShop avec garantie 1 an et livraison express à Casablanca, Rabat et partout au Maroc.',
    specs: [
      'Puissance nominale : 400 Watts LED COB',
      'Température de couleur : 2700K - 6500K Bi-Color',
      'Indice de rendu des couleurs : CRI 96+ / TLCI 97+',
      'Monture accessoires : Standard Bowens Mount',
      'Gradation : 0% à 100% sans scintillement (Flicker-Free)',
      'Refroidissement : Ventilateur ultra-silencieux pour prise de son',
      'Alimentation : Secteur AC 100-240V',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  4: {
    name: 'Panel P-500 Panneau LED Studio Professionnel Bi-Color',
    desc: 'Le Panel P-500 est un panneau d\'éclairage LED haute intensité pour studio broadcast, vidéastes et créateurs exigeants au Maroc. Avec sa diffusion ultra-douce intégrée et sa puissance lumineuse réglable, il garantit un éclairage homogène sans ombres dures sur les visages et les interviews. Contrôle précis de la température de couleur, châssis métallique robuste pour usage intensif. Disponible chez GearShop avec SAV local à Casablanca.',
    specs: [
      'Type d\'éclairage : Panneau LED Studio professionnel',
      'Puissance lumineuse : Équivalent 500W haute intensité',
      'Température de couleur : Bi-Color ajustable 3200K - 5600K',
      'Rendu chromatique : CRI 95+ pour restitution naturelle des teintes de peau',
      'Angle de diffusion : 120 degrés avec volets coupe-flux orientables',
      'Alimentation : Secteur AC et double support batterie V-Mount',
      'Garantie : 1 an constructeur GearShop Maroc'
    ]
  },
  7: {
    name: 'S100W Éclairage Vidéo LED Portable Bi-Color 100W (Monture Bowens)',
    desc: 'La torche LED portable S100W offre une puissance lumineuse de 100 Watts dans un format ultra-compact et nomade, idéal pour les créateurs de contenu, streamers et vidéastes mobiles au Maroc. Grâce à sa monture Bowens polyvalente et sa molette de réglage précis, illuminez facilement vos vlogs, interviews et shootings en extérieur. Produit 100% original garanti 1 an par GearShop Casablanca.',
    specs: [
      'Puissance : 100 Watts haute luminosité',
      'Température de couleur : 2800K - 6500K Bi-Color',
      'Indice CRI : 96+ / TLCI 96+',
      'Monture : Mini Bowens / Standard Bowens compatible',
      'Poids : Ultra-léger moins de 1 kg pour tournage nomade',
      'Contrôle : Molettes physiques et contrôle sans fil',
      'Garantie : 1 an GearShop Maroc avec livraison nationale'
    ]
  },
  8: {
    name: 'P-60S Projecteur Spotlight LED Studio 60W (Daylight 5600K)',
    desc: 'Le projecteur P-60S Spotlight 60W Daylight est un spot compact ultra-puissant délivrant une lumière du jour pure à 5600K. Équipé d\'une lentille de focalisation pour concentrer ou élargir le faisceau lumineux, il est parfait comme éclairage principal ou lumière de découpe (rim light) pour vos vidéos YouTube, portraits et productions commerciales. Disponible immédiatement chez GearShop Maroc.',
    specs: [
      'Puissance : 60 Watts LED COB focalisable',
      'Température de couleur : Daylight équilibrée 5600K',
      'Indice CRI : > 95 pour une précision chromatique optimale',
      'Faisceau : Spot orientable avec coupe-flux 4 volets inclus',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },

  // --- 7Artisans Autofocus Series ---
  1008: {
    name: '7Artisans AF 35mm F1.4 Fuji X (APS-C) - Black',
    desc: 'L\'objectif 7Artisans AF 35mm F1.4 pour boîtiers hybrides Fujifilm X-Mount est une focale fixe ultra-lumineuse équivalente à un 53mm plein format. Doté d\'une très grande ouverture f/1.4 idéale en basse lumière et pour créer un superbe flou d\'arrière-plan (bokeh), cet objectif intègre un moteur autofocus pas-à-pas STM rapide et silencieux pleinement compatible avec le suivi des yeux et des visages Fujifilm. Idéal pour le portrait, la photo de rue et le documentaire au Maroc. Disponible chez GearShop avec garantie 1 an.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 35mm (Équivalent 53mm en plein format)',
      'Ouverture maximale : f/1.4',
      'Ouverture minimale : f/16',
      'Autofocus : Moteur pas-à-pas STM rapide & silencieux (Eye-AF)',
      'Formule optique : Lentilles haute réfraction pour piqué optimal',
      'Diaphragme : Circulaire pour un bokeh crémeux',
      'Diamètre de filtre : 52 mm',
      'Poids : Environ 240 g',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  1010: {
    name: '7Artisans AF 35mm F1.8 Fuji X (APS-C) - Black',
    desc: 'L\'objectif 7Artisans AF 35mm F1.8 pour Fujifilm X-Mount offre un équilibre parfait entre compacité, légèreté et netteté optique. Avec son ouverture rapide f/1.8 et sa motorisation autofocus STM fluide, il constitue une optique de choix au quotidien pour les utilisateurs d\'hybrides Fuji (X-T5, X-T4, X-S20, X-T30). Idéal pour les créateurs de contenu, les voyages et le portrait au Maroc. Garantie 1 an GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 35mm (Équivalent 53mm)',
      'Ouverture maximale : f/1.8',
      'Ouverture minimale : f/16',
      'Autofocus : Moteur STM silencieux compatible suivi AF Fuji',
      'Construction optique : 10 éléments en 8 groupes',
      'Poids : Ultra-léger 181 g',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an officiel GearShop Maroc'
    ]
  },
  1011: {
    name: '7Artisans AF 35mm F1.8 Nikon Z (APS-C) - Black',
    desc: 'L\'objectif 7Artisans AF 35mm F1.8 pour Nikon Z-Mount est optimisé pour les hybrides APS-C Nikon DX (Nikon Zfc, Z50, Z30) ainsi que pour les boîtiers Z plein format en mode recadrage. Sa grande ouverture f/1.8 permet de photographier facilement en faible luminosité tout en isolant nettement le sujet. Autofocus STM rapide avec prise en charge du suivi des yeux. Disponible chez GearShop Casablanca.',
    specs: [
      'Monture : Nikon Z-Mount (Format DX / APS-C)',
      'Focale : 35mm (Équivalent 52.5mm)',
      'Ouverture : f/1.8 - f/16',
      'Autofocus : Motorisation STM réactive & silencieuse',
      'Poids : 185 g',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  1012: {
    name: '7Artisans AF 50mm F1.8 Sony E (APS-C) - Black',
    desc: 'Le 7Artisans AF 50mm F1.8 pour Sony E-Mount est l\'objectif à portrait par excellence pour les hybrides APS-C Sony (Sony A6700, A6400, A6000, ZV-E10). Offrant un cadrage serré équivalent à 75mm en plein format, il isole magnifiquement vos sujets avec un flou d\'arrière-plan doux et progressif. Son autofocus STM précis s\'associe parfaitement au système Real-time Eye AF de Sony. Garantie 1 an GearShop.',
    specs: [
      'Monture : Sony E-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm en plein format)',
      'Ouverture maximale : f/1.8',
      'Ouverture minimale : f/16',
      'Autofocus : Moteur STM avec détection oculaire Sony Eye-AF',
      'Diaphragme : 9 lamelles circulaires pour un bokeh velouté',
      'Diamètre de filtre : 52 mm',
      'Poids : 185 g',
      'Garantie : 1 an SAV local GearShop Maroc'
    ]
  },
  1013: {
    name: '7Artisans AF 50mm F1.8 Fuji X (APS-C) - Black',
    desc: 'L\'objectif 7Artisans AF 50mm F1.8 pour Fujifilm X est une focale fixe portrait délivrant un cadrage téléobjectif court de 75mm. Parfait pour les portraits, la photo de détail et les plans serrés en vidéo. Son autofocus STM garantit des transitions douces et silencieuses, adaptées à la vidéo comme à la photographie. En stock chez GearShop avec livraison express au Maroc.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture : f/1.8 à f/16',
      'Autofocus : Moteur pas-à-pas STM rapide',
      'Poids : 185 g',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an officiel GearShop Maroc'
    ]
  },
  1014: {
    name: '7Artisans AF 50mm F1.8 Nikon Z (APS-C) - Black',
    desc: 'Le 7Artisans AF 50mm F1.8 pour monture Nikon Z (DX) offre aux utilisateurs de Nikon Z50, Zfc et Z30 un objectif à portrait lumineux et abordable. Équivalent à un 75mm plein format, il produit des portraits nets avec un superbe détachement de plan. Compatible Eye-AF Nikon. Disponible chez GearShop avec garantie 1 an.',
    specs: [
      'Monture : Nikon Z-Mount (APS-C / DX)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture : f/1.8 - f/16',
      'Autofocus : Moteur STM rapide et silencieux',
      'Poids : 188 g',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  1021: {
    name: '7Artisans AF 40mm F2.5 Sony E (Full Frame / APS-C) - Black',
    desc: 'Le 7Artisans AF 40mm F2.5 pour Sony E-Mount est un objectif compact de type "pancake" couvrant les capteurs Plein Format (Sony A7 IV, A7 III, A7C, FX3) et APS-C. Sa focale naturelle de 40mm se situe entre le 35mm et le 50mm, offrant une perspective très proche de la vision humaine. Fabrication métallique haut de gamme et autofocus STM réactif. Disponible chez GearShop Maroc.',
    specs: [
      'Monture : Sony E-Mount (Plein Format Full Frame & APS-C)',
      'Focale : 40mm (Perspective humaine naturelle)',
      'Ouverture maximale : f/2.5',
      'Ouverture minimale : f/16',
      'Autofocus : STM fluide avec prise en charge du suivi autofocus Sony',
      'Construction : Métal robuste ultra-compact',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },

  // --- 7Artisans Fast Primes Manual Focus Series ---
  1032: {
    name: '7Artisans 50mm F1.2 Sony E (APS-C) - Black',
    desc: 'L\'objectif manuel 7Artisans 50mm F1.2 pour Sony E-Mount est réputé pour son ouverture titanesque f/1.2 produisant un bokeh spectaculaire et une immersion cinématographique unique. Entièrement mécanique avec bague d\'ouverture continue et bague de mise au point fluide en métal, il est prisé des photographes de portrait et des cinéastes artistiques au Maroc. Disponible chez GearShop.',
    specs: [
      'Monture : Sony E-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture maximale : f/1.2 ultra-lumineuse',
      'Ouverture minimale : f/16',
      'Mise au point : Manuelle fluide longue course',
      'Diaphragme : 10 lamelles pour des cercles de bokeh parfaits',
      'Diamètre de filtre : 52 mm',
      'Poids : 336 g en aluminium anodisé',
      'Garantie : 1 an officiel GearShop Maroc'
    ]
  },
  1033: {
    name: '7Artisans 50mm F1.2 Fuji X (APS-C) - Black',
    desc: 'L\'objectif 7Artisans 50mm F1.2 pour Fujifilm X-Mount offre aux passionnés de photographie argentique et créative une ouverture record f/1.2. Idéal pour sublimer les simulations de film Fujifilm avec des arrière-plans veloutés et des portraits saisissants en lumière tamisée. Corps tout en métal usiné de précision. Disponible chez GearShop Casablanca.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture maximale : f/1.2',
      'Mise au point : Manuelle mécanique précise',
      'Diaphragme : 10 lamelles',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1034: {
    name: '7Artisans 50mm F1.2 Micro 4/3 (Panasonic / OM System) - Black',
    desc: 'Le 7Artisans 50mm F1.2 en monture Micro Four Thirds (M43) transforme votre hybride Panasonic Lumix (GH5, GH6, G9) ou Olympus en une bête de portrait équivalente à 100mm. Sa très grande ouverture f/1.2 compense la taille du capteur pour offrir une profondeur de champ restreinte et une luminosité abondante en basse lumière. Disponible chez GearShop Maroc.',
    specs: [
      'Monture : Micro 4/3 (MFT / M43 Panasonic & OM System)',
      'Focale : 50mm (Équivalent 100mm plein format)',
      'Ouverture maximale : f/1.2',
      'Mise au point : Manuelle douce et progressive',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1035: {
    name: '7Artisans 50mm F1.2 Nikon Z (APS-C / DX) - Black',
    desc: 'L\'objectif manuel 7Artisans 50mm F1.2 pour Nikon Z-Mount apporte l\'art du bokeh f/1.2 aux boîtiers Nikon Zfc, Z50 et Z30. Fabrication artisanale tout en métal, bague de mise au point à rotation douce et formule optique traitée multicouche pour un contraste éclatant. Disponible chez GearShop avec livraison partout au Maroc.',
    specs: [
      'Monture : Nikon Z-Mount (DX / APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture maximale : f/1.2 ultra-rapide',
      'Mise au point : Manuelle mécanique de précision',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  1036: {
    name: '7Artisans 50mm F1.8 Sony E (APS-C) - Black',
    desc: 'Focale fixe manuelle compacte et abordable, le 7Artisans 50mm F1.8 pour Sony E-Mount est l\'objectif d\'initiation idéal au portrait et au flou créatif. Poids plume, corps métallique robuste et bague de diaphragme décliquée parfaite pour la vidéo. Disponible chez GearShop avec garantie 1 an.',
    specs: [
      'Monture : Sony E-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture : f/1.8 - f/16',
      'Mise au point : Manuelle',
      'Diaphragme : 12 lamelles pour un bokeh très circulaire',
      'Diamètre de filtre : 52 mm',
      'Poids : 168 g',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1037: {
    name: '7Artisans 50mm F1.8 Fuji X (APS-C) - Black',
    desc: 'Le 7Artisans 50mm F1.8 pour boîtiers hybrides Fujifilm X-Mount combine une grande ouverture f/1.8 et un diaphragme à 12 lamelles pour un rendu doux et artistique des portraits. Conçu en aluminium aviation, il se glisse dans n\'importe quel sac de reportage. Disponible chez GearShop Casablanca.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 50mm (Équivalent 75mm)',
      'Ouverture : f/1.8 - f/16',
      'Diaphragme : 12 lamelles arrondies',
      'Poids : 168 g',
      'Diamètre de filtre : 52 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1038: {
    name: '7Artisans 35mm F1.4 Sony E (APS-C) - Black',
    desc: 'Le 7Artisans 35mm F1.4 Mark II pour Sony E-Mount est une focale fixe manuelle de référence pour la street-photography et le reportage au Maroc. Équivalent à un 52mm plein format, il délivre des images piquées avec une belle transition vers le flou d\'arrière-plan grâce à son ouverture f/1.4. Châssis métallique compact. Disponible chez GearShop.',
    specs: [
      'Monture : Sony E-Mount (APS-C)',
      'Focale : 35mm (Équivalent standard 52mm)',
      'Ouverture : f/1.4 - f/16',
      'Mise au point : Manuelle mécanique avec échelle de profondeur de champ',
      'Construction : 8 éléments en 5 groupes',
      'Diamètre de filtre : 46 mm',
      'Poids : 228 g',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1039: {
    name: '7Artisans 35mm F1.4 Fuji X (APS-C) - Black',
    desc: 'L\'objectif manuel 7Artisans 35mm F1.4 pour Fujifilm X-Mount offre la focale universelle par excellence (équivalent 53mm). Son ouverture f/1.4 permet de capturer la lumière disponible dans les ruelles et les intérieurs sombres au Maroc sans bruit numérique. Finition noire métallique raffinée. Garantie 1 an GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount (APS-C)',
      'Focale : 35mm (Équivalent 53mm)',
      'Ouverture maximale : f/1.4',
      'Mise au point : Manuelle',
      'Diamètre de filtre : 46 mm',
      'Poids : 228 g',
      'Garantie : 1 an GearShop Casablanca'
    ]
  },
  1040: {
    name: '7Artisans 35mm F1.4 Micro 4/3 (Panasonic / OM System) - Black',
    desc: 'Le 7Artisans 35mm F1.4 en monture Micro 4/3 équivaut à un 70mm court, parfait pour le portrait naturel et le reportage vidéo sur Panasonic Lumix GH5/GH6 et boîtiers Olympus. Grande ouverture f/1.4 et bague manuelle souple. Disponible chez GearShop avec livraison rapide au Maroc.',
    specs: [
      'Monture : Micro 4/3 (M43)',
      'Focale : 35mm (Équivalent 70mm)',
      'Ouverture : f/1.4 - f/16',
      'Mise au point : Manuelle',
      'Diamètre de filtre : 46 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1041: {
    name: '7Artisans 35mm F1.4 Nikon Z (APS-C / DX) - Black',
    desc: 'Le 7Artisans 35mm F1.4 pour monture Nikon Z (DX) s\'associe à merveille avec les Nikon Zfc et Z50 grâce à son design rétro tout en métal. Ouverture f/1.4 lumineuse, mise au point précise au millimètre et rendu d\'image organique. Disponible chez GearShop Maroc.',
    specs: [
      'Monture : Nikon Z-Mount (DX / APS-C)',
      'Focale : 35mm (Équivalent 52mm)',
      'Ouverture : f/1.4 - f/16',
      'Mise au point : Manuelle de précision',
      'Diamètre de filtre : 46 mm',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1042: {
    name: '7Artisans 35mm F1.4 Canon RF (EOS-R Mount) - Black',
    desc: 'L\'objectif 7Artisans 35mm F1.4 pour monture Canon RF est conçu pour les hybrides Canon EOS R (R50, R10, R7, R8, R6). Focale standard polyvalente et très lumineuse avec son ouverture f/1.4 pour des créations photographiques et vidéo expressives. Disponible chez GearShop.',
    specs: [
      'Monture : Canon RF (EOS-R)',
      'Focale : 35mm',
      'Ouverture : f/1.4 - f/16',
      'Mise au point : Manuelle mécanique',
      'Diamètre de filtre : 46 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },

  // --- 7Artisans Vision / Spectrum Cine Lenses ---
  1044: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Sony E (Black)',
    desc: 'L\'objectif cinéma 7Artisans Vision 10mm T2.1 pour Sony E-Mount est une optique ultra grand-angle cinématographique d\'exception. Doté de bagues crantées standardisées 0.8 MOD pour follow-focus et contrôle d\'ouverture fluide, d\'une rotation de focus longue à 270 degrés pour des tirages précis, et d\'une distorsion remarquablement maîtrisée pour les plans d\'architecture, paysages et scènes d\'action au Maroc. Châssis tout métal robuste. Garanti 1 an GearShop.',
    specs: [
      'Monture : Sony E-Mount (Format APS-C / Super35)',
      'Focale : 10mm Ultra Grand-Angle Cinéma',
      'Ouverture : T2.1 - T22 continue et décliquée',
      'Bagues crantées : Standardisées 0.8 MOD pour Follow Focus',
      'Course de mise au point : 270° de rotation ultra-précise',
      'Diamètre frontal : 82 mm standard cinéma',
      'Construction : Entièrement métallique pour production cinéma',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1045: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Fuji X (Black)',
    desc: 'L\'objectif cinéma 7Artisans Vision 10mm T2.1 pour Fujifilm X-Mount offre un champ de vision ultra-large immersif pour les cinéastes et vidéastes indépendants. Bagues d\'engrenage 0.8 MOD, faible respiration de focus (focus breathing maîtrisé) et rendu d\'image cinématographique chaud et naturel. Disponible chez GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount (Super35 / APS-C)',
      'Focale : 10mm Ultra-Wide Ciné',
      'Ouverture : T2.1 - T22 dé-cliquée',
      'Engrenage : 0.8 MOD cine-standard',
      'Course focus : 270 degrés',
      'Diamètre frontal : 82 mm',
      'Garantie : 1 an officiel GearShop Maroc'
    ]
  },
  1046: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Micro 4/3 (Black)',
    desc: 'Conçu pour les caméras cinéma Micro 4/3 (Blackmagic Pocket Cinema Camera 4K, Panasonic GH6/GH5s), le 7Artisans Vision 10mm T2.1 offre un angle de vue équivalent à 20mm plein format sans distorsion optique marquée. Contrôle mécanique parfait pour les tournages en équipe ou au stabilisateur. Garanti 1 an GearShop.',
    specs: [
      'Monture : Micro 4/3 (M43 / BMPCC 4K)',
      'Focale : 10mm (Équivalent 20mm plein format)',
      'Ouverture : T2.1 continue',
      'Bagues : 0.8 MOD pour moteur de suivi de point',
      'Course : 270°',
      'Diamètre frontal : 82 mm',
      'Garantie : 1 an GearShop Casablanca'
    ]
  },
  1047: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Canon RF (Black)',
    desc: 'Le 7Artisans Vision 10mm T2.1 Cinéma pour monture Canon RF (Canon C70, EOS R7, R50) apporte une optique cinéma grand-angle haute précision aux caméras EOS Cinema Line. Corps métallique robuste, bagues calibrées 0.8 MOD et grande luminosité T2.1. Disponible chez GearShop avec livraison partout au Maroc.',
    specs: [
      'Monture : Canon RF (Format Super35 / APS-C)',
      'Focale : 10mm',
      'Ouverture : T2.1 - T22',
      'Bagues cinéma : 0.8 MOD standardisées',
      'Diamètre frontal : 82 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1048: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Sony E (Titanium Gray)',
    desc: 'Version Titanium Gray de l\'objectif cinéma 7Artisans Vision 10mm T2.1 pour Sony E-Mount. Alliant esthétique raffinée gris titane et performances optiques professionnelles, c\'est l\'outil de prédilection des réalisateurs pour les prises de vue en caméra subjective, drone lourd et décors majestueux au Maroc. Garanti 1 an GearShop.',
    specs: [
      'Monture : Sony E-Mount (Super35 / APS-C)',
      'Finition : Édition Titanium Gray métal brossé',
      'Focale : 10mm Ultra-Wide Cinéma',
      'Ouverture : T2.1 - T22 continue',
      'Course focus : 270° fluide',
      'Engrenage : 0.8 MOD',
      'Garantie : 1 an GearShop Casablanca'
    ]
  },
  1049: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Fuji X (Titanium Gray)',
    desc: 'Édition Titanium Gray du 7Artisans Vision 10mm T2.1 pour Fujifilm X-Mount. Optique cinéma ultra-large en finition titane avec un contrôle manuel d\'une précision chirurgicale pour les vidéastes commerciaux et documentaristes au Maroc. Disponible chez GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount (Super35)',
      'Finition : Titanium Gray',
      'Focale : 10mm Cinéma',
      'Ouverture : T2.1',
      'Bagues : 0.8 MOD',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1050: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Micro 4/3 (Titanium Gray)',
    desc: 'Objectif cinéma ultra grand-angle 7Artisans Vision 10mm T2.1 en finition Titanium Gray pour caméras Micro 4/3 (BMPCC 4K, Panasonic). Look cinéma moderne, bagues synchronisées avec la gamme Vision et transmission lumineuse T2.1 constante. Disponible chez GearShop.',
    specs: [
      'Monture : Micro 4/3 (M43)',
      'Finition : Titanium Gray',
      'Focale : 10mm',
      'Ouverture : T2.1',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1051: {
    name: '7Artisans Vision 10mm T2.1 Cinéma Canon RF (Titanium Gray)',
    desc: 'Le 7Artisans Vision 10mm T2.1 Titanium Gray en monture Canon RF offre une polyvalence cinéma inégalée sur les caméras Canon EOS C70 et hybrides RF. Résistance mécanique exemplaire et esthétique titane exclusive. Disponible chez GearShop Casablanca.',
    specs: [
      'Monture : Canon RF',
      'Finition : Titanium Gray',
      'Focale : 10mm T2.1',
      'Bagues : 0.8 MOD',
      'Garantie : 1 an GearShop Maroc'
    ]
  },

  // --- 7Artisans 16mm T2.1 Series ---
  1052: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Sony E (Black)',
    desc: 'L\'objectif 7Artisans Vision 16mm T2.1 pour Sony E-Mount est une focale grand-angle cinéma équivalente à environ 24mm plein format. Parfait pour les plans d\'ambiance, les scènes de dialogue dynamiques et les plans larges narratifs. Sa bague de mise au point à rotation fluide de 270° permet des tirages au millimètre sans à-coups. Disponible chez GearShop Maroc avec garantie 1 an.',
    specs: [
      'Monture : Sony E-Mount (Super35 / APS-C)',
      'Focale : 16mm Grand-Angle Cinéma (Équivalent 24mm)',
      'Ouverture : T2.1 - T22 continue sans clic',
      'Bagues d\'engrenage : Standard cinéma 0.8 MOD',
      'Course de mise au point : 270 degrés',
      'Diamètre frontal : 82 mm standard',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1053: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Fuji X (Black)',
    desc: 'Le 7Artisans Vision 16mm T2.1 Cinéma pour Fujifilm X-Mount sublime vos productions vidéo avec un piqué net au centre, des aberrations chromatiques contrôlées et un bokeh doux à pleine ouverture. Idéal pour les fictions, clips musicaux et documentaires au Maroc. Disponible chez GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount (Super35)',
      'Focale : 16mm Grand-Angle Ciné',
      'Ouverture : T2.1 continue',
      'Bagues cinéma : 0.8 MOD',
      'Course focus : 270°',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1054: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Micro 4/3 (Black)',
    desc: 'L\'objectif cinéma 7Artisans Vision 16mm T2.1 en monture Micro 4/3 (équivalent 32mm standard) est l\'un des objectifs les plus polyvalents pour les tournages documentaires et fictionnels sur Blackmagic BMPCC 4K et Panasonic GH6. Construction robuste tout métal, bagues 0.8 MOD. Garanti 1 an GearShop.',
    specs: [
      'Monture : Micro 4/3 (M43)',
      'Focale : 16mm (Équivalent 32mm)',
      'Ouverture : T2.1 - T22',
      'Bagues : 0.8 MOD cine-standard',
      'Garantie : 1 an GearShop Casablanca'
    ]
  },
  1055: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Canon RF (Black)',
    desc: 'Pour les utilisateurs de caméras Canon cinéma RF (Canon EOS C70, RED Komodo avec bague RF, Canon R7), le 7Artisans Vision 16mm T2.1 offre un rendu optique cinéma soigné avec un piqué uniforme et une manipulation professionnelle. Disponible chez GearShop Maroc.',
    specs: [
      'Monture : Canon RF',
      'Focale : 16mm Cinéma',
      'Ouverture : T2.1 - T22',
      'Bagues : 0.8 MOD pour Follow Focus',
      'Diamètre frontal : 82 mm',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1056: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Sony E (Titanium Gray)',
    desc: 'Édition Titanium Gray du 7Artisans Vision 16mm T2.1 pour Sony E-Mount. Finition luxueuse en aluminium brossé gris titane, performance optique de niveau cinéma et compatibilité parfaite avec les rigs professionnels. En stock chez GearShop avec livraison express.',
    specs: [
      'Monture : Sony E-Mount (Super35)',
      'Finition : Titanium Gray exclusive',
      'Focale : 16mm T2.1',
      'Course focus : 270°',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1057: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Fuji X (Titanium Gray)',
    desc: 'Version Titanium Gray du 7Artisans Vision 16mm T2.1 pour Fujifilm X. Un objectif grand-angle cinéma élégant et ultra-performant pour les cinéastes au Maroc. Bagues 0.8 MOD universelles. Garanti 1 an GearShop.',
    specs: [
      'Monture : Fujifilm X-Mount',
      'Finition : Titanium Gray',
      'Focale : 16mm',
      'Ouverture : T2.1',
      'Garantie : 1 an GearShop Maroc'
    ]
  },
  1058: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Micro 4/3 (Titanium Gray)',
    desc: 'Le 7Artisans Vision 16mm T2.1 Titanium Gray en monture Micro 4/3 offre une optique de tournage raffinée et durable pour vos caméras de cinéma compactes au Maroc. Bagues alignées avec la série Vision. Disponible chez GearShop.',
    specs: [
      'Monture : Micro 4/3',
      'Finition : Titanium Gray',
      'Focale : 16mm T2.1',
      'Garantie : 1 an GearShop Casablanca'
    ]
  },
  1059: {
    name: '7Artisans Vision 16mm T2.1 Cinéma Canon RF (Titanium Gray)',
    desc: 'L\'objectif cinéma 7Artisans Vision 16mm T2.1 Titanium Gray en monture Canon RF allie robustesse cinéma, design titane contemporain et précision mécanique pour vos tournages publicitaires et cinéma au Maroc. Disponible chez GearShop.',
    specs: [
      'Monture : Canon RF',
      'Finition : Titanium Gray',
      'Focale : 16mm',
      'Ouverture : T2.1',
      'Garantie : 1 an GearShop Maroc'
    ]
  },

  // --- Specialty Adapters & Filters ---
  1043: {
    name: 'Bague d\'Adaptation Autofocus 7Artisans EF-NZ (Canon EF vers Nikon Z)',
    desc: 'La bague d\'adaptation intelligente 7Artisans EF-NZ permet de monter tous vos objectifs reflex Canon EF et EF-S sur les boîtiers hybrides Nikon Z (Z9, Z8, Z6, Z7, Z5, Z50, Zfc) avec conservation intégrale de l\'autofocus, du suivi des yeux (Eye-AF), de la stabilisation d\'image IS/VR et de la transmission des données EXIF. Fabriquée avec des contacts dorés haute conductivité et un port USB pour les futures mises à jour du firmware. Disponible chez GearShop Casablanca avec garantie 1 an.',
    specs: [
      'Monture objectif : Canon EF / EF-S',
      'Monture boîtier : Nikon Z (Plein Format & DX)',
      'Fonctionnalités : Autofocus haute vitesse, Eye-AF, Stabilisation IS/VR',
      'Transmission : Données EXIF complètes transmises au boîtier',
      'Mise à jour : Port USB-C intégré pour mise à jour du micrologiciel',
      'Construction : Métal en alliage d\'aluminium avec baïonnettes en laiton',
      'Garantie : 1 an SAV officiel GearShop Maroc'
    ]
  },
  1060: {
    name: '7Artisans Adaptateur PL 4-en-1 Universel (PL vers Sony E / L / RF / Nikon Z)',
    desc: 'L\'adaptateur cinéma modulaire 7Artisans PL 4-en-1 est la solution ultime pour les loueurs de matériel, directeurs photo et sociétés de production au Maroc. Il permet de monter n\'importe quel objectif cinéma standard Arri PL sur les 4 montures hybrides majeures : Sony E, Leica/Panasonic L-Mount, Canon RF et Nikon Z grâce à ses bagues interchangeables de haute précision. Finition argentée en alliage d\'acier inoxydable, cales de tirage optique (shims) incluses pour une mise au point à l\'infini parfaite. Garanti 1 an GearShop.',
    specs: [
      'Monture d\'entrée : Arri PL standard cinéma',
      'Montures de sortie interchangeables : Sony E, L-Mount, Canon RF, Nikon Z',
      'Réglage du tirage : Jeu de cales (shims) de haute précision inclus',
      'Support pied : Filetage 1/4"-20 pour support d\'objectif lourd (Lens Support)',
      'Matériau : Acier inoxydable aéronautique et aluminium anodisé',
      'Garantie : 1 an officiel GearShop Casablanca'
    ]
  },
  1061: {
    name: '7Artisans Filtre Variable ND 77mm True Color (VND ND64 - ND512 / 6-9 Stops)',
    desc: 'Le filtre à densité neutre variable 7Artisans True Color 77mm offre une réduction de lumière réglable de 6 à 9 diaphragmes (ND64 à ND512) sans aucune dérive colorimétrique ni effet de croix noire (No X-Cross). Indispensable pour filmer en plein soleil marocain avec des optiques ultra-lumineuses à pleine ouverture f/1.2 ou f/1.4 tout en conservant la règle de l\'obturateur à 180 degrés. Verre optique haute définition avec traitement nano multicouche étanche et anti-rayures. Disponible chez GearShop.',
    specs: [
      'Diamètre : 77 mm standard',
      'Plage d\'atténuation : 6 à 9 Stops (ND64 à ND512 variable)',
      'Technologie : True Color sans dominante jaune ou magenta',
      'Conception : Butées physiques (Hard Stops) anti-croix noire (No X-Cross)',
      'Revêtement : Nano-coating 18 couches déperlant, oléophobe et anti-rayures',
      'Cadre : Aluminium ultra-fin slim pour éviter le vignetage',
      'Garantie : 1 an officiel GearShop Maroc'
    ]
  },
  1062: {
    name: '7Artisans Filtre 55mm 1/8 Black Mist (Diffusion Cinématographique)',
    desc: 'Le filtre de diffusion 7Artisans Black Mist 1/8 en diamètre 55mm est l\'accessoire secret des vidéastes et portraitistes pour casser le piqué numérique trop dur des capteurs modernes. Il adoucit délicatement les hautes lumières en créant un halo subtil (bloom) autour des sources lumineuses tout en lissant les imperfections de la peau sans altérer le contraste global. Verre optique de qualité cinéma avec cadre moleté en aluminium slim. Disponible chez GearShop Casablanca.',
    specs: [
      'Diamètre : 55 mm',
      'Intensité de diffusion : 1/8 (Subtile et cinématique)',
      'Effet : Adoucissement des hautes lumières et lissage de peau naturel',
      'Verre : Optique de précision multicouche haute transmission',
      'Bague : Profil slim anti-vignetage en aluminium aéronautique',
      'Garantie : 1 an constructeur GearShop Maroc'
    ]
  }
};

async function run() {
  console.log(`Starting enrichment of ${Object.keys(enrichments).length} P0 products in Supabase...`);
  let successCount = 0;

  for (const [idStr, data] of Object.entries(enrichments)) {
    const id = Number(idStr);
    const { error } = await supabase
      .from('products gearshop')
      .update({
        name: data.name,
        desc: data.desc,
        specs: data.specs
      })
      .eq('id', id);

    if (error) {
      console.error(`❌ Failed to enrich product ${id} (${data.name}):`, error.message);
    } else {
      console.log(`✅ [${id}] Enriched: ${data.name}`);
      successCount++;
    }
  }

  console.log(`\n🎉 Successfully enriched ${successCount}/${Object.keys(enrichments).length} products in Supabase!`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

