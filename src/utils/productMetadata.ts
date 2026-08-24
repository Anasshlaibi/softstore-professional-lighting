import { Product } from '../../App';

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

  // 1. BRAND DETECTION (DB column > text analysis)
  let brand = (p as any).brand || '';
  if (!brand) {
    if (fullText.includes('7artisans') || fullText.includes('sevenartisans')) brand = '7Artisans';
    else if (fullText.includes('k&f') || fullText.includes('kentfaith') || fullText.includes('concept')) brand = 'K&F Concept';
    else if (fullText.includes('godox')) brand = 'Godox';
    else if (fullText.includes('sony')) brand = 'Sony';
    else if (fullText.includes('canon')) brand = 'Canon';
    else if (fullText.includes('nikon')) brand = 'Nikon';
    else if (fullText.includes('fuji') || fullText.includes('fujifilm')) brand = 'Fujifilm';
    else if (fullText.includes('panasonic') || fullText.includes('lumix')) brand = 'Panasonic';
    else if (fullText.includes('rode') || fullText.includes('røde')) brand = 'Røde';
    else if (fullText.includes('sandisk')) brand = 'SanDisk';
    else if (fullText.includes('insta360')) brand = 'Insta360';
    else if (fullText.includes('yongnuo')) brand = 'Yongnuo';
    else if (fullText.includes('dji')) brand = 'DJI';
    else brand = '7Artisans'; // Default primary brand
  }

  // 2. PRODUCT TYPE DETECTION (Strict separation of lenses vs non-lenses)
  let product_type: ProductAttributes['product_type'] = (p as any).product_type;
  if (!product_type) {
    // Explicit non-lens indicators
    if (nameLower.includes('adapter') || nameLower.includes('adaptateur') || nameLower.includes('bague d\'adaptation')) {
      product_type = 'adapter';
    } else if (nameLower.includes('filter') || nameLower.includes('filtre') || nameLower.includes('vnd') || nameLower.includes('black mist') || nameLower.includes('uv filter') || nameLower.includes('cpl')) {
      product_type = 'filter';
    } else if (cat.includes('studio') || cat.includes('éclairage') || cat.includes('eclairage') || cat.includes('portable') || nameLower.includes('light') || nameLower.includes('spotlight') || nameLower.includes('led') || nameLower.includes('bkl') || nameLower.includes('softbox')) {
      product_type = 'light';
    } else if (cat.includes('audio') || nameLower.includes('micro') || nameLower.includes('wireless go') || nameLower.includes('mic')) {
      product_type = 'audio';
    } else if (cat.includes('caméra') || cat.includes('camera') || cat.includes('boîtier') || nameLower.includes('boitier nu') || nameLower.includes('body only')) {
      product_type = 'camera';
    } else if (cat.includes('accessories') || cat.includes('accessoire') || nameLower.includes('tripod') || nameLower.includes('trépied') || nameLower.includes('battery') || nameLower.includes('batterie') || nameLower.includes('card') || nameLower.includes('carte')) {
      product_type = 'accessory';
    } else if (cat.includes('lenses') || cat.includes('objectif') || /\b\d+(\.\d+)?\s*mm\b/i.test(name) || nameLower.includes('fisheye')) {
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
    if ((p as any).lens_type) {
      lens_type = (p as any).lens_type;
      focus_type = lens_type === 'autofocus' ? 'autofocus' : 'manual';
    } else {
      // Robust Cinema detection:
      // T-stop regex pattern: e.g. T2.0, T1.5, T2.1, T/2.0, T2
      const tStopMatch = name.match(/\b[tT]\s*\/?\s*(\d+(\.\d+)?)\b/);
      const hasCineKeyword = /\b(cine|ciné|cinema|cinéma|anamorphic|vision series|spectrum series|firefly)\b/i.test(fullText);

      if (tStopMatch || hasCineKeyword) {
        lens_type = 'cinema';
        focus_type = 'manual'; // Most cine lenses in this tier are manual geared focus
        if (tStopMatch) t_stop = `T${tStopMatch[1]}`;
      } else {
        // Robust Autofocus detection
        const hasAFKeyword = /\baf\b/i.test(name) ||
                             /\baf\d+/i.test(name) ||
                             /autofocus/i.test(fullText) ||
                             /auto-focus/i.test(fullText) ||
                             fullText.includes('mise au point automatique');

        if (hasAFKeyword) {
          lens_type = 'autofocus';
          focus_type = 'autofocus';
        } else {
          // Standard manual photography prime/zoom
          lens_type = 'manual';
          focus_type = 'manual';
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
  let filter_diameter: number | undefined = (p as any).filter_diameter;
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
  let mount = (p as any).mount || '';
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
  let condition: ProductAttributes['condition'] = (p as any).product_group || (p as any).condition;
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
