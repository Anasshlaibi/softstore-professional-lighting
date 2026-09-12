export interface MoroccanCity {
  slug: string;
  name: string;
  nameAr: string;
  region: string;
  deliveryTime: string; // e.g. '24h express' or '24h - 48h'
  isLocalShowroom?: boolean;
  population?: string;
  postalCode?: string;
  highlightText: string;
  districts?: string[];
}

export const moroccanCities: MoroccanCity[] = [
  {
    slug: 'casablanca',
    name: 'Casablanca',
    nameAr: 'الدار البيضاء',
    region: 'Casablanca-Settat',
    deliveryTime: 'Le jour même / 24h Express',
    isLocalShowroom: true,
    population: '3.7M',
    postalCode: '20000',
    highlightText: 'Showroom physique & livraison express le jour même à Casablanca, Maârif, Gauthier, Anfa, Ain Diab, Sidi Maarouf et Bouskoura.',
    districts: ['Maârif', 'Gauthier', 'Anfa', 'Bourgogne', 'Ain Diab', 'Sidi Maarouf', 'Californie', 'Bouskoura', 'Dar Bouazza', 'Mohammedia']
  },
  {
    slug: 'rabat',
    name: 'Rabat',
    nameAr: 'الرباط',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express Garanti',
    population: '1.8M',
    postalCode: '10000',
    highlightText: 'Livraison express en 24h à Rabat, Agdal, Hay Riad, Souissi, Hassan ainsi qu\'à Salé et Témara avec paiement à la livraison.',
    districts: ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Océan', 'Salé', 'Témara', 'Harhoura']
  },
  {
    slug: 'marrakech',
    name: 'Marrakech',
    nameAr: 'مراكش',
    region: 'Marrakech-Safi',
    deliveryTime: '24h Express',
    population: '1.3M',
    postalCode: '40000',
    highlightText: 'Livraison sécurisée de matériel photo, objectifs cinéma et caméras DJI à Marrakech, Guéliz, Hivernage, Palmeraie et Targa.',
    districts: ['Guéliz', 'Hivernage', 'Palmeraie', 'Targa', 'Semlalia', 'M\'hamid', 'Massira']
  },
  {
    slug: 'tanger',
    name: 'Tanger',
    nameAr: 'طنجة',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h Express',
    population: '1.2M',
    postalCode: '90000',
    highlightText: 'Fournisseur de référence pour photographes et créateurs de contenu à Tanger, Malabata, Marshan, City Center et Gzenaya.',
    districts: ['Malabata', 'Marshan', 'Iberia', 'Centre-Ville', 'Boubana', 'Gzenaya']
  },
  {
    slug: 'agadir',
    name: 'Agadir',
    nameAr: 'أكادير',
    region: 'Souss-Massa',
    deliveryTime: '24h - 48h Express',
    population: '900K',
    postalCode: '80000',
    highlightText: 'Livraison rapide de matériel photo professionnel et DJI à Agadir, Talborjt, Founty, Taghazout, Dcheira et Inezgane.',
    districts: ['Talborjt', 'Founty', 'Sonaba', 'Charaf', 'Taghazout', 'Inezgane', 'Aït Melloul']
  },
  {
    slug: 'fes',
    name: 'Fès',
    nameAr: 'فاس',
    region: 'Fès-Meknès',
    deliveryTime: '24h Express',
    population: '1.1M',
    postalCode: '30000',
    highlightText: 'Vente et livraison d\'objectifs 7Artisans, filtres K&F Concept et caméras 4K à Fès, Ville Nouvelle, Champs de Course et Narjiss.',
    districts: ['Ville Nouvelle', 'Champs de Course', 'Narjiss', 'Route d\'Imouzzer', 'Mont Fleuri']
  },
  {
    slug: 'meknes',
    name: 'Meknès',
    nameAr: 'مكناس',
    region: 'Fès-Meknès',
    deliveryTime: '24h Express',
    population: '750K',
    postalCode: '50000',
    highlightText: 'Commandez votre équipement audiovisuel avec livraison sécurisée à Meknès, Hamria, Marjane, Bassatine et Belle Vue.',
    districts: ['Hamria', 'Marjane', 'Bassatine', 'Belle Vue', 'Plaisance', 'Sidi Bouzekri']
  },
  {
    slug: 'oujda',
    name: 'Oujda',
    nameAr: 'وجدة',
    region: 'L\'Oriental',
    deliveryTime: '24h - 48h',
    population: '550K',
    postalCode: '60000',
    highlightText: 'Livraison de matériel vidéo et photo dans toute la région de l\'Oriental : Oujda, Berkane, Saidia et Taourirt.',
    districts: ['Centre-Ville', 'Al Qods', 'Lazaret', 'Hay Andalous', 'Mir Ali']
  },
  {
    slug: 'kenitra',
    name: 'Kénitra',
    nameAr: 'القنيطرة',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express',
    population: '600K',
    postalCode: '14000',
    highlightText: 'Livraison rapide à Kénitra, Mehdia, Mimosa, Bir Rami et Alliance Darna avec paiement à la réception.',
    districts: ['Mimosa', 'Centre-Ville', 'Bir Rami', 'Mehdia Plage', 'Alliance Darna', 'Maamora']
  },
  {
    slug: 'tetouan',
    name: 'Tétouan',
    nameAr: 'تطوان',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h - 48h',
    population: '450K',
    postalCode: '93000',
    highlightText: 'Équipement photo et vidéo de haute qualité livré à Tétouan, Martil, Cabo Negro, M\'diq et Fnideq.',
    districts: ['Centre-Ville', 'Wilaya', 'Martil', 'Cabo Negro', 'M\'diq', 'Coelma']
  },
  {
    slug: 'mohammedia',
    name: 'Mohammedia',
    nameAr: 'المحمدية',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express / Le jour même',
    population: '250K',
    postalCode: '28800',
    highlightText: 'Livraison express le jour même ou 24h à Mohammedia, Parc, Monica, Miramar et Mansouria.',
    districts: ['Parc', 'Monica', 'Miramar', 'Centre-Ville', 'El Alia', 'Mansouria']
  },
  {
    slug: 'el-jadida',
    name: 'El Jadida',
    nameAr: 'الجديدة',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express',
    population: '250K',
    postalCode: '24000',
    highlightText: 'Matériel photo, stabilisateurs et optiques cinéma livrés à El Jadida, Sidi Bouzid, Mazagan et Azemmour.',
    districts: ['Centre-Ville', 'Sidi Bouzid', 'Plateau', 'Najmat Al Janoob', 'Azemmour']
  },
  {
    slug: 'nador',
    name: 'Nador',
    nameAr: 'الناظور',
    region: 'L\'Oriental',
    deliveryTime: '24h - 48h',
    population: '200K',
    postalCode: '62000',
    highlightText: 'Livraison express de caméras DJI et optiques professionnelles à Nador, Beni Ansar, Selouane et Al Aroui.',
    districts: ['Centre-Ville', 'Corniche', 'Beni Ansar', 'Selouane', 'Al Aroui']
  },
  {
    slug: 'safi',
    name: 'Safi',
    nameAr: 'آسفي',
    region: 'Marrakech-Safi',
    deliveryTime: '24h - 48h',
    population: '350K',
    postalCode: '46000',
    highlightText: 'Livraison de matériel photo et vidéo de pointe à Safi, Plateau, Biada et Sidi Bouzid Safi.',
    districts: ['Plateau', 'Biada', 'Centre-Ville', 'Sidi Bouzid']
  },
  {
    slug: 'beni-mellal',
    name: 'Béni Mellal',
    nameAr: 'بني ملال',
    region: 'Béni Mellal-Khénifra',
    deliveryTime: '24h - 48h',
    population: '220K',
    postalCode: '23000',
    highlightText: 'Livraison garantie d\'objectifs, éclairages studio et matériel vidéo à Béni Mellal, Fkih Ben Salah et Khénifra.',
    districts: ['Centre-Ville', 'Al Massira', 'Adouha', 'Oulad Hamdane']
  },
  {
    slug: 'khouribga',
    name: 'Khouribga',
    nameAr: 'خريبكة',
    region: 'Béni Mellal-Khénifra',
    deliveryTime: '24h Express',
    population: '200K',
    postalCode: '25000',
    highlightText: 'Équipement photo et vidéo livré rapidement à Khouribga, Oued Zem et Bejaad avec paiement à la livraison.',
    districts: ['Centre-Ville', 'Al Qods', 'Zaytoun', 'Hana']
  },
  {
    slug: 'laayoune',
    name: 'Laâyoune',
    nameAr: 'العيون',
    region: 'Laâyoune-Sakia El Hamra',
    deliveryTime: '48h Express Sécurisé',
    population: '260K',
    postalCode: '70000',
    highlightText: 'Livraison express sécurisée de matériel audiovisuel et DJI à Laâyoune, Al Wifaq, Dcheira et El Marsa.',
    districts: ['Centre-Ville', 'Al Wifaq', 'Hay Al Amal', 'El Marsa', 'Al Qods']
  },
  {
    slug: 'dakhla',
    name: 'Dakhla',
    nameAr: 'الداخلة',
    region: 'Dakhla-Oued Ed-Dahab',
    deliveryTime: '48h Express Sécurisé',
    population: '150K',
    postalCode: '73000',
    highlightText: 'Fournisseur d\'équipement photo, drones et caméras nomades pour photographes et créateurs à Dakhla et Oued Eddahab.',
    districts: ['Centre-Ville', 'Kassambar', 'Al Massira', 'Oum Tounsi']
  },
  {
    slug: 'bouskoura',
    name: 'Bouskoura',
    nameAr: 'بوسكورة',
    region: 'Casablanca-Settat',
    deliveryTime: 'Livraison le jour même / Express',
    population: '120K',
    postalCode: '27182',
    highlightText: 'Service VIP et livraison dans la journée à Bouskoura, Ville Verte, Victoria, CGI et Golf City.',
    districts: ['Ville Verte', 'Victoria', 'CGI', 'Golf City', 'Zone Industrielle']
  },
  {
    slug: 'dar-bouazza',
    name: 'Dar Bouazza',
    nameAr: 'دار بوعزة',
    region: 'Casablanca-Settat',
    deliveryTime: 'Livraison le jour même / Express',
    population: '160K',
    postalCode: '27223',
    highlightText: 'Livraison rapide à Dar Bouazza, Tamaris, Jack Beach, Oued Merzeg et Rahma.',
    districts: ['Tamaris', 'Jack Beach', 'Oued Merzeg', 'Errahma', 'Zone Balnéaire']
  }
];

export function getCityBySlug(slug: string): MoroccanCity | undefined {
  const normalized = (slug || '').toLowerCase().trim();
  return moroccanCities.find(c => c.slug === normalized || c.slug === normalized.replace(/_/g, '-'));
}
