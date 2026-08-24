import { Product } from '../../App';

/**
 * Shared text normalization utility for SEO, Search, Autocomplete, and Product Matching.
 * Supports Latin (French/English) and Arabic text.
 */
export function normalizeQuery(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (Latin)
    .replace(/[^a-z0-9\s\u0600-\u06FF\u0750-\u077F-]/g, '') // keep alphanumeric, Arabic, spaces, hyphens
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize Arabic text for matching (removes diacritics/tashkeel).
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // Normalize alef variants to plain alef
    .replace(/\u0629/g, '\u0647') // taa marbuta → haa
    .trim();
}

// ============================================================
// MULTILINGUAL BRAND ALIASES (FR / EN / AR)
// ============================================================

const BRAND_SEARCH_ALIASES: Record<string, { fr: string[]; en: string[]; ar: string[] }> = {
  'sony': {
    fr: ['objectif sony', 'camera sony', 'boitier sony', 'sony alpha'],
    en: ['sony lens', 'sony camera', 'sony alpha'],
    ar: ['سوني', 'عدسة سوني', 'كاميرا سوني'],
  },
  'canon': {
    fr: ['objectif canon', 'camera canon', 'boitier canon', 'canon eos'],
    en: ['canon lens', 'canon camera', 'canon eos'],
    ar: ['كانون', 'عدسة كانون', 'كاميرا كانون'],
  },
  'nikon': {
    fr: ['objectif nikon', 'camera nikon', 'boitier nikon'],
    en: ['nikon lens', 'nikon camera', 'nikon z'],
    ar: ['نيكون', 'عدسة نيكون', 'كاميرا نيكون'],
  },
  'fujifilm': {
    fr: ['objectif fuji', 'objectif fujifilm', 'camera fuji'],
    en: ['fuji lens', 'fujifilm lens', 'fuji camera'],
    ar: ['فوجي', 'فوجيفيلم', 'عدسة فوجي'],
  },
  'panasonic': {
    fr: ['objectif lumix', 'objectif panasonic', 'camera lumix'],
    en: ['lumix lens', 'panasonic lens', 'lumix camera'],
    ar: ['لومكس', 'باناسونيك', 'عدسة لومكس'],
  },
  'dji': {
    fr: ['dji maroc', 'osmo pocket', 'drone dji', 'camera dji'],
    en: ['dji camera', 'dji drone', 'osmo pocket', 'dji gimbal'],
    ar: ['دي جي آي', 'كاميرا دي جي آي'],
  },
  '7artisans': {
    fr: ['objectif 7artisans', 'lentille cinema 7artisans', '7artisans maroc'],
    en: ['7artisans lens', '7artisans cinema lens'],
    ar: ['عدسات 7Artisans', 'عدسة 7Artisans'],
  },
  'k&f': {
    fr: ['filtre kf concept', 'filtre nd kf', 'kf concept maroc'],
    en: ['kf concept filter', 'kf nd filter'],
    ar: ['فلتر كي اف'],
  },
  'godox': {
    fr: ['eclairage godox', 'godox maroc', 'flash godox'],
    en: ['godox light', 'godox flash'],
    ar: ['إضاءة جودوكس'],
  },
};

// ============================================================
// CATEGORY SEARCH ALIASES (FR / EN / AR)
// ============================================================

const CATEGORY_SEARCH_ALIASES: Record<string, { fr: string[]; en: string[]; ar: string[] }> = {
  'lenses': {
    fr: ['objectif', 'objectifs', 'lentille', 'optique', 'objectif photo', 'objectif cinema'],
    en: ['lens', 'lenses', 'optic', 'camera lens', 'cinema lens'],
    ar: ['عدسة', 'عدسات', 'عدسة كاميرا'],
  },
  'studio': {
    fr: ['eclairage studio', 'lumiere studio', 'projecteur', 'spot studio'],
    en: ['studio lighting', 'studio light', 'led light', 'cob light'],
    ar: ['إضاءة استوديو', 'إضاءة تصوير'],
  },
  'portable': {
    fr: ['eclairage portable', 'lumiere portable', 'led portable', 'torche video'],
    en: ['portable light', 'portable led', 'video light', 'on-camera light'],
    ar: ['إضاءة محمولة', 'مصباح محمول'],
  },
  'accessories': {
    fr: ['accessoire', 'filtre', 'filtre nd', 'filtre nd variable', 'filtre cpl', 'filtre black mist', 'bague adaptation', 'sac photo'],
    en: ['filter', 'nd filter', 'variable nd filter', 'cpl filter', 'black mist filter', 'adapter ring', 'camera bag', 'accessory'],
    ar: ['فلتر', 'فلتر ND', 'فلتر ND متغير', 'ملحقات', 'حقيبة كاميرا'],
  },
  'camera': {
    fr: ['camera', 'cameras', 'camera maroc', 'achat camera maroc', 'acheter camera maroc', 'prix camera maroc', 'appareil photo', 'camera video', 'camera 4k', 'camera vlogging', 'camera cinema', 'camera dji', 'boitier photo'],
    en: ['camera', 'cameras', 'camera morocco', 'buy camera morocco', 'camera shop morocco', 'video camera', '4k camera', 'vlog camera', 'cinema camera'],
    ar: ['كاميرا', 'كاميرات', 'كاميرا المغرب', 'شراء كاميرا في المغرب', 'كاميرا فيديو', 'كاميرا تصوير', 'ثمن كاميرا المغرب'],
  },
  'occasion': {
    fr: ['occasion', 'materiel occasion', 'camera occasion', 'objectif occasion'],
    en: ['used', 'second hand', 'pre-owned'],
    ar: ['مستعمل', 'معدات مستعملة'],
  },
};

// ============================================================
// GENERAL MOROCCO ALIASES
// ============================================================

const MOROCCO_ALIASES = {
  fr: ['maroc', 'casablanca', 'rabat', 'materiel photo maroc', 'materiel video maroc', 'materiel cinema maroc', 'equipement photo maroc'],
  en: ['morocco', 'casablanca', 'camera gear morocco', 'filmmaking equipment morocco', 'camera morocco'],
  ar: ['المغرب', 'الدار البيضاء', 'معدات تصوير المغرب', 'معدات سينمائية المغرب', 'معدات فيديو المغرب', 'كاميرا في المغرب'],
};

/**
 * Generate clean, non-spammy search aliases for a product.
 * Returns normalized search variants in French, English, and Arabic.
 */
export function generateProductSearchAliases(product: Product): string[] {
  const aliases = new Set<string>();
  const name = product.name || '';
  const normalizedName = normalizeQuery(name);
  
  if (normalizedName) aliases.add(normalizedName);

  // Extract brand if available or inferred
  const brand = (product.brand || (name.match(/7artisans|sony|canon|nikon|dji|godox|k&f|kf concept|fujifilm|fuji|lumix|panasonic|rode/i) || [''])[0]).toLowerCase();
  const mount = (product.mount || '').toLowerCase();

  // Extract numeric model/focal patterns (e.g. 70-200, 24-70, 35, 50, 135, 4)
  const numberMatches = name.match(/\d+(?:-\d+)?/g);
  if (numberMatches) {
    numberMatches.forEach(num => {
      if (brand) {
        aliases.add(`${brand} ${num}`);
        aliases.add(`${num} ${brand}`);
      }
      aliases.add(num);
      if (num.includes('-')) {
        const spaceNum = num.replace('-', ' ');
        if (brand) {
          aliases.add(`${brand} ${spaceNum}`);
          aliases.add(`${spaceNum} ${brand}`);
        }
        aliases.add(spaceNum);
        aliases.add(num.replace('-', ''));
      }
    });
  }

  if (mount && brand) {
    aliases.add(`${brand} ${normalizeQuery(mount)}`);
  }

  // ===== MULTILINGUAL BRAND ALIASES =====
  const brandKey = brand.replace(/\s+/g, '').replace('concept', '');
  const brandAliases = BRAND_SEARCH_ALIASES[brandKey] || BRAND_SEARCH_ALIASES[brand];
  if (brandAliases) {
    [...brandAliases.fr, ...brandAliases.en, ...brandAliases.ar].forEach(a => aliases.add(a));
  }

  // ===== MULTILINGUAL CATEGORY ALIASES =====
  const catKey = (product.category || '').toLowerCase().trim();
  const catAliases = CATEGORY_SEARCH_ALIASES[catKey];
  if (catAliases) {
    [...catAliases.fr, ...catAliases.en, ...catAliases.ar].forEach(a => aliases.add(a));
  }

  // ===== SPECIFIC PRODUCT PATTERNS =====
  if (normalizedName.includes('pocket 4') || normalizedName.includes('osmo pocket 4')) {
    aliases.add('dji osmo pocket 4 pro');
    aliases.add('dji pocket 4');
    aliases.add('osmo pocket 4');
    aliases.add('pocket 4 pro');
    aliases.add('pocket 4');
  }

  if (normalizedName.includes('black mist') || normalizedName.includes('black diffusion')) {
    aliases.add('black mist');
    aliases.add('filtre black mist');
    aliases.add('black mist filter');
  }

  if (normalizedName.includes('vnd') || normalizedName.includes('nd variable') || normalizedName.includes('nd2')) {
    aliases.add('filtre vnd');
    aliases.add('nd variable');
    aliases.add('variable nd filter');
    aliases.add('filtre nd variable');
    aliases.add('فلتر ND متغير');
  }

  if (/t2\.0|t2\.1|t1\.05|cinema|cine/i.test(normalizedName)) {
    aliases.add('objectif cinema');
    aliases.add('lentille cinema');
    aliases.add('cinema lens');
    aliases.add('cine lens');
    aliases.add('عدسة سينمائية');
  }

  // ===== MOUNT-SPECIFIC ALIASES =====
  if (mount.includes('sony') || mount.includes('e mount')) {
    aliases.add('sony e mount');
    aliases.add('monture sony e');
  }
  if (mount.includes('nikon') || mount.includes('z mount')) {
    aliases.add('nikon z mount');
    aliases.add('monture nikon z');
  }
  if (mount.includes('canon') || mount.includes('rf') || mount.includes('eos')) {
    aliases.add('canon rf mount');
    aliases.add('monture canon rf');
  }

  return Array.from(aliases);
}

/**
 * Intelligent product query matcher used by SearchModal and filter logic.
 * Supports French, English, and Arabic queries.
 */
export function matchProductWithQuery(product: Product, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  // Check if query contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(rawQuery);

  const query = hasArabic
    ? normalizeArabic(rawQuery.toLowerCase())
    : normalizeQuery(rawQuery);

  if (!query) return true;

  const terms = query.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  // Build target searchable text
  const searchAliases = product.search_aliases || generateProductSearchAliases(product);
  
  // Include Arabic aliases in the search target
  const fullText = hasArabic
    ? normalizeArabic(searchAliases.join(' ').toLowerCase())
    : normalizeQuery(
        `${product.name} ${product.category} ${product.brand || ''} ${product.mount || ''} ${product.desc || ''} ${searchAliases.join(' ')}`
      );

  // Every token in query must be present in the normalized target text
  return terms.every(term => fullText.includes(term));
}

/**
 * Get general Morocco-related search aliases for the store.
 */
export function getMoroccoSearchAliases(): string[] {
  return [...MOROCCO_ALIASES.fr, ...MOROCCO_ALIASES.en, ...MOROCCO_ALIASES.ar];
}
