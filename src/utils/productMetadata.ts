import { Product } from '../../App';
import { FilterState } from '../../components/ProductFilters';

export interface ProductAttributes {
  product_type: 'lens' | 'light' | 'camera' | 'filter' | 'adapter' | 'audio' | 'accessory' | 'other';
  lens_type?: 'cinema' | 'autofocus' | 'manual';
  focus_type?: 'autofocus' | 'manual';
  prime_or_zoom?: 'prime' | 'zoom';
  mount?: string;
  focal_length?: string;
  aperture?: string;
  t_stop?: string;
  filter_diameter?: number; // e.g. 49, 52, 55, 58, 62, 67, 72, 77, 82, 95
  condition?: 'new' | 'used' | 'rental';
  brand: string;
}

/**
 * Intelligent and future-proof metadata extractor.
 * 
 * 1. Checks if explicit attributes exist on the Product object (for future Admin Panel/DB columns).
 * 2. Otherwise applies robust domain-specific rules based on title, category, specs, and descriptions.
 */
export function extractProductAttributes(p: Product): ProductAttributes {
  const name = String(p.name || '').trim();
  const cat = String(p.category || '').trim().toLowerCase();
  const desc = String(p.desc || '').trim().toLowerCase();
  const nameLower = name.toLowerCase();
  const fullText = `${nameLower} ${cat} ${desc}`;

  // 1. BRAND DETECTION (DB column > ID ranges > text analysis > fallback)
  const pRecord = p as unknown as Record<string, unknown>;
  let brand = typeof p.brand === 'string' && p.brand ? p.brand : (typeof pRecord.brand === 'string' ? pRecord.brand : '');
  if (!brand) {
    const pId = Number(p.id);
    if (pId >= 1000 && pId < 2000) {
      brand = '7Artisans';
    } else if (pId >= 2000 && pId < 3000) {
      brand = 'K&F Concept';
    } else if (pId >= 3000 && pId < 4000) {
      brand = 'DJI';
    } else if (nameLower.includes('7artisans') || fullText.includes('7artisans') || fullText.includes('sevenartisans')) {
      brand = '7Artisans';
    } else if (nameLower.includes('k&f') || nameLower.includes('kf concept') || nameLower.includes('kentfaith')) {
      brand = 'K&F Concept';
    } else if (nameLower.includes('dji') || nameLower.includes('osmo') || cat.includes('dji')) {
      brand = 'DJI';
    } else if (nameLower.includes('godox') || cat.includes('godox')) {
      brand = 'Godox';
    } else if (nameLower.includes('smallrig') || cat.includes('smallrig')) {
      brand = 'SmallRig';
    } else if (nameLower.includes('vanguard') || cat.includes('vanguard')) {
      brand = 'Vanguard';
    } else if (nameLower.includes('hollyland') || cat.includes('hollyland')) {
      brand = 'Hollyland';
    } else if (nameLower.includes('insta360') || cat.includes('insta360')) {
      brand = 'Insta360';
    } else if (nameLower.includes('kodak') || cat.includes('kodak')) {
      brand = 'Kodak';
    } else if (nameLower.includes('agfa') || cat.includes('agfa')) {
      brand = 'Agfa';
    } else if (nameLower.includes('pny') || cat.includes('pny')) {
      brand = 'PNY';
    } else if (nameLower.includes('sandisk') || cat.includes('sandisk')) {
      brand = 'SanDisk';
    } else if (nameLower.includes('atomos') || cat.includes('atomos')) {
      brand = 'Atomos';
    } else if (nameLower.includes('rode') || nameLower.includes('røde') || cat.includes('rode')) {
      brand = 'Røde';
    } else if (nameLower.includes('yongnuo') || cat.includes('yongnuo')) {
      brand = 'Yongnuo';
    } else if ((nameLower.includes('sony') || cat.includes('sony')) && !nameLower.includes('sony e') && !nameLower.includes('(e mount)')) {
      brand = 'Sony';
    } else if ((nameLower.includes('canon') || cat.includes('canon')) && !nameLower.includes('canon rf') && !nameLower.includes('(eos-r') && !nameLower.includes('canon ef') && !nameLower.includes('for canon')) {
      brand = 'Canon';
    } else if ((nameLower.includes('nikon') || cat.includes('nikon')) && !nameLower.includes('nikon z') && !nameLower.includes('(z mount)') && !nameLower.includes('for nikon')) {
      brand = 'Nikon';
    } else if (nameLower.includes('fuji') || nameLower.includes('fujifilm') || cat.includes('fuji')) {
      brand = 'Fujifilm';
    } else if (nameLower.includes('panasonic') || nameLower.includes('lumix') || cat.includes('panasonic')) {
      brand = 'Panasonic';
    } else {
      brand = 'Équipement Pro';
    }
  }

  // 2. PRODUCT TYPE DETECTION (Strict separation of lenses vs non-lenses)
  let product_type: ProductAttributes['product_type'] = pRecord.product_type as ProductAttributes['product_type'];
  if (!product_type) {
    // Explicit non-lens indicators
    if (nameLower.includes('adapter') || nameLower.includes('adaptateur') || nameLower.includes('bague d\'adaptation')) {
      product_type = 'adapter';
    } else if (nameLower.includes('filter') || nameLower.includes('filtre') || nameLower.includes('vnd') || nameLower.includes('black mist') || nameLower.includes('uv filter') || nameLower.includes('cpl') || cat.includes('filtre')) {
      product_type = 'filter';
    } else if (cat.includes('studio') || cat.includes('éclairage') || cat.includes('eclairage') || cat.includes('portable') || cat.includes('flash') || cat.includes('tube led') || cat.includes('boite à lumière') || nameLower.includes('light') || nameLower.includes('spotlight') || nameLower.includes('led') || nameLower.includes('bkl') || nameLower.includes('softbox') || nameLower.includes('flash') || nameLower.includes('lux') || nameLower.includes('sl60') || nameLower.includes('godox')) {
      product_type = 'light';
    } else if (cat.includes('audio') || cat.includes('microphone') || cat.includes('casque') || cat.includes('intercom') || nameLower.includes('micro') || nameLower.includes('wireless go') || nameLower.includes('lark') || nameLower.includes('solidcom') || nameLower.includes('mic')) {
      product_type = 'audio';
    } else if (cat.includes('appareil photo') || cat.includes('caméra') || cat.includes('camera') || cat.includes('boîtier') || nameLower.includes('boitier') || nameLower.includes('body') || nameLower.includes('alpha') || nameLower.includes('eos') || nameLower.includes('z5') || nameLower.includes('z6') || nameLower.includes('z7') || nameLower.includes('z8') || nameLower.includes('z9') || nameLower.includes('z30') || nameLower.includes('z50') || nameLower.includes('zfc') || nameLower.includes('insta360')) {
      product_type = 'camera';
    } else if (cat.includes('sac') || cat.includes('valise') || cat.includes('trépied') || cat.includes('trepied') || cat.includes('stabilisateur') || cat.includes('cage') || cat.includes('rig') || cat.includes('batterie') || cat.includes('carte') || cat.includes('accessories') || cat.includes('accessoire') || nameLower.includes('tripod') || nameLower.includes('trépied') || nameLower.includes('battery') || nameLower.includes('batterie') || nameLower.includes('card') || nameLower.includes('carte') || nameLower.includes('cage') || nameLower.includes('smallrig') || nameLower.includes('vanguard')) {
      product_type = 'accessory';
    } else if (cat.includes('lenses') || cat.includes('lentilles') || cat.includes('objectif') || /\b\d+(\.\d+)?\s*mm\b/i.test(name) || nameLower.includes('fisheye')) {
      // Must be an actual lens
      product_type = 'lens';
    } else {
      product_type = 'accessory';
    }
  }

  // 3. LENS ATTRIBUTES (Cinema vs Autofocus vs Manual)
  let lens_type: ProductAttributes['lens_type'] = undefined;
  let focus_type: ProductAttributes['focus_type'] = undefined;
  let t_stop: string | undefined = undefined;
  let aperture: string | undefined = undefined;
  let focal_length: string | undefined = undefined;

  if (product_type === 'lens') {
    // Check for explicit database/admin field
    if (pRecord.lens_type) {
      lens_type = pRecord.lens_type as ProductAttributes['lens_type'];
      focus_type = lens_type === 'autofocus' ? 'autofocus' : 'manual';
    } else {
      // Robust Cinema detection:
      // T-stop regex pattern: e.g. T2.0, T1.5, T2.1, T/2.0, T2, T1.05, T2.9
      const tStopMatch = name.match(/\b[tT]\s*\/?\s*(\d+(\.\d+)?)\b/);
      const hasCineKeyword = /\b(cine|ciné|cinema|cinéma|anamorphic|anamorphique|vision series|spectrum series|firefly|dzofilm|nanomorph|vespid|irix cine|blazar|great joy|cattach)\b/i.test(fullText);
      const isCineCategory = cat.includes('cinéma') || cat.includes('cinema') || cat.includes('lentilles cinéma');

      if (tStopMatch || hasCineKeyword || isCineCategory) {
        lens_type = 'cinema';
        focus_type = 'manual'; // Most cine lenses in this tier are geared manual focus
        if (tStopMatch) t_stop = `T${tStopMatch[1]}`;
      } else {
        // Explicit AF indicators
        const hasExplicitAF = /\baf\b/i.test(name) ||
                             /\baf\d+/i.test(name) ||
                             /autofocus/i.test(fullText) ||
                             /auto-focus/i.test(fullText) ||
                             /\b(stm|usm|hsm|vxd|rxd|dg dn|dc dn|di iii|g master|\bgm\b|s-line|lm wr|linear motor)\b/i.test(fullText) ||
                             fullText.includes('mise au point automatique');

        // Explicit Manual indicators
        const hasExplicitMF = /\b(mf|manual focus|mise au point manuelle|focus manuel)\b/i.test(fullText);

        // Manual specialty brands (7Artisans, TTArtisan, Laowa, Voigtlander, Mitakon, AstrHori, etc.)
        const pId = Number(p.id);
        const isManualBrand = /\b(7artisans|sevenartisans|ttartisan|laowa|venus optics|mitakon|zhongyi|voigtländer|voigtlander|astrhori|kamlan|brightin star|pergear)\b/i.test(fullText) ||
                              (pId === 10 || (pId >= 1000 && pId < 2000 && !hasExplicitAF));

        if (hasExplicitAF) {
          lens_type = 'autofocus';
          focus_type = 'autofocus';
        } else if (hasExplicitMF || isManualBrand) {
          lens_type = 'manual';
          focus_type = 'manual';
        } else {
          // Standard modern digital photography lenses (Sony, Canon, Nikon, Fuji, Panasonic, Sigma, Tamron, etc.) default to Autofocus
          lens_type = 'autofocus';
          focus_type = 'autofocus';
        }
      }
    }

    // Extract Aperture if F-stop
    const fMatch = name.match(/\b[fF]\s*\/?\s*(\d+(\.\d+)?)\b/);
    if (fMatch) aperture = `F${fMatch[1]}`;

    // Extract Focal Length (e.g. 10mm, 16mm, 24mm, 35mm, 50mm, 135mm)
    const focalMatch = name.match(/\b(\d+(\.\d+)?)\s*mm\b/i);
    if (focalMatch) focal_length = `${focalMatch[1]}mm`;
  }

  // 4. FILTER DIAMETER EXTRACTION (For filters & lenses with filter threads)
  let filter_diameter: number | undefined = typeof pRecord.filter_diameter === 'number' ? pRecord.filter_diameter : undefined;
  if (!filter_diameter) {
    // Look for diameter pattern in name e.g. 77mm, 55mm, 82mm
    const diamMatch = name.match(/\b(\d{2,3})\s*mm\b/i);
    if (diamMatch) {
      const num = parseInt(diamMatch[1], 10);
      // Valid filter sizes usually range 37mm to 105mm
      if ([37, 39, 40.5, 43, 46, 49, 52, 55, 58, 62, 67, 72, 77, 82, 86, 95, 105].includes(num)) {
        filter_diameter = num;
      }
    }
  }

  // 5. CAMERA MOUNT DETECTION (DB column > text analysis)
  let mount = typeof p.mount === 'string' && p.mount ? p.mount : (typeof pRecord.mount === 'string' ? pRecord.mount : '');
  if (!mount) {
    if (fullText.includes('sony e') || fullText.includes('e mount') || fullText.includes('e-mount') || fullText.includes('(e mount)')) mount = 'Sony E';
    else if (fullText.includes('canon rf') || fullText.includes('eos-r') || fullText.includes('rf mount') || fullText.includes('(eos-r mount)')) mount = 'Canon RF';
    else if (fullText.includes('canon ef') || fullText.includes('ef mount')) mount = 'Canon EF';
    else if (fullText.includes('nikon z') || fullText.includes('z mount') || fullText.includes('(z mount)')) mount = 'Nikon Z';
    else if (fullText.includes('fuji') || fullText.includes('fx mount')) mount = 'Fuji FX';
    else if (fullText.includes('m43') || fullText.includes('micro 4/3') || fullText.includes('olympus') || fullText.includes('panasonic olympus')) mount = 'M43';
    else if (fullText.includes('l mount') || fullText.includes('leica l') || fullText.includes('sigma l') || fullText.includes('(l mount)')) mount = 'L Mount';
    else if (fullText.includes('pl mount') || fullText.includes('cinema pl')) mount = 'PL Mount';
    else mount = 'Universel';
  }

  // 6. CONDITION / GROUP
  let condition: ProductAttributes['condition'] = (pRecord.product_group || pRecord.condition) as ProductAttributes['condition'];
  if (!condition) {
    if (cat.includes('occasion') || fullText.includes('occasion') || fullText.includes('seconde main') || fullText.includes('used')) {
      condition = 'used';
    } else if (cat.includes('location') || fullText.includes('location') || fullText.includes('rental')) {
      condition = 'rental';
    } else {
      condition = 'new';
    }
  }

  return {
    product_type,
    lens_type,
    focus_type,
    prime_or_zoom: 'prime', // Default prime
    mount,
    focal_length,
    aperture,
    t_stop,
    filter_diameter,
    condition,
    brand,
  };
}

/**
 * Universal category matcher used across CatalogSidebar, Products, and FilterDrawer.
 * Resolves both friendly display labels ('Appareils Photo', 'Objectifs', etc.) and raw DB categories.
 */
export function isProductMatchingCategory(
  p: Product,
  targetCategory: string,
  providedAttr?: ProductAttributes
): boolean {
  if (!targetCategory || targetCategory === 'all') return true;
  const catLower = targetCategory.toLowerCase();
  const pCatLower = (p.category || '').toLowerCase();
  const pNameLower = (p.name || '').toLowerCase();
  const attr = providedAttr || extractProductAttributes(p);

  if (pCatLower === catLower) return true;

  if (catLower.includes('occasion') || catLower.includes('used') || catLower.includes('déstockage') || catLower.includes('destockage')) {
    return (
      pCatLower.includes('occasion') ||
      pCatLower.includes('used') ||
      pNameLower.includes('occasion') ||
      pNameLower.includes('used')
    );
  }

  if (catLower.includes('dji') || catLower.includes('gimbal')) {
    return (
      pNameLower.includes('dji') ||
      pNameLower.includes('ronin') ||
      pNameLower.includes('osmo') ||
      pCatLower.includes('dji') ||
      pCatLower.includes('gimbal') ||
      pCatLower.includes('stabilisateur')
    );
  }

  if (catLower.includes('appareil') || catLower.includes('caméra') || catLower.includes('camera')) {
    return (
      attr.product_type === 'camera' ||
      pCatLower.includes('appareil') ||
      pCatLower.includes('camera') ||
      pCatLower.includes('caméra') ||
      pCatLower.includes('boîtier') ||
      pCatLower.includes('boitier') ||
      pNameLower.includes('camera') ||
      pNameLower.includes('caméra') ||
      pNameLower.includes('alpha') ||
      pNameLower.includes('eos') ||
      pNameLower.includes('z5') ||
      pNameLower.includes('z6') ||
      pNameLower.includes('z7') ||
      pNameLower.includes('z8') ||
      pNameLower.includes('z9')
    );
  }

  if (catLower.includes('objectif') || catLower.includes('lens')) {
    return (
      attr.product_type === 'lens' ||
      pCatLower.includes('lens') ||
      pCatLower.includes('objectif') ||
      pCatLower.includes('lentille')
    );
  }

  if (
    catLower.includes('éclairage') ||
    catLower.includes('eclairage') ||
    catLower.includes('flash') ||
    catLower.includes('light') ||
    catLower.includes('studio')
  ) {
    return (
      attr.product_type === 'light' ||
      pCatLower.includes('flash') ||
      pCatLower.includes('tube led') ||
      pCatLower.includes('lumière') ||
      pCatLower.includes('studio') ||
      pCatLower.includes('portable') ||
      pCatLower.includes('éclairage') ||
      pCatLower.includes('eclairage')
    );
  }

  if (
    catLower.includes('stabilisateur') ||
    catLower.includes('trépied') ||
    catLower.includes('trepied')
  ) {
    return (
      pCatLower.includes('stabilisateur') ||
      pCatLower.includes('trépied') ||
      pCatLower.includes('trepied') ||
      pCatLower.includes('gimbal') ||
      pNameLower.includes('ronin') ||
      pNameLower.includes('rs3') ||
      pNameLower.includes('rs4') ||
      pNameLower.includes('tripod') ||
      pNameLower.includes('monopod')
    );
  }

  if (catLower.includes('audio') || catLower.includes('micro')) {
    return (
      attr.product_type === 'audio' ||
      pCatLower.includes('microphone') ||
      pCatLower.includes('casque') ||
      pCatLower.includes('intercom') ||
      pCatLower.includes('audio') ||
      pNameLower.includes('micro') ||
      pNameLower.includes('lark') ||
      pNameLower.includes('wireless go')
    );
  }

  if (catLower.includes('filtr')) {
    return (
      attr.product_type === 'filter' ||
      pCatLower.includes('filtr') ||
      pNameLower.includes('filter') ||
      pNameLower.includes('filtre') ||
      pNameLower.includes('cpl') ||
      pNameLower.includes('vnd')
    );
  }

  if (
    catLower.includes('sac') ||
    catLower.includes('accessoire') ||
    catLower.includes('accessories') ||
    catLower.includes('cage') ||
    catLower.includes('rigging')
  ) {
    return (
      pCatLower.includes('sac') ||
      pCatLower.includes('valise') ||
      pCatLower.includes('cage') ||
      pCatLower.includes('accessoire') ||
      pCatLower.includes('accessor') ||
      pCatLower.includes('carte') ||
      pCatLower.includes('batterie') ||
      pCatLower.includes('adaptateur') ||
      pCatLower.includes('bague') ||
      attr.product_type === 'accessory' ||
      attr.product_type === 'adapter'
    );
  }

  return false;
}

/**
 * Smart filter transition sanitizer.
 * Prevents dead-end filter states (e.g. keeping 'lensType=manual' when switching to 'Éclairage',
 * or keeping 'filterDiameter=77mm' when switching to 'Appareils Photo').
 */
export function smartFilterUpdate(
  current: FilterState,
  updates: Partial<FilterState>
): FilterState {
  const next: FilterState = { ...current, ...updates };

  // 1. If category changed:
  if (updates.category !== undefined && updates.category !== current.category) {
    const isLenses = updates.category.toLowerCase().includes('objectif') || updates.category.toLowerCase().includes('lens');
    const isFilters = updates.category.toLowerCase().includes('filtr');
    const isCameras = updates.category.toLowerCase().includes('appareil') || updates.category.toLowerCase().includes('caméra');

    // If switching away from lenses and not 'all', reset lensType
    if (!isLenses && updates.category !== 'all') {
      next.lensType = 'all';
    }

    // If switching away from filters, clear filterDiameter
    if (!isFilters) {
      next.filterDiameter = undefined;
    }

    // If switching away from cameras and lenses and not 'all', reset mount
    if (!isCameras && !isLenses && updates.category !== 'all') {
      next.mount = 'all';
    }
  }

  // 2. If lensType changed:
  if (updates.lensType && updates.lensType !== 'all') {
    const isLenses = next.category.toLowerCase().includes('objectif') || next.category.toLowerCase().includes('lens');
    if (!isLenses && next.category !== 'all') {
      next.category = 'Objectifs';
    }
    next.filterDiameter = undefined;
  }

  // 3. If filterDiameter changed:
  if (updates.filterDiameter) {
    const isFilters = next.category.toLowerCase().includes('filtr');
    if (!isFilters && next.category !== 'all') {
      next.category = 'Filtres';
    }
  }

  return next;
}

