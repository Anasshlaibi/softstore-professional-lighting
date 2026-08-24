import { Product } from '../../App';
import { generateProductSearchAliases, normalizeQuery } from './textNormalization';

export interface SEOHighlight {
  label: string;
  value: string;
  icon?: string;
}

export interface SEOSpecification {
  label: string;
  value: string;
}

export interface SEOFAQItem {
  question: string;
  answer: string;
}

export interface SEOQualityReport {
  score: number; // 0 - 100
  passedChecks: string[];
  missingFields: string[];
}

export interface ProductSEOPackage {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  introduction: string;
  highlights: SEOHighlight[];
  specifications: SEOSpecification[];
  targetAudience: string;
  useCases: string[];
  compatibilityText: string;
  compatibilityLink?: { label: string; url: string };
  relatedProducts: Product[];
  faqs: SEOFAQItem[];
  productSchema: Record<string, any>;
  breadcrumbSchema: Record<string, any>;
  faqSchema: Record<string, any>;
  seoQuality: SEOQualityReport;
  searchAliases: string[];
}

export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getProductBrand(product: Product): string | undefined {
  if (product.brand && product.brand.trim()) return product.brand.trim();
  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase();
  if (text.includes('7artisans')) return '7Artisans';
  if (text.includes('k&f') || text.includes('kf concept') || text.includes('concept')) return 'K&F Concept';
  if (text.includes('sony')) return 'Sony';
  if (text.includes('canon')) return 'Canon';
  if (text.includes('nikon')) return 'Nikon';
  if (text.includes('fujifilm') || text.includes('fuji')) return 'Fujifilm';
  if (text.includes('panasonic') || text.includes('lumix')) return 'Panasonic Lumix';
  if (text.includes('dji')) return 'DJI';
  if (text.includes('godox')) return 'Godox';
  if (text.includes('rode') || text.includes('røde')) return 'Røde';
  if (text.includes('smallrig')) return 'SmallRig';
  if (text.includes('sirui')) return 'Sirui';
  if (text.includes('zhiyun')) return 'Zhiyun';
  if (text.includes('aputure') || text.includes('amaran')) return 'Aputure';
  return undefined;
}

export function getProductMount(product: Product): string | undefined {
  if (product.mount && product.mount.trim()) return product.mount.trim();
  const text = `${product.name || ''} ${product.desc || ''}`.toLowerCase();
  if (text.includes('sony e') || text.includes('e-mount') || text.includes('e mount')) return 'Sony E';
  if (text.includes('canon rf') || text.includes('eos-r') || text.includes('rf-mount') || text.includes('rf mount')) return 'Canon RF';
  if (text.includes('canon ef')) return 'Canon EF';
  if (text.includes('nikon z') || text.includes('z-mount') || text.includes('z mount')) return 'Nikon Z';
  if (text.includes('fuji fx') || text.includes('x-mount') || text.includes('fujifilm x')) return 'Fujifilm X';
  if (text.includes('l-mount') || text.includes('l mount')) return 'L-Mount';
  if (text.includes('m43') || text.includes('micro 4/3') || text.includes('micro four thirds')) return 'Micro 4/3';
  if (text.includes('pl mount') || text.includes('pl-mount')) return 'PL Mount';
  return undefined;
}

// Parse attributes reliably from verified strings without inventing missing data
function parseTechnicalAttributes(product: Product) {
  const text = `${product.name} ${product.desc} ${(product.specs || []).join(' ')}`.toLowerCase();

  const focalMatch = product.name.match(/(\d+(?:-\d+)?\s*mm)/i) || text.match(/(\d+(?:-\d+)?\s*mm)/i);
  const focalLength = focalMatch ? focalMatch[1] : undefined;

  const apertureMatch = product.name.match(/(f\/?\d+(?:\.\d+)?|t\d+(?:\.\d+)?)/i) || text.match(/(f\/?\d+(?:\.\d+)?|t\d+(?:\.\d+)?)/i);
  const aperture = apertureMatch ? apertureMatch[1].toUpperCase() : undefined;

  const powerMatch = product.name.match(/(\d+W|\d+\s*watts)/i) || text.match(/(\d+W|\d+\s*watts)/i);
  const power = powerMatch ? powerMatch[1].toUpperCase() : undefined;

  const isAF = text.includes('autofocus') || text.includes('auto focus') || text.includes('af ') || product.name.includes('AF');
  const focusType = (focalLength || aperture) ? (isAF ? 'Autofocus' : 'Mise au point manuelle') : undefined;

  return { focalLength, aperture, focusType, power };
}

export function generateProductSEOPackage(
  product: Product,
  allProducts: Product[] = []
): ProductSEOPackage {
  const brand = getProductBrand(product);
  const mount = getProductMount(product);
  const { focalLength, aperture, focusType, power } = parseTechnicalAttributes(product);
  const slug = slugify(product.name);
  const canonicalUrl = `https://gearshop.ma/product/${product.id}-${slug}`;

  const isPreorder = product.isPreorder ||
    (product as any).status === 'Précommande' ||
    product.name.toLowerCase().includes('précommande') ||
    product.name.toLowerCase().includes('preorder') ||
    (product.specs || []).some(s => s.toLowerCase().includes('précommande'));

  // ===== 1. SEO TITLE (Priority: Admin Override > Generated > Fallback) =====
  let seoTitle = product.seo_title;
  if (!seoTitle) {
    let keySpec = '';
    if (focalLength && aperture) keySpec = `${focalLength} ${aperture}`;
    else if (focalLength) keySpec = focalLength;
    else if (mount) keySpec = `Monture ${mount}`;
    else if (power) keySpec = power;

    const mainCategory = product.category || 'Matériel Photo & Vidéo';
    seoTitle = `${brand} ${product.name}${keySpec ? ` (${keySpec})` : ''} | ${mainCategory} | GearShop`;
    if (seoTitle.length > 75) {
      seoTitle = `${product.name} | ${brand} Maroc | GearShop`;
    }
  }

  // ===== 2. META DESCRIPTION (Priority: Admin Override > Generated > Fallback) =====
  let metaDescription = product.meta_description;
  if (!metaDescription) {
    const priceText = product.price > 0 ? ` au prix de ${product.price.toLocaleString('fr-MA')} DH` : '';
    const stockStatusText = isPreorder
      ? 'Disponible en précommande chez GearShop Maroc'
      : product.inStock
      ? 'En stock avec livraison rapide'
      : 'Sur commande à Casablanca';
    const specDetails = [mount ? `monture ${mount}` : null, focalLength, aperture].filter(Boolean).join(', ');

    metaDescription = `Découvrez le ${product.name} (${brand}${specDetails ? `, ${specDetails}` : ''})${priceText} chez GearShop. ${stockStatusText}. Garantie 1 an.`;
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + '...';
    }
  }

  // ===== 3. INTRODUCTION (Priority: Admin Override > Generated > Fallback) =====
  let introduction = product.seo_intro || product.seo_description;
  if (!introduction) {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('objectif') || cat.includes('lens') || cat.includes('lentille')) {
      introduction = `Le ${product.name} est un objectif développé par ${brand}${mount ? ` pour la monture ${mount}` : ''}. Sélectionné par GearShop Maroc pour sa précision optique et sa qualité de fabrication, cet objectif convient aux photographes et vidéastes exigeants.`;
    } else if (cat.includes('éclairage') || cat.includes('light') || cat.includes('studio') || cat.includes('portable')) {
      introduction = `Le projecteur ${product.name} de ${brand} offre un éclairage performant pour les shootings photo et tournages vidéo au Maroc, garantissant un contrôle précis de la lumière.`;
    } else if (cat.includes('accessoire') || cat.includes('filter') || cat.includes('filtre')) {
      introduction = `Le ${product.name} par ${brand} est un accessoire conçu pour optimiser la qualité de vos prises de vues en studio et sur le terrain.`;
    } else {
      introduction = `Le ${product.name} de ${brand} est disponible chez GearShop Maroc. Cet équipement est sélectionné pour sa fiabilité et ses performances adaptées aux créateurs d'images au Maroc.`;
    }
  }

  // ===== 4. HIGHLIGHTS (Only verified existing data) =====
  const highlights: SEOHighlight[] = [];
  if (brand && brand !== 'GearShop') highlights.push({ label: 'Marque', value: brand, icon: 'fa-solid fa-copyright' });
  if (focalLength) highlights.push({ label: 'Focale', value: focalLength, icon: 'fa-solid fa-bullseye' });
  if (aperture) highlights.push({ label: 'Ouverture Max', value: aperture, icon: 'fa-solid fa-circle-dot' });
  if (mount) highlights.push({ label: 'Monture', value: mount, icon: 'fa-solid fa-camera' });
  if (focusType) highlights.push({ label: 'Autofocus', value: focusType, icon: 'fa-solid fa-sliders' });
  if (power) highlights.push({ label: 'Puissance', value: power, icon: 'fa-solid fa-bolt' });
  highlights.push({ label: 'Garantie', value: '1 An (GearShop Maroc)', icon: 'fa-solid fa-shield-halved' });

  // ===== 5. TECHNICAL SPECIFICATIONS TABLE (Verified entries only) =====
  const specifications: SEOSpecification[] = [];
  specifications.push({ label: 'Marque constructeur', value: brand });
  if (mount) specifications.push({ label: 'Monture d\'objectif', value: mount });
  if (focalLength) specifications.push({ label: 'Plage focale', value: focalLength });
  if (aperture) specifications.push({ label: 'Ouverture maximale', value: aperture });
  if (focusType) specifications.push({ label: 'Mode de mise au point', value: focusType });
  if (power) specifications.push({ label: 'Puissance nominale', value: power });
  specifications.push({ label: 'Statut de disponibilité', value: isPreorder ? 'Précommande' : product.inStock ? 'En stock' : 'Rupture / Sur commande' });

  (product.specs || []).forEach(specStr => {
    if (specStr.includes(':') || specStr.includes('：')) {
      const parts = specStr.split(/[:：]/);
      if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        const label = parts[0].trim();
        if (!specifications.some(s => s.label.toLowerCase() === label.toLowerCase())) {
          specifications.push({ label, value: parts.slice(1).join(':').trim() });
        }
      }
    }
  });

  // ===== 6. TARGET AUDIENCE & USE CASES (Category Aware) =====
  let targetAudience = '';
  const useCases: string[] = [];
  const cat = (product.category || '').toLowerCase();
  const nameLower = product.name.toLowerCase();

  if (cat.includes('cinéma') || cat.includes('cine') || nameLower.includes('t2.0') || nameLower.includes('t2.1') || nameLower.includes('t1.05')) {
    targetAudience = `Conçu pour les directeurs photo, vidéastes et studios de production réalisant des tournages cinéma, publicités et documentaires au Maroc.`;
    useCases.push('Cinéma & Court-métrage', 'Vidéo Professionnelle', 'Publicité Commerciale', 'Documentaire');
  } else if (focalLength && (focalLength.includes('35') || focalLength.includes('50') || focalLength.includes('85') || focalLength.includes('135'))) {
    targetAudience = `Idéal pour les photographes de portrait, de mariage, de mode et d'événementiel.`;
    useCases.push('Photographie de Portrait', 'Mariage & Événementiel', 'Photo de Mode', 'Reportage');
  } else if (cat.includes('éclairage') || cat.includes('light') || cat.includes('studio') || cat.includes('portable')) {
    targetAudience = `Adapté aux créateurs de contenu, vidéastes et photographes nécessitant un éclairage continu en studio ou en extérieur.`;
    useCases.push('Éclairage Studio', 'Interview & Tournage', 'Vidéo YouTube / Content', 'Shooting Produit');
  } else {
    targetAudience = `Adapté aux photographes et créateurs de contenu souhaitant élever la qualité de leurs réalisations.`;
    useCases.push('Photographie & Vidéo', 'Création de Contenu', 'Tournage Nomade');
  }

  // ===== 7. COMPATIBILITY & LINKS =====
  let compatibilityText = 'Compatible avec les équipements photo/vidéo standards.';
  let compatibilityLink: { label: string; url: string } | undefined = undefined;

  if (mount) {
    compatibilityText = `Compatible avec les appareils et caméras équipés d'une monture native ${mount}.`;
    if (mount.includes('Sony')) compatibilityLink = { label: 'Gamme Sony E', url: '/marque/sony' };
    else if (mount.includes('Canon')) compatibilityLink = { label: 'Gamme Canon RF', url: '/marque/canon' };
    else if (mount.includes('Nikon')) compatibilityLink = { label: 'Gamme Nikon Z', url: '/marque/nikon' };
    else if (mount.includes('Fuji')) compatibilityLink = { label: 'Gamme Fujifilm X', url: '/marque/fujifilm' };
    else if (mount.includes('L-Mount') || mount.includes('M43')) compatibilityLink = { label: 'Gamme Panasonic Lumix', url: '/marque/lumix' };
  } else if (brand.includes('K&F')) {
    compatibilityText = 'Compatible avec les optiques et objectifs standards via diamètres ou bagues.';
    compatibilityLink = { label: 'Gamme K&F Concept', url: '/marque/kf-concept' };
  }

  // ===== 8. RELATED PRODUCTS =====
  const relatedProducts = allProducts.length > 0
    ? allProducts
        .filter(p => p.id !== product.id && (p.category === product.category || (mount && p.mount === mount)))
        .slice(0, 4)
    : [];

  // ===== 9. FAQ SECTION (Safely grounded in verified data) =====
  const faqs: SEOFAQItem[] = [];

  if (product.custom_faq && product.custom_faq.length > 0) {
    faqs.push(...product.custom_faq);
  } else {
    if (mount) {
      faqs.push({
        question: `Le ${product.name} est-il compatible avec la monture ${mount} ?`,
        answer: `Oui, le ${product.name} est compatible avec la monture ${mount}.`
      });
    }

    if (focalLength) {
      faqs.push({
        question: `Quelle est la plage focale de cet objectif ?`,
        answer: `La plage focale de cet objectif est de ${focalLength}${aperture ? ` avec une ouverture maximale de ${aperture}` : ''}.`
      });
    }

    if (isPreorder) {
      faqs.push({
        question: `Ce produit est-il en précommande ?`,
        answer: `Oui, le ${product.name} est actuellement disponible en précommande chez GearShop Maroc au prix de ${product.price > 0 ? `${product.price.toLocaleString('fr-MA')} DH` : 'sur demande'}.`
      });
    } else {
      faqs.push({
        question: `Le ${product.name} est-il sous garantie au Maroc ?`,
        answer: `Oui, tous nos produits neufs sont accompagnés d'une garantie d'un an assurée par GearShop Maroc.`
      });
    }

    faqs.push({
      question: `Puis-je tester cet équipement avant de l'acheter ?`,
      answer: `Oui, vous pouvez passer dans notre magasin à Casablanca pour tester ce matériel avec votre propre boîtier.`
    });
  }

  // ===== 10. STRUCTURED DATA SCHEMAS (Accurate schema.org representation) =====
  let offerAvailability = 'https://schema.org/InStock';
  if (isPreorder) {
    offerAvailability = 'https://schema.org/PreOrder';
  } else if (!product.inStock) {
    offerAvailability = 'https://schema.org/OutOfStock';
  }

  const productImages = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : (product.image ? [product.image] : []);

  const hasRealPrice = product.price && Number(product.price) > 0;
  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': canonicalUrl,
    'name': product.name,
    'image': productImages,
    'description': metaDescription,
    ...(brand ? {
      'brand': {
        '@type': 'Brand',
        'name': brand
      }
    } : {}),
    'offers': {
      '@type': 'Offer',
      '@id': `${canonicalUrl}#offer`,
      'url': canonicalUrl,
      'priceCurrency': 'MAD',
      ...(hasRealPrice ? { 'price': product.price.toString() } : {}),
      'availability': offerAvailability,
      'itemCondition': product.product_group === 'used' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      'seller': {
        '@type': 'Organization',
        'name': 'GearShop Maroc'
      }
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Accueil',
        'item': 'https://gearshop.ma/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': product.category || 'Matériel',
        'item': `https://gearshop.ma/categorie/${slugify(product.category || 'objectifs')}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': canonicalUrl
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  };

  // ===== 11. CATEGORY-AWARE SEO QUALITY SCORE =====
  const passedChecks: string[] = [];
  const missingFields: string[] = [];
  let score = 0;

  // Title check (20 pts)
  if (product.name && product.name.length >= 5) {
    score += 20;
    passedChecks.push('Titre valide');
  } else {
    missingFields.push('Titre trop court');
  }

  // Price check (20 pts)
  if (product.price && product.price > 0) {
    score += 20;
    passedChecks.push('Prix renseigné');
  } else {
    missingFields.push('Prix absent');
  }

  // Description check (20 pts)
  if (product.desc && product.desc.length > 30) {
    score += 20;
    passedChecks.push('Description valide');
  } else {
    missingFields.push('Description trop courte');
  }

  // Brand check (15 pts)
  if (brand && brand !== 'GearShop') {
    score += 15;
    passedChecks.push(`Marque (${brand})`);
  } else {
    missingFields.push('Marque indéfinie');
  }

  // Images check (15 pts)
  if (product.image) {
    score += 15;
    passedChecks.push('Image principale disponible');
  } else {
    missingFields.push('Image principale manquante');
  }

  // Category specific checks (10 pts)
  const categoryLower = (product.category || '').toLowerCase();
  if (categoryLower.includes('objectif') || categoryLower.includes('lens')) {
    if (mount) {
      score += 10;
      passedChecks.push(`Monture spécifiée (${mount})`);
    } else {
      missingFields.push('Monture d\'objectif recommandée');
    }
  } else {
    // Non-lens categories automatically pass the category specificity check
    score += 10;
    passedChecks.push('Catégorie spécifique');
  }

  const seoQuality: SEOQualityReport = {
    score: Math.min(100, score),
    passedChecks,
    missingFields
  };

  const searchAliases = product.search_aliases || generateProductSearchAliases(product);

  return {
    seoTitle,
    metaDescription,
    canonicalUrl,
    introduction,
    highlights,
    specifications,
    targetAudience,
    useCases,
    compatibilityText,
    compatibilityLink,
    relatedProducts,
    faqs,
    productSchema,
    breadcrumbSchema,
    faqSchema,
    seoQuality,
    searchAliases
  };
}
