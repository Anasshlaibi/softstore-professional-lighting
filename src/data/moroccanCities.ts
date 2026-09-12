export interface MoroccanCity {
  slug: string;
  name: string;
  nameAr: string;
  region: string;
  deliveryTime: string;
  isLocalShowroom?: boolean;
  population?: string;
  postalCode?: string;
  highlightText: string;
  districts?: string[];
}

export const moroccanCities: MoroccanCity[] = [
  // 1. CASABLANCA-SETTAT & GRAND CASABLANCA
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
    districts: ['Maârif', 'Gauthier', 'Anfa', 'Bourgogne', 'Ain Diab', 'Sidi Maarouf', 'Californie', 'Ain Sebaa', 'Belvédère', 'Oasis', 'Polo']
  },
  {
    slug: 'mohammedia',
    name: 'Mohammedia',
    nameAr: 'المحمدية',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express / Le jour même',
    population: '250K',
    postalCode: '28800',
    highlightText: 'Livraison express le jour même ou 24h à Mohammedia, Parc, Monica, Miramar, El Alia et Mansouria.',
    districts: ['Parc', 'Monica', 'Miramar', 'Centre-Ville', 'El Alia', 'Mansouria', 'Kasbah']
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
    districts: ['Ville Verte', 'Victoria', 'CGI', 'Golf City', 'Zone Industrielle', 'Palmeraie Bouskoura']
  },
  {
    slug: 'dar-bouazza',
    name: 'Dar Bouazza',
    nameAr: 'دار بوعزة',
    region: 'Casablanca-Settat',
    deliveryTime: 'Livraison le jour même / Express',
    population: '160K',
    postalCode: '27223',
    highlightText: 'Livraison rapide à Dar Bouazza, Tamaris, Jack Beach, Oued Merzeg, Rahma et Zone Balnéaire.',
    districts: ['Tamaris', 'Jack Beach', 'Oued Merzeg', 'Errahma', 'Zone Balnéaire', 'Babalou']
  },
  {
    slug: 'nouaceur',
    name: 'Nouaceur',
    nameAr: 'النواصر',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express',
    population: '50K',
    postalCode: '27100',
    highlightText: 'Livraison express de matériel photo et vidéo à Nouaceur, Aéroport Med V et Technopole.',
    districts: ['Zone Aéroportuaire', 'Technopole', 'Centre Nouaceur']
  },
  {
    slug: 'settat',
    name: 'Settat',
    nameAr: 'سطات',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express',
    population: '150K',
    postalCode: '26000',
    highlightText: 'Livraison sécurisée d\'objectifs, caméras et éclairage à Settat, Université Hassan 1er et Centre-Ville.',
    districts: ['Centre-Ville', 'Quartier Administratif', 'Hay Salam', 'M\'zamza']
  },
  {
    slug: 'berrechid',
    name: 'Berrechid',
    nameAr: 'برشيد',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express',
    population: '140K',
    postalCode: '26100',
    highlightText: 'Livraison rapide de matériel photo et vidéo à Berrechid, Hay Hassani et Zone Industrielle.',
    districts: ['Centre-Ville', 'Hay Hassani', 'Hay Taisir', 'Zone Industrielle']
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
    districts: ['Centre-Ville', 'Sidi Bouzid', 'Plateau', 'Najmat Al Janoob', 'Azemmour', 'Mazagan']
  },
  {
    slug: 'benslimane',
    name: 'Benslimane',
    nameAr: 'بنسليمان',
    region: 'Casablanca-Settat',
    deliveryTime: '24h Express',
    population: '60K',
    postalCode: '13000',
    highlightText: 'Livraison de matériel photo et caméras nomades à Benslimane, Bouznika et Mansouria.',
    districts: ['Centre-Ville', 'Bouznika', 'Bouznika Bay', 'Plage David']
  },

  // 2. RABAT-SALÉ-KÉNITRA
  {
    slug: 'rabat',
    name: 'Rabat',
    nameAr: 'الرباط',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express Garanti',
    population: '1.8M',
    postalCode: '10000',
    highlightText: 'Livraison express en 24h à Rabat, Agdal, Hay Riad, Souissi, Hassan, Les Orangers et Harhoura avec paiement à la livraison.',
    districts: ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Océan', 'Les Orangers', 'Aviation', 'Mabella']
  },
  {
    slug: 'sale',
    name: 'Salé',
    nameAr: 'سلا',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express',
    population: '900K',
    postalCode: '11000',
    highlightText: 'Livraison rapide à Salé, Tabriquet, Bettana, Marina Bouregreg, Hay Salam et Sala Al Jadida.',
    districts: ['Tabriquet', 'Bettana', 'Marina Bouregreg', 'Hay Salam', 'Sala Al Jadida', 'Sidi Moussa']
  },
  {
    slug: 'temara',
    name: 'Témara',
    nameAr: 'تمارة',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express',
    population: '350K',
    postalCode: '12000',
    highlightText: 'Livraison express à Témara, Harhoura, Wifaq, Massira, Guich Loudaya et Skhirat.',
    districts: ['Harhoura', 'Wifaq', 'Massira', 'Guich Loudaya', 'Val d\'Or', 'Skhirat Plage']
  },
  {
    slug: 'kenitra',
    name: 'Kénitra',
    nameAr: 'القنيطرة',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express',
    population: '600K',
    postalCode: '14000',
    highlightText: 'Livraison rapide à Kénitra, Mehdia, Mimosa, Bir Rami, Maamora et Alliance Darna avec paiement à la réception.',
    districts: ['Mimosa', 'Centre-Ville', 'Bir Rami', 'Mehdia Plage', 'Alliance Darna', 'Maamora', 'Saknia']
  },
  {
    slug: 'sidi-kacem',
    name: 'Sidi Kacem',
    nameAr: 'سيدي قاسم',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h - 48h',
    population: '80K',
    postalCode: '16000',
    highlightText: 'Expédition sécurisée de matériel audiovisuel à Sidi Kacem, Mechra Bel Ksiri et environs.',
    districts: ['Centre-Ville', 'Hay Chahid', 'Zaouia']
  },
  {
    slug: 'sidi-slimane',
    name: 'Sidi Slimane',
    nameAr: 'سيدي سليمان',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h - 48h',
    population: '90K',
    postalCode: '14200',
    highlightText: 'Livraison express de matériel photo et vidéo à Sidi Slimane et la région du Gharb.',
    districts: ['Centre-Ville', 'Hay Pam', 'Hay Salam']
  },
  {
    slug: 'khemisset',
    name: 'Khémisset',
    nameAr: 'الخميسات',
    region: 'Rabat-Salé-Kénitra',
    deliveryTime: '24h Express',
    population: '140K',
    postalCode: '15000',
    highlightText: 'Livraison d\'objectifs, caméras et filtres à Khémisset, Tiflet et Rommani.',
    districts: ['Centre-Ville', 'Hay Salam', 'Hay Moulay Rachid', 'Tiflet']
  },

  // 3. MARRAKECH-SAFI
  {
    slug: 'marrakech',
    name: 'Marrakech',
    nameAr: 'مراكش',
    region: 'Marrakech-Safi',
    deliveryTime: '24h Express',
    population: '1.3M',
    postalCode: '40000',
    highlightText: 'Livraison sécurisée de matériel photo, objectifs cinéma et caméras DJI à Marrakech, Guéliz, Hivernage, Palmeraie et Targa.',
    districts: ['Guéliz', 'Hivernage', 'Palmeraie', 'Targa', 'Semlalia', 'M\'hamid', 'Massira', 'Victor Hugo', 'Agdal Marrakech']
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
    districts: ['Plateau', 'Biada', 'Centre-Ville', 'Sidi Bouzid', 'Hay Anas']
  },
  {
    slug: 'essaouira',
    name: 'Essaouira',
    nameAr: 'الصويرة',
    region: 'Marrakech-Safi',
    deliveryTime: '24h - 48h',
    population: '80K',
    postalCode: '44000',
    highlightText: 'Fournisseur d\'équipement photo et vidéo pour créateurs, photographes et surfeurs à Essaouira, Diabat et Sidi Kaouki.',
    districts: ['Medina', 'Borj', 'Ghazoua', 'Diabat', 'Sidi Kaouki']
  },
  {
    slug: 'el-kelaa-des-sraghna',
    name: 'El Kelâa des Sraghna',
    nameAr: 'قلعة السراغنة',
    region: 'Marrakech-Safi',
    deliveryTime: '24h - 48h',
    population: '100K',
    postalCode: '43000',
    highlightText: 'Livraison d\'objectifs et caméras à El Kelâa des Sraghna et environs.',
    districts: ['Centre-Ville', 'Hay Al Qods', 'Hay Ennakhil']
  },
  {
    slug: 'ben-guerir',
    name: 'Ben Guerir',
    nameAr: 'ابن جرير',
    region: 'Marrakech-Safi',
    deliveryTime: '24h Express',
    population: '90K',
    postalCode: '43150',
    highlightText: 'Livraison de matériel audiovisuel à Ben Guerir, Ville Verte Mohammed VI (UM6P).',
    districts: ['Ville Verte UM6P', 'Centre-Ville', 'Hay Al Amal']
  },

  // 4. TANGER-TÉTOUAN-AL HOCEÏMA
  {
    slug: 'tanger',
    name: 'Tanger',
    nameAr: 'طنجة',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h Express',
    population: '1.2M',
    postalCode: '90000',
    highlightText: 'Fournisseur de référence pour photographes et créateurs de contenu à Tanger, Malabata, Marshan, City Center et Gzenaya.',
    districts: ['Malabata', 'Marshan', 'Iberia', 'Centre-Ville', 'Boubana', 'Gzenaya', 'Cap Spartel', 'California Tanger']
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
    districts: ['Centre-Ville', 'Wilaya', 'Martil', 'Cabo Negro', 'M\'diq', 'Fnideq', 'Coelma']
  },
  {
    slug: 'larache',
    name: 'Larache',
    nameAr: 'العرائش',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h - 48h',
    population: '130K',
    postalCode: '92000',
    highlightText: 'Livraison express d\'objectifs et caméras à Larache et Ksar El Kébir.',
    districts: ['Centre-Ville', 'Balcon Atlantico', 'Hay Al Wahda', 'Ksar El Kébir']
  },
  {
    slug: 'chefchaouen',
    name: 'Chefchaouen',
    nameAr: 'شفشاون',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h - 48h',
    population: '50K',
    postalCode: '91000',
    highlightText: 'Équipement pour photographes de voyage et vidéastes à Chefchaouen et environs.',
    districts: ['Medina', 'Outa El Hammam', 'Hay Al Ayoun']
  },
  {
    slug: 'al-hoceima',
    name: 'Al Hoceïma',
    nameAr: 'الحسيمة',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '48h Express',
    population: '60K',
    postalCode: '32000',
    highlightText: 'Livraison sécurisée de caméras, drones et objectifs à Al Hoceïma, Cala Bonita, Quemado et Imzouren.',
    districts: ['Quemado', 'Cala Bonita', 'Centre-Ville', 'Imzouren', 'Bni Bouayach']
  },
  {
    slug: 'asilah',
    name: 'Asilah',
    nameAr: 'أصيلـة',
    region: 'Tanger-Tétouan-Al Hoceïma',
    deliveryTime: '24h Express',
    population: '35K',
    postalCode: '90050',
    highlightText: 'Livraison rapide à Asilah pour artistes, photographes et vidéastes.',
    districts: ['Medina', 'Plage Asilah', 'Centre-Ville']
  },

  // 5. FÈS-MEKNÈS
  {
    slug: 'fes',
    name: 'Fès',
    nameAr: 'فاس',
    region: 'Fès-Meknès',
    deliveryTime: '24h Express',
    population: '1.1M',
    postalCode: '30000',
    highlightText: 'Vente et livraison d\'objectifs 7Artisans, filtres K&F Concept et caméras 4K à Fès, Ville Nouvelle, Champs de Course et Narjiss.',
    districts: ['Ville Nouvelle', 'Champs de Course', 'Narjiss', 'Route d\'Imouzzer', 'Mont Fleuri', 'Batha', 'Atlas']
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
    districts: ['Hamria', 'Marjane', 'Bassatine', 'Belle Vue', 'Plaisance', 'Sidi Bouzekri', 'Mansour']
  },
  {
    slug: 'taza',
    name: 'Taza',
    nameAr: 'تازة',
    region: 'Fès-Meknès',
    deliveryTime: '24h - 48h',
    population: '150K',
    postalCode: '35000',
    highlightText: 'Livraison express d\'équipement photo et vidéo à Taza, Taza Haut et Taza Bas.',
    districts: ['Taza Bas', 'Taza Haut', 'Hay Massira', 'Quartier Administratif']
  },
  {
    slug: 'ifrane',
    name: 'Ifrane',
    nameAr: 'إفران',
    region: 'Fès-Meknès',
    deliveryTime: '24h Express',
    population: '30K',
    postalCode: '53000',
    highlightText: 'Livraison d\'appareils photo, téléobjectifs et stabilisateurs à Ifrane, Azrou et Al Akhawayn (AUI).',
    districts: ['Centre-Ville', 'AUI Campus', 'Azrou', 'Michlifen']
  },

  // 6. SOUSS-MASSA
  {
    slug: 'agadir',
    name: 'Agadir',
    nameAr: 'أكادير',
    region: 'Souss-Massa',
    deliveryTime: '24h - 48h Express',
    population: '900K',
    postalCode: '80000',
    highlightText: 'Livraison rapide de matériel photo professionnel et DJI à Agadir, Talborjt, Founty, Taghazout, Dcheira et Inezgane.',
    districts: ['Talborjt', 'Founty', 'Sonaba', 'Charaf', 'Taghazout', 'Inezgane', 'Aït Melloul', 'Dcheira El Jihadia', 'Tamraght']
  },
  {
    slug: 'taroudant',
    name: 'Taroudant',
    nameAr: 'تارودانت',
    region: 'Souss-Massa',
    deliveryTime: '48h Express',
    population: '90K',
    postalCode: '83000',
    highlightText: 'Livraison d\'objectifs, caméras et projecteurs LED à Taroudant et Oulad Teïma.',
    districts: ['Medina', 'Derb Jdid', 'Oulad Teïma', 'Hay Mohammadi Taroudant']
  },
  {
    slug: 'tiznit',
    name: 'Tiznit',
    nameAr: 'تيزنيت',
    region: 'Souss-Massa',
    deliveryTime: '48h Express',
    population: '80K',
    postalCode: '85000',
    highlightText: 'Équipement photo et optiques livrés à Tiznit, Mirleft et Sidi Ifni.',
    districts: ['Centre-Ville', 'Medina Tiznit', 'Mirleft', 'Aglou']
  },

  // 7. L'ORIENTAL
  {
    slug: 'oujda',
    name: 'Oujda',
    nameAr: 'وجدة',
    region: 'L\'Oriental',
    deliveryTime: '24h - 48h',
    population: '550K',
    postalCode: '60000',
    highlightText: 'Livraison de matériel vidéo et photo dans toute la région de l\'Oriental : Oujda, Berkane, Saidia et Taourirt.',
    districts: ['Centre-Ville', 'Al Qods', 'Lazaret', 'Hay Andalous', 'Mir Ali', 'Route des Plages']
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
    districts: ['Centre-Ville', 'Corniche', 'Beni Ansar', 'Selouane', 'Al Aroui', 'Marchica']
  },
  {
    slug: 'berkane',
    name: 'Berkane',
    nameAr: 'بركان',
    region: 'L\'Oriental',
    deliveryTime: '24h - 48h',
    population: '110K',
    postalCode: '63300',
    highlightText: 'Livraison rapide à Berkane, Saidia, Ahfir et Cap de l\'Eau.',
    districts: ['Centre-Ville', 'Saidia Marina', 'Ahfir', 'Hay Salam Berkane']
  },
  {
    slug: 'taourirt',
    name: 'Taourirt',
    nameAr: 'تاوريرت',
    region: 'L\'Oriental',
    deliveryTime: '48h Express',
    population: '105K',
    postalCode: '65000',
    highlightText: 'Livraison de caméras et objectifs à Taourirt et Guercif.',
    districts: ['Centre-Ville', 'Hay Moulay Ali Cherif', 'Guercif']
  },

  // 8. BÉNI MELLAL-KHÉNIFRA
  {
    slug: 'beni-mellal',
    name: 'Béni Mellal',
    nameAr: 'بني ملال',
    region: 'Béni Mellal-Khénifra',
    deliveryTime: '24h - 48h',
    population: '220K',
    postalCode: '23000',
    highlightText: 'Livraison garantie d\'objectifs, éclairages studio et matériel vidéo à Béni Mellal, Fkih Ben Salah et Khénifra.',
    districts: ['Centre-Ville', 'Al Massira', 'Adouha', 'Oulad Hamdane', 'Fkih Ben Salah', 'Kasba Tadla']
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
    districts: ['Centre-Ville', 'Al Qods', 'Zaytoun', 'Hana', 'Oued Zem', 'Bejaad']
  },
  {
    slug: 'khenifra',
    name: 'Khénifra',
    nameAr: 'خنيفرة',
    region: 'Béni Mellal-Khénifra',
    deliveryTime: '48h Express',
    population: '120K',
    postalCode: '54000',
    highlightText: 'Livraison de matériel photo et vidéo à Khénifra et dans le Moyen Atlas.',
    districts: ['Centre-Ville', 'Hay Al Amal', 'Sources Oum Errabia']
  },

  // 9. DRÂA-TAFILALET
  {
    slug: 'ouarzazate',
    name: 'Ouarzazate',
    nameAr: 'ورزازات',
    region: 'Drâa-Tafilalet',
    deliveryTime: '48h Express Sécurisé',
    population: '80K',
    postalCode: '45000',
    highlightText: 'Fournisseur d\'objectifs cinéma et matériel de tournage pour réalisateurs et productions cinématographiques à Ouarzazate (Studios Atlas / CLA).',
    districts: ['Centre-Ville', 'Zone des Studios', 'Tabounte', 'Taourirt Ouarzazate']
  },
  {
    slug: 'errachidia',
    name: 'Errachidia',
    nameAr: 'الرشيدية',
    region: 'Drâa-Tafilalet',
    deliveryTime: '48h Express',
    population: '100K',
    postalCode: '52000',
    highlightText: 'Livraison de caméras, drones et objectifs à Errachidia, Erfoud, Rissani et Merzouga.',
    districts: ['Centre-Ville', 'Ain El Atti', 'Erfoud', 'Merzouga']
  },
  {
    slug: 'tinghir',
    name: 'Tinghir',
    nameAr: 'تنغير',
    region: 'Drâa-Tafilalet',
    deliveryTime: '48h Express',
    population: '45K',
    postalCode: '45800',
    highlightText: 'Équipement photo pour paysages et voyages à Tinghir et Gorges du Todgha.',
    districts: ['Centre-Ville', 'Todgha', 'Boumalne Dadès']
  },

  // 10. GUELMIM-OUED NOUN
  {
    slug: 'guelmim',
    name: 'Guelmim',
    nameAr: 'كلميم',
    region: 'Guelmim-Oued Noun',
    deliveryTime: '48h Express Sécurisé',
    population: '120K',
    postalCode: '81000',
    highlightText: 'Porte du Sahara marocain : livraison de matériel audiovisuel à Guelmim, Tan-Tan et Sidi Ifni.',
    districts: ['Centre-Ville', 'Al Qods', 'Tan-Tan', 'Sidi Ifni']
  },

  // 11. LAÂYOUNE-SAKIA EL HAMRA
  {
    slug: 'laayoune',
    name: 'Laâyoune',
    nameAr: 'العيون',
    region: 'Laâyoune-Sakia El Hamra',
    deliveryTime: '48h Express Sécurisé',
    population: '260K',
    postalCode: '70000',
    highlightText: 'Livraison express sécurisée de matériel audiovisuel et caméras DJI à Laâyoune, Al Wifaq, Dcheira, El Marsa, Boujdour et Smara.',
    districts: ['Centre-Ville', 'Al Wifaq', 'Hay Al Amal', 'El Marsa', 'Al Qods', 'Boujdour', 'Smara', 'Tarfaya']
  },

  // 12. DAKHLA-OUED ED-DAHAB
  {
    slug: 'dakhla',
    name: 'Dakhla',
    nameAr: 'الداخلة',
    region: 'Dakhla-Oued Ed-Dahab',
    deliveryTime: '48h Express Sécurisé',
    population: '150K',
    postalCode: '73000',
    highlightText: 'Fournisseur d\'équipement photo, drones, caméras 4K nomades et stabilisateurs pour photographes et créateurs à Dakhla, Oued Eddahab et Lagouira.',
    districts: ['Centre-Ville', 'Kassambar', 'Al Massira', 'Oum Tounsi', 'Dakhla Attitude', 'Lassarga']
  }
];

export function getCityBySlug(slug: string): MoroccanCity | undefined {
  const normalized = (slug || '').toLowerCase().trim();
  return moroccanCities.find(c => c.slug === normalized || c.slug === normalized.replace(/_/g, '-'));
}
