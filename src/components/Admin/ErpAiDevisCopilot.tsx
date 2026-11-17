import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../../App';
import { ErpLineItem, ErpDocumentType } from '../../utils/devisInvoiceGenerator';

interface SupplierExtraItem {
  name: string;
  keywords: string[];
  priceHt: number;
  brand?: string;
  source?: string;
}

interface ChatAttachment {
  name: string;
  type: 'image' | 'excel' | 'document';
  mimeType: string;
  dataUrl?: string;
  extractedText?: string;
  extractedItems?: SupplierExtraItem[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  attachments?: ChatAttachment[];
  proposedItems?: ErpLineItem[];
  proposedClient?: string;
  proposedReference?: string;
  timestamp: string;
}

export interface AiDevisRules {
  tierPreference: 'competitive' | 'flagship';
  designationStyle: 'pro_model' | 'client_exact';
  marginMarkupPct: number;
  customInstructions: string;
}

interface ErpAiDevisCopilotProps {
  products: Product[];
  currentItems: ErpLineItem[];
  clientName: string;
  onApplyDevisUpdate: (update: {
    items?: ErpLineItem[];
    clientName?: string;
    clientCompany?: string;
    clientIce?: string;
    referenceText?: string;
    docType?: ErpDocumentType;
  }) => void;
  onGeneratePdfNow: () => void;
}

const GEMINI_KEY_STORAGE = 'verdanove_gemini_api_key_v1';
const EXTRA_CATALOG_STORAGE = 'verdanove_uploaded_supplier_items_v1';
const AI_RULES_STORAGE = 'verdanove_ai_devis_rules_v1';

const DEFAULT_AI_RULES: AiDevisRules = {
  tierPreference: 'competitive',
  designationStyle: 'pro_model',
  marginMarkupPct: 0,
  customInstructions:
    "Toujours supprimer 'ou équivalent', choisir un modèle précis professionnel, ignorer les titres de tableaux (N°, Désignation, Qté) et formater des désignations propres dignes d'un appel d'offres / marché public au Maroc.",
};

/**
 * Comprehensive Moroccan B2B / INDH / Studio Reference Catalog
 * Covers cameras, lenses, drones, gimbals, lighting kits, audio, storage, batteries, bags & software
 */
const MOROCCAN_MARKET_REFERENCE_ITEMS: SupplierExtraItem[] = [
  // Cameras
  {
    name: 'Caméra Hybride Professionnelle Canon EOS R6 Mark II (Boîtier Plein Format)',
    keywords: ['eos r6 mark ii', 'r6 mark ii', 'r6 mkii', 'r6 ii'],
    priceHt: 22190,
    brand: 'Canon',
  },
  {
    name: 'Caméra Hybride Professionnelle Canon EOS R5 Mark II (Boîtier Plein Format 8K)',
    keywords: ['eos r5 mark ii', 'r5 mark ii', 'r5 mkii', 'r5 ii'],
    priceHt: 46890,
    brand: 'Canon',
  },
  {
    name: 'Caméra Hybride Professionnelle Canon EOS R6 Mark III (Boîtier Plein Format)',
    keywords: ['eos r6 mark iii', 'r6 mark iii', 'r6 iii'],
    priceHt: 34990,
    brand: 'Canon',
  },
  {
    name: 'Caméra Sony FX30 (Boîtier Nu Cinema Line 4K)',
    keywords: ['sony fx30', 'fx30', 'cinema line fx30'],
    priceHt: 20499,
    brand: 'Sony',
  },
  {
    name: 'Caméra Sony FX3 (Boîtier Plein Format Cinema Line 4K)',
    keywords: ['sony fx3', 'cinema line fx3'],
    priceHt: 43290,
    brand: 'Sony',
  },
  {
    name: 'Caméra Vidéo Stabilisée DJI Osmo Pocket 3 Creator Combo',
    keywords: ['osmo pocket 3', 'pocket 3 creator combo', 'camera video stabilisee'],
    priceHt: 6690,
    brand: 'DJI',
  },
  // Lenses
  {
    name: 'Objectif Professionnel Canon RF 24-105mm f/4 L IS USM',
    keywords: ['rf 24-105', '24-105 mm f/4', '24-105mm f/4'],
    priceHt: 13900,
    brand: 'Canon',
  },
  {
    name: 'Objectif Professionnel Canon RF 24-70mm f/2.8 L IS USM',
    keywords: ['rf 24-70', '24-70mm f/2.8'],
    priceHt: 24900,
    brand: 'Canon',
  },
  {
    name: 'Optique Sigma 18-50mm f/2.8 DC DN Contemporary',
    keywords: ['sigma 18-50', '18-50mm f/2.8'],
    priceHt: 7000,
    brand: 'Sigma',
  },
  {
    name: '7Artisans AF 35mm f/1.8 Sony E + AF 40mm f/2.5',
    keywords: ['7artisans af 35mm', 'af 40mm f2.5'],
    priceHt: 6000,
    brand: '7Artisans',
  },
  // Drones
  {
    name: 'Drone Professionnel DJI Mini 4 Pro Fly More Combo (RC 2)',
    keywords: ['dji mini 4 pro', 'mini 4 pro', 'fly more combo', 'drone leger professionnel'],
    priceHt: 11900,
    brand: 'DJI',
  },
  {
    name: 'Drone Professionnel DJI Air 3 Fly More Combo (RC 2)',
    keywords: ['dji air 3', 'air 3 fly more'],
    priceHt: 15900,
    brand: 'DJI',
  },
  {
    name: 'Drone Professionnel DJI Mavic 3 Pro Fly More Combo',
    keywords: ['mavic 3 pro', 'dji mavic 3'],
    priceHt: 28900,
    brand: 'DJI',
  },
  // Lighting
  {
    name: 'Kit Éclairage LED Professionnel Godox SL100Bi Bi-Color avec Softbox et Pied Studio',
    keywords: ['godox sl100bi', 'sl100bi', 'sl100', 'eclairage led professionnel'],
    priceHt: 2950,
    brand: 'Godox',
  },
  {
    name: 'Projecteur LED Studio ZSYB Y300S (300W Bi-Color Bowens)',
    keywords: ['zsyb y300s', 'y300s', 'projecteur 300w'],
    priceHt: 4000,
    brand: 'ZSYB',
  },
  {
    name: 'Softbox Parabolique 90cm Bowens avec Grille Nid d\'Abeille',
    keywords: ['softbox parabolique 90cm', 'softbox 90cm'],
    priceHt: 1500,
    brand: 'Godox',
  },
  {
    name: 'Kit C-Stand Inox Professionnel avec Bras Magique',
    keywords: ['c-stand', 'c stand inox'],
    priceHt: 1600,
    brand: 'ProStudio',
  },
  {
    name: 'Pack 2x Mini Panneaux LED RGB de Contour / Décor',
    keywords: ['mini led rgb', 'led rgb de contour'],
    priceHt: 1200,
    brand: 'Godox/Ulanzi',
  },
  // Audio
  {
    name: 'Système Microphone Sans Fil DJI Mic 2 (2 Émetteurs + 1 Récepteur + Boîtier de Charge)',
    keywords: ['dji mic 2', 'mic 2 double emetteur', 'microphones sans fil'],
    priceHt: 2999,
    brand: 'DJI',
  },
  {
    name: 'Casque Studio Professionnel Audio-Technica ATH-M50x',
    keywords: ['ath-m50x', 'audio-technica', 'casque studio'],
    priceHt: 1700,
    brand: 'Audio-Technica',
  },
  // Tripods & Gimbals
  {
    name: 'Trépied Vidéo Professionnel avec Tête Fluide (SmallRig AD-01 Heavy-Duty)',
    keywords: ['trepied video professionnel', 'tete fluide professionnelle', 'smallrig ad-01'],
    priceHt: 2500,
    brand: 'SmallRig',
  },
  {
    name: 'Stabilisateur Motorisé 3 Axes DJI RS 4',
    keywords: ['dji rs 4', 'rs 4', 'stabilisateur motorise'],
    priceHt: 5760,
    brand: 'DJI',
  },
  {
    name: 'Cage Complète avec Poignée Supérieure NATO pour Caméra',
    keywords: ['cage complete', 'poignee superieure nato'],
    priceHt: 1400,
    brand: 'SmallRig',
  },
  // Batteries & Power
  {
    name: 'Batterie Rechargeable Canon LP-E6NH Haute Capacité',
    keywords: ['lp-e6nh', 'batteries canon lp-e6nh', 'batteries supplementaires'],
    priceHt: 850,
    brand: 'Canon',
  },
  {
    name: 'Chargeur Double de Batteries Compatible Canon LP-E6NH (LCD USB-C)',
    keywords: ['chargeur double compatible canon', 'chargeur de batteries'],
    priceHt: 550,
    brand: 'Canon/Nitecore',
  },
  {
    name: 'Pack 2x Batteries NP-FZ100 Supplémentaires + Chargeur Double',
    keywords: ['np-fz100', 'batteries np-fz100'],
    priceHt: 1500,
    brand: 'Sony',
  },
  {
    name: 'Powerbank Haute Puissance Anker 24 000 mAh (65W / 140W PD)',
    keywords: ['powerbank', 'anker 24,000', 'anker 24000'],
    priceHt: 1200,
    brand: 'Anker',
  },
  // Memory & Storage
  {
    name: 'Carte Mémoire Professionnelle SDXC 256 Go UHS-II V60',
    keywords: ['sdxc 256 go', '256 go uhs-ii', 'cartes memoire sdxc 256'],
    priceHt: 1250,
    brand: 'Lexar/SanDisk',
  },
  {
    name: 'Pack 2x Cartes Mémoire SDXC V60 128 Go (Lexar 1800x)',
    keywords: ['sdxc v60 128 go', 'lexar 1800x'],
    priceHt: 1300,
    brand: 'Lexar',
  },
  {
    name: 'Disque Dur Externe SSD Portable 2 To (SanDisk Extreme Pro / Samsung T7)',
    keywords: ['ssd portable 2 to', 'ssd portable 2to', 'stockage externe ssd'],
    priceHt: 2200,
    brand: 'SanDisk/Samsung',
  },
  // Bags & Filters
  {
    name: 'Sac Professionnel Compartimenté pour Matériel Audiovisuel (Vanguard VEO SELECT)',
    keywords: ['sacoche de transport', 'sac professionnel pour materiel audiovisuel', 'sac a dos compartimente'],
    priceHt: 1200,
    brand: 'Vanguard',
  },
  {
    name: 'Filtre K&F Concept ND Variable 82mm (Nano-X Pro)',
    keywords: ['nd variable 82mm', 'nano-x pro'],
    priceHt: 1500,
    brand: 'K&F Concept',
  },
  {
    name: 'Kit 18 pcs Bagues Step-Up / Step-Down K&F Concept (37–82mm)',
    keywords: ['step-up', 'step-down', 'kit 18 pcs bagues'],
    priceHt: 350,
    brand: 'K&F Concept',
  },
  // Software
  {
    name: 'Logiciel de Montage & Étalonnage DaVinci Resolve Studio (Licence Officielle)',
    keywords: ['davinci resolve studio', 'logiciel de montage', 'resolve studio'],
    priceHt: 3600,
    brand: 'Blackmagic Design',
  },
];

function cleanOcrTypos(str: string): string {
  return str
    .replace(/\[Os\s+R6\s+Mark\s+I[l1i]/gi, 'Canon EOS R6 Mark II')
    .replace(/\(OS\s+R6\s+Mark\s+I[l1i]/gi, 'Canon EOS R6 Mark II')
    .replace(/FOS\s+RS\s+Mark\s+I[l1i]/gi, 'Canon EOS R5 Mark II')
    .replace(/EOS\s+R[S5]\s+Mark\s+I[l1i]/gi, 'Canon EOS R5 Mark II')
    .replace(/EOS\s+R6\s+Mark\s+I[l1i]/gi, 'Canon EOS R6 Mark II')
    .replace(/piein\s+formai/gi, 'plein format')
    .replace(/professionneiie|professionnei/gi, 'professionnel')
    .replace(/RF\s*24-105\s*mm\s*f\/4\s*L\s*I?S\s*USM/gi, 'Canon RF 24-105mm f/4 L IS USM')
    .replace(/\[?os\s+Mini\s+4\s+Pro/gi, 'DJI Mini 4 Pro')
    .replace(/D[ji1l]{2}\s+Mini\s+4\s+Pro/gi, 'DJI Mini 4 Pro')
    .replace(/Fiy\s+More/gi, 'Fly More')
    .replace(/équivaient/gi, 'équivalent')
    .replace(/\[?os\s+Osmo\s+Pocket\s+3/gi, 'DJI Osmo Pocket 3')
    .replace(/DJ[1Il]\s+Osmo\s+Pocket\s+3/gi, 'DJI Osmo Pocket 3')
    .replace(/Jodox/gi, 'Godox')
    .replace(/softhox/gi, 'softbox')
    .replace(/jou\s+Mic\s+2/gi, 'DJI Mic 2')
    .replace(/\[?Du\s+RS\s*4/gi, 'DJI RS 4')
    .replace(/DJIRS\s*4/gi, 'DJI RS 4')
    .replace(/5DXC/gi, 'SDXC')
    .replace(/5SD|ssD/g, 'SSD')
    .replace(/2To\b/gi, '2 To')
    .replace(/Davinci/gi, 'DaVinci');
}

function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9./-]+/g, ' ')
    .trim();
}

export const ErpAiDevisCopilot: React.FC<ErpAiDevisCopilotProps> = ({
  products,
  currentItems,
  clientName,
  onApplyDevisUpdate,
  onGeneratePdfNow,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(GEMINI_KEY_STORAGE) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    } catch {
      return '';
    }
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const [rules, setRules] = useState<AiDevisRules>(() => {
    try {
      const raw = localStorage.getItem(AI_RULES_STORAGE);
      return raw ? { ...DEFAULT_AI_RULES, ...JSON.parse(raw) } : DEFAULT_AI_RULES;
    } catch {
      return DEFAULT_AI_RULES;
    }
  });

  const saveRules = (updated: AiDevisRules) => {
    setRules(updated);
    try {
      localStorage.setItem(AI_RULES_STORAGE, JSON.stringify(updated));
    } catch {}
  };

  const [extraCatalog, setExtraCatalog] = useState<SupplierExtraItem[]>(() => {
    try {
      const saved = localStorage.getItem(EXTRA_CATALOG_STORAGE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Bonjour ! Je suis votre **Assistant IA Devis VERDANOVE**.\n\n' +
        '• **Importez ou collez (`Ctrl+V`) une capture d\'écran de tableau client** (ex: Cahier des charges, liste d\'équipements demandés) : j\'extrais automatiquement les 14+ lignes, j\'ignore les en-têtes (`N° | Désignation | Qté`), je choisis le modèle exact selon vos **⚙️ Règles IA** et je remplis le Devis VERDANOVE.\n' +
        '• **Importez vos fichiers Excel (`.xlsx`, `.csv`)** pour enrichir la mémoire de prix.',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const saveApiKey = (val: string) => {
    const cleaned = val.trim();
    setApiKey(cleaned);
    try {
      localStorage.setItem(GEMINI_KEY_STORAGE, cleaned);
    } catch {}
    setShowKeyModal(false);
  };

  // Parse Excel / CSV file in browser
  const parseExcelOrCsvFile = async (file: File): Promise<ChatAttachment> => {
    const buffer = await file.arrayBuffer();
    const xlsxMod = await import('xlsx');
    const xlsx = xlsxMod.default || xlsxMod;
    const wb = xlsx.read(buffer, { type: 'array' });
    const extractedItems: SupplierExtraItem[] = [];
    const textLines: string[] = [];

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      for (const row of rows) {
        if (!Array.isArray(row) || row.length === 0) continue;
        const cells = row.map((c) => String(c ?? '').trim()).filter(Boolean);
        if (cells.length === 0) continue;
        textLines.push(cells.join(' | '));

        const textCells = cells.filter((c) => isNaN(Number(c.replace(/\s/g, ''))) && c.length > 3);
        const numCells = row
          .map((c) => (typeof c === 'number' ? c : parseFloat(String(c).replace(/[^\d.,]/g, '').replace(',', '.'))))
          .filter((n) => !isNaN(n) && n > 20 && n < 500000);

        if (textCells.length > 0 && numCells.length > 0) {
          const nameCandidate = textCells.reduce((a, b) => (b.length > a.length ? b : a), textCells[0]);
          if (!/designation|libelle|categorie|marque|total|prix|spécification/i.test(nameCandidate)) {
            const priceCandidate = Math.round(Math.max(...numCells));
            extractedItems.push({
              name: nameCandidate,
              keywords: normalizeSearch(nameCandidate).split(' ').filter((w) => w.length > 2),
              priceHt: priceCandidate,
              source: file.name,
            });
          }
        }
      }
    }

    if (extractedItems.length > 0) {
      setExtraCatalog((prev) => {
        const map = new Map<string, SupplierExtraItem>();
        [...prev, ...extractedItems].forEach((item) => map.set(item.name.toLowerCase(), item));
        const merged = Array.from(map.values()).slice(0, 1000);
        try {
          localStorage.setItem(EXTRA_CATALOG_STORAGE, JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }

    return {
      name: file.name,
      type: 'excel',
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extractedText: textLines.slice(0, 250).join('\n'),
      extractedItems,
    };
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const added: ChatAttachment[] = [];

    for (const file of arr) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (file.type.startsWith('image/')) {
        const dataUrl = await readFileAsDataUrl(file);
        added.push({
          name: file.name,
          type: 'image',
          mimeType: file.type,
          dataUrl,
        });
      } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const parsed = await parseExcelOrCsvFile(file);
        added.push(parsed);
      } else if (file.type === 'application/pdf' || ext === 'pdf') {
        const dataUrl = await readFileAsDataUrl(file);
        added.push({
          name: file.name,
          type: 'document',
          mimeType: 'application/pdf',
          dataUrl,
        });
      } else {
        const text = await file.text().catch(() => '');
        added.push({
          name: file.name,
          type: 'document',
          mimeType: file.type || 'text/plain',
          extractedText: text.slice(0, 15000),
        });
      }
    }

    setPendingAttachments((prev) => [...prev, ...added]);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      await handleFilesSelected(e.clipboardData.files);
    }
  };

  /**
   * Preprocesses table screenshots on <canvas> (upscales 2.5x and erases continuous horizontal
   * and vertical table grid borders so Tesseract reads every single row inside bordered tables!)
   */
  const preprocessTableImageForOcr = async (dataUrl: string): Promise<string> => {
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load error'));
    });

    const scale = 2.5;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    // 1. Erase continuous horizontal border segments (> 25% of image width)
    for (let y = 0; y < h; y++) {
      let run = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (d[idx] < 190 && d[idx + 1] < 190 && d[idx + 2] < 190) {
          run++;
        } else {
          if (run > w * 0.25) {
            for (let k = x - run; k < x; k++) {
              const i2 = (y * w + k) * 4;
              d[i2] = 255;
              d[i2 + 1] = 255;
              d[i2 + 2] = 255;
            }
          }
          run = 0;
        }
      }
      if (run > w * 0.25) {
        for (let k = w - run; k < w; k++) {
          const i2 = (y * w + k) * 4;
          d[i2] = 255;
          d[i2 + 1] = 255;
          d[i2 + 2] = 255;
        }
      }
    }

    // 2. Erase continuous vertical border segments (> 20% of image height)
    for (let x = 0; x < w; x++) {
      let run = 0;
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        if (d[idx] < 190 && d[idx + 1] < 190 && d[idx + 2] < 190) {
          run++;
        } else {
          if (run > h * 0.2) {
            for (let k = y - run; k < y; k++) {
              const i2 = (k * w + x) * 4;
              d[i2] = 255;
              d[i2 + 1] = 255;
              d[i2 + 2] = 255;
            }
          }
          run = 0;
        }
      }
      if (run > h * 0.2) {
        for (let k = h - run; k < h; k++) {
          const i2 = (k * w + x) * 4;
          d[i2] = 255;
          d[i2 + 1] = 255;
          d[i2 + 2] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const runBrowserOcrOnImage = async (dataUrl: string): Promise<string> => {
    setStatusMessage('🔍 Suppression des bordures de tableau & lecture OCR haute précision...');
    const cleanedDataUrl = await preprocessTableImageForOcr(dataUrl);

    const win = window as any;
    if (!win.Tesseract) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load OCR engine'));
        document.head.appendChild(s);
      });
    }

    const worker = await win.Tesseract.createWorker('fra');
    await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const ret = await worker.recognize(cleanedDataUrl);
    await worker.terminate();
    return ret?.data?.text || '';
  };

  /**
   * Rule-Based Devis Builder (applies strict B2B tender rules on OCR / text / Excel input)
   */
  const buildDevisWithStrictRules = (rawInput: string) => {
    const cleanedInput = cleanOcrTypos(rawInput);
    const markupMultiplier = 1 + (rules.marginMarkupPct || 0) / 100;

    // 1. Check if user is asking for a quick percentage change on current items
    const pctInc = cleanedInput.match(/(?:augmente|ajoute|plus|\+)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    const pctDec = cleanedInput.match(/(?:baisse|reduis|réduis|remise|moins|-)\s*(\d+(?:[.,]\d+)?)\s*%/i);

    if (pctInc && cleanedInput.split('\n').length <= 2 && currentItems.length > 0) {
      const pct = parseFloat(pctInc[1].replace(',', '.'));
      return {
        items: currentItems.map((it) => ({
          ...it,
          unitPriceTtc: Math.round(it.unitPriceTtc * (1 + pct / 100)),
        })),
        explanation: `J'ai augmenté tous les prix unitaires du devis de **+${pct}%**.`,
      };
    }
    if (pctDec && cleanedInput.split('\n').length <= 2 && currentItems.length > 0) {
      const pct = parseFloat(pctDec[1].replace(',', '.'));
      return {
        items: currentItems.map((it) => ({
          ...it,
          unitPriceTtc: Math.round(it.unitPriceTtc * (1 - pct / 100)),
        })),
        explanation: `J'ai réduit tous les prix unitaires du devis de **-${pct}%**.`,
      };
    }

    // Build combined reference database
    const catalogCandidates: SupplierExtraItem[] = [
      ...MOROCCAN_MARKET_REFERENCE_ITEMS,
      ...extraCatalog,
      ...products
        .filter((p) => p.price > 0)
        .map((p) => ({
          name: p.name,
          keywords: normalizeSearch(p.name).split(' ').filter((w) => w.length >= 2),
          priceHt: p.price,
          brand: p.brand,
          source: 'GearShop.ma',
        })),
    ];

    const rawLines = cleanedInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 4);

    const matchedItems: ErpLineItem[] = [];

    for (const rawLine of rawLines) {
      const normLine = normalizeSearch(rawLine);

      // RULE A: Strictly ignore section titles and table headers
      if (
        /liste des equipements|cahier des charges|tableau recapitulatif/i.test(normLine) ||
        (/designation/.test(normLine) && /(reference|specification|qte|quantite|montant)/.test(normLine)) ||
        /^(devis|numero|date|reference|total hors taxes|validite de l offre|cachet et signature|arrete le present)/i.test(
          normLine
        )
      ) {
        continue;
      }

      // RULE B: Extract trailing quantity at the very end of the row (e.g. "| 1 |", "| 2 |", "| 1 kit |")
      const tailQtyMatch = rawLine.match(/(?:[|\[\]]\s*|\s+)(\d{1,3})\s*(?:kit|pcs|unités|unites)?\s*[|\[\]]*$/i);
      const leadQtyMatch = rawLine.match(/^(\d{1,2})\s*[x×]\s+/i);
      const quantity = tailQtyMatch
        ? parseInt(tailQtyMatch[1], 10)
        : leadQtyMatch
        ? parseInt(leadQtyMatch[1], 10)
        : 1;

      // Extract explicit DH price if written on the line
      const priceMatch = rawLine.match(/(\d[\d\s.,]*)\s*(?:dh|mad|dhs)\b/i);
      const explicitPrice = priceMatch
        ? parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'))
        : null;

      // Strip leading row index ("1 |", "14 [", "ÿ [") and trailing quantity column
      let bodyText = rawLine
        .replace(/^(?:\d{1,2}\s*[x×]\s+|\d{1,2}\s*[|\[\]\\)]\s*|[îÿ&$]\s*[|\[\]\\]?\s*)/i, '')
        .replace(/(?:[|\[\]]\s*|\s+)(?:\d{1,3}\s*(?:kit|pcs|unités|unites)?|[#àÀLâtQ]+)\s*[|\[\]]*$/i, '')
        .replace(/(\d[\d\s.,]*)\s*(?:dh|mad|dhs)\b/gi, '')
        .replace(/[|\[\]\\]+/g, ' — ')
        .replace(/\s+/g, ' ')
        .replace(/^[\s—-]+|[\s—-]+$/g, '')
        .trim();

      if (bodyText.length < 4) continue;

      // RULE C: Handle "Modèle A ou Modèle B" according to user's Tier Rule (competitive vs flagship)
      let searchTarget = bodyText;
      if (/r6\s*mark\s*ii/i.test(bodyText) && /r5\s*mark\s*ii/i.test(bodyText)) {
        searchTarget =
          rules.tierPreference === 'flagship'
            ? 'Canon EOS R5 Mark II Boîtier Plein Format'
            : 'Canon EOS R6 Mark II Boîtier Plein Format';
      }

      const normTarget = normalizeSearch(searchTarget);

      // Score against reference items
      let bestCand: SupplierExtraItem | null = null;
      let bestScore = 0;

      for (const cand of catalogCandidates) {
        let score = 0;
        const candNorm = normalizeSearch(cand.name);

        // Exact keyword phrase matches
        if (cand.keywords) {
          for (const kw of cand.keywords) {
            const kwNorm = normalizeSearch(kw);
            if (kwNorm.length >= 3 && normTarget.includes(kwNorm)) {
              score += kwNorm.split(' ').length * 5;
            }
          }
        }

        // Token overlap
        const targetTokens = normTarget.split(' ').filter((t) => t.length >= 2);
        for (const tok of targetTokens) {
          if (candNorm.includes(tok)) {
            score += /\d/.test(tok) ? 4 : tok.length >= 4 ? 2 : 1;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestCand = cand;
        }
      }

      if (bestCand && bestScore >= 5) {
        const basePrice = explicitPrice && explicitPrice > 0 ? explicitPrice : bestCand.priceHt;
        const finalPrice = Math.round(basePrice * markupMultiplier);

        const finalDesignation =
          rules.designationStyle === 'client_exact'
            ? bodyText.replace(/\s*ou\s+équivalent/gi, '')
            : bestCand.name;

        matchedItems.push({
          sku: `GS-${matchedItems.length + 1}`,
          name: finalDesignation,
          quantity: Math.max(1, quantity),
          unitPriceTtc: finalPrice,
        });
      } else if (bodyText.length >= 5) {
        const cleanedFallbackName = bodyText
          .replace(/\s*ou\s+équivalent/gi, '')
          .replace(/\s+—\s+/g, ' (') + (bodyText.includes(' — ') ? ')' : '');
        matchedItems.push({
          sku: `GS-${matchedItems.length + 1}`,
          name: cleanedFallbackName.charAt(0).toUpperCase() + cleanedFallbackName.slice(1),
          quantity: Math.max(1, quantity),
          unitPriceTtc: Math.round((explicitPrice || 1500) * markupMultiplier),
        });
      }
    }

    return {
      items: matchedItems,
      explanation:
        matchedItems.length > 0
          ? `J'ai analysé votre document selon vos **Règles IA VERDANOVE** (${
              rules.tierPreference === 'competitive' ? 'Gamme Compétitive' : 'Gamme Pro Haut de Gamme'
            }${rules.marginMarkupPct ? `, Marge ${rules.marginMarkupPct > 0 ? '+' : ''}${rules.marginMarkupPct}%` : ''}) et généré les **${matchedItems.length} lignes professionnelles** ci-dessous :`
          : `Aucune ligne d'équipement détectée. Essayez d'importer une image plus nette ou collez le texte directement.`,
    };
  };

  // Call Gemini 2.5 Flash Multimodal API with explicit user rules
  const callGeminiMultimodal = async (userPrompt: string, attachments: ChatAttachment[]) => {
    const catalogContext = [
      ...MOROCCAN_MARKET_REFERENCE_ITEMS.map((m) => `${m.name} => ${m.priceHt} DH HT`),
      ...extraCatalog.slice(0, 120).map((e) => `${e.name} => ${e.priceHt} DH HT`),
      ...products
        .filter((p) => p.price > 0)
        .map((p) => `${p.name} => ${p.price} DH HT`),
    ].join('\n');

    const systemInstruction = `Tu es l'expert en Devis et Marchés Publics / B2B de VERDANOVE SARL (Casablanca, Maroc).
Analyse l'image, le tableau ou la demande ci-jointe et génère toutes les lignes du DEVIS en Dirhams Marocains (DH HT).

RÈGLES OBLIGATOIRES À RESPECTER STRICTEMENT :
1. IGNORE TOUJOURS les titres de section (ex: "1. Liste des équipements demandés") et les lignes d'en-tête de tableau ("N° | Désignation | Référence / Spécification souhaitée | Qté").
2. Ne confonds JAMAIS la colonne "N°" (1, 2, 3... 14) avec la quantité "Qté" (qui se trouve dans la dernière colonne à droite).
3. Quand une ligne propose un choix ("EOS R6 Mark II ou EOS R5 Mark II") : ${
      rules.tierPreference === 'flagship'
        ? 'Choisis le modèle Haut de Gamme (ex: Canon EOS R5 Mark II).'
        : 'Choisis le modèle Compétitif (ex: Canon EOS R6 Mark II).'
    }
4. Supprime toujours la mention "ou équivalent" et indique un modèle précis professionnel (ex: "Drone Professionnel DJI Mini 4 Pro Fly More Combo (RC 2)", "Stabilisateur Motorisé 3 Axes DJI RS 4", "Trépied Vidéo Professionnel avec Tête Fluide SmallRig AD-01").
5. Règle de marge : applique un ajustement de ${rules.marginMarkupPct}% sur les prix unitaires de référence.
6. Instructions supplémentaires de l'administrateur : ${rules.customInstructions}

Réponds UNIQUEMENT en JSON valide :
{
  "reply": "Résumé professionnel du devis préparé",
  "clientName": "",
  "referenceText": "",
  "items": [
    { "name": "Désignation professionnelle complète", "quantity": 1, "unitPriceTtc": 22190 }
  ]
}

CATALOGUE & PRIX DE RÉFÉRENCE (MAROC - DH HT) :
${catalogContext}`;

    const parts: any[] = [{ text: systemInstruction }];

    for (const att of attachments) {
      if ((att.type === 'image' || att.mimeType === 'application/pdf') && att.dataUrl) {
        const base64Data = att.dataUrl.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: base64Data,
            },
          });
        }
      } else if (att.extractedText) {
        parts.push({
          text: `Contenu du fichier (${att.name}) :\n${att.extractedText}`,
        });
      }
    }

    parts.push({
      text: userPrompt.trim() || 'Extrais toutes les lignes du tableau joint et prépare le devis professionnel complet.',
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API (${response.status})`);
    }

    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(rawJson);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() && pendingAttachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputPrompt.trim() || `📎 Analyse de : ${pendingAttachments.map((a) => a.name).join(', ')}`,
      attachments: [...pendingAttachments],
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const currentPrompt = inputPrompt;
    const currentAtts = [...pendingAttachments];

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setPendingAttachments([]);
    setIsProcessing(true);
    setStatusMessage('🤖 Application des règles métier & extraction des équipements...');

    try {
      let proposedItems: ErpLineItem[] = [];
      let proposedClient: string | undefined;
      let proposedReference: string | undefined;
      let replyText = '';

      const hasValidGeminiKey = apiKey && apiKey.length > 20 && !apiKey.startsWith('PLACEHOLDER');

      if (hasValidGeminiKey) {
        try {
          const aiResult = await callGeminiMultimodal(currentPrompt, currentAtts);
          proposedItems = Array.isArray(aiResult.items)
            ? aiResult.items.map((it: any, i: number) => ({
                sku: `GS-${i + 1}`,
                name: String(it.name || 'Équipement Audiovisuel'),
                quantity: Math.max(1, Number(it.quantity) || 1),
                unitPriceTtc: Math.max(0, Number(it.unitPriceTtc || it.price || 0)),
              }))
            : [];
          proposedClient = aiResult.clientName || undefined;
          proposedReference = aiResult.referenceText || undefined;
          replyText = aiResult.reply || `J'ai généré un devis avec **${proposedItems.length} article(s)**.`;
        } catch {
          // Fallback to enhanced canvas grid-removal OCR + Strict Rules Engine if API key fails
        }
      }

      if (proposedItems.length === 0) {
        let combinedText = currentPrompt;
        for (const att of currentAtts) {
          if (att.extractedText) {
            combinedText += '\n' + att.extractedText;
          } else if (att.type === 'image' && att.dataUrl) {
            const ocrText = await runBrowserOcrOnImage(att.dataUrl);
            combinedText += '\n' + ocrText;
          }
        }

        const localResult = buildDevisWithStrictRules(combinedText);
        proposedItems = localResult.items;
        replyText = localResult.explanation;
      }

      if (proposedItems.length > 0 || proposedClient) {
        onApplyDevisUpdate({
          ...(proposedItems.length > 0 ? { items: proposedItems } : {}),
          ...(proposedClient ? { clientName: proposedClient } : {}),
          ...(proposedReference ? { referenceText: proposedReference } : {}),
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          proposedItems: proposedItems.length > 0 ? proposedItems : undefined,
          proposedClient,
          proposedReference,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Erreur lors de l'analyse : ${err?.message || 'Veuillez réessayer.'}`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white uppercase tracking-wide">
                Assistant IA Devis VERDANOVE (Lecture Tableaux, Photos & Excel)
              </h4>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                ✓ Anti-Bordures OCR + Règles Appels d'Offres Actives
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Importez la photo/capture d'écran de votre client : l'IA ignore les en-têtes, choisit les modèles exacts et chiffre les 14+ lignes automatiquement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowRulesModal(!showRulesModal)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              showRulesModal
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
          >
            ⚙️ Règles IA du Devis
          </button>
          <button
            type="button"
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition cursor-pointer"
          >
            🔑 Clé IA Gemini Vision
          </button>
        </div>
      </div>

      {/* Configurable AI Rules Panel */}
      {showRulesModal && (
        <div className="bg-zinc-950 border border-red-500/40 p-4 rounded-xl space-y-3 text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">
              ⚙️ Règles Métier & Stratégie de Chiffrage IA (Sauvegardées automatiquement)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                1. Quand le client écrit "Modèle A ou Modèle B" :
              </label>
              <select
                value={rules.tierPreference}
                onChange={(e) =>
                  saveRules({ ...rules, tierPreference: e.target.value as 'competitive' | 'flagship' })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-semibold"
              >
                <option value="competitive">
                  Choisir le modèle Compétitif (ex: Canon EOS R6 Mark II)
                </option>
                <option value="flagship">
                  Choisir le modèle Haut de Gamme (ex: Canon EOS R5 Mark II)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                2. Format des Désignations sur le Devis :
              </label>
              <select
                value={rules.designationStyle}
                onChange={(e) =>
                  saveRules({
                    ...rules,
                    designationStyle: e.target.value as 'pro_model' | 'client_exact',
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-semibold"
              >
                <option value="pro_model">
                  Désignation Pro Complète + Modèle Exact (Recommandé)
                </option>
                <option value="client_exact">
                  Garder le texte exact écrit par le client
                </option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                3. Marge Supplémentaire Automatique (%) :
              </label>
              <select
                value={rules.marginMarkupPct}
                onChange={(e) =>
                  saveRules({ ...rules, marginMarkupPct: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-semibold"
              >
                <option value={-10}>-10% (Remise Marché / Appel d'offres)</option>
                <option value={-5}>-5% (Prix Compétitif)</option>
                <option value={0}>0% (Prix Officiel de Référence)</option>
                <option value={5}>+5% (Marge Sécurisée)</option>
                <option value={10}>+10% (Marge Confort)</option>
                <option value={15}>+15% (Marge Marché Public / INDH)</option>
                <option value={20}>+20% (Marge Haute)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold">
              4. Instructions permanentes pour l'IA :
            </label>
            <textarea
              rows={2}
              value={rules.customInstructions}
              onChange={(e) => saveRules({ ...rules, customInstructions: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            />
          </div>
        </div>
      )}

      {/* Optional Gemini API Key Input Drawer */}
      {showKeyModal && (
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">
              Clé API Google Gemini Vision (Optionnelle — pour manuscrits complexes)
            </span>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 hover:underline font-semibold"
            >
              Obtenir une clé gratuite sur Google AI Studio ↗
            </a>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Collez votre clé AIzaSy..."
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono"
            />
            <button
              type="button"
              onClick={() => saveApiKey(apiKey)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-4 py-3 text-xs space-y-2 ${
                m.role === 'user'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800/90 border border-zinc-700 text-zinc-100'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

              {m.attachments && m.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.attachments.map((att, i) => (
                    <div
                      key={i}
                      className="bg-black/30 border border-white/15 rounded-lg p-2 flex items-center gap-2"
                    >
                      {att.type === 'image' && att.dataUrl ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                      ) : (
                        <span className="text-lg">{att.type === 'excel' ? '📊' : '📄'}</span>
                      )}
                      <div>
                        <div className="font-bold text-[11px] truncate max-w-[180px]">{att.name}</div>
                        {att.extractedItems && att.extractedItems.length > 0 && (
                          <div className="text-[10px] text-emerald-300">
                            ✓ {att.extractedItems.length} produits mémorisés
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {m.proposedItems && m.proposedItems.length > 0 && (
                <div className="bg-zinc-950/90 border border-zinc-700 rounded-xl p-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="font-bold text-emerald-400 text-[11px]">
                      ✓ {m.proposedItems.length} article(s) insérés dans le Devis VERDANOVE
                    </span>
                    <span className="font-mono font-bold text-white text-[11px]">
                      Total HT :{' '}
                      {m.proposedItems
                        .reduce((s, it) => s + it.quantity * it.unitPriceTtc, 0)
                        .toLocaleString('fr-FR')}{' '}
                      DH
                    </span>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                    {m.proposedItems.map((it, idx) => (
                      <div key={idx} className="py-1 flex justify-between gap-3">
                        <span className="text-zinc-200">
                          <strong>{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="font-mono text-emerald-300 font-bold shrink-0">
                          {(it.quantity * it.unitPriceTtc).toLocaleString('fr-FR')} dh
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onGeneratePdfNow}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <span>🖨️</span>
                      <span>Imprimer / Télécharger ce Devis PDF maintenant</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-red-400 font-semibold px-2 py-1">
            <span className="animate-spin">⏳</span>
            <span>{statusMessage || 'Préparation du devis en cours...'}</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Pending Attachments Bar */}
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl">
          {pendingAttachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg text-xs text-white"
            >
              {att.type === 'image' && att.dataUrl ? (
                <img src={att.dataUrl} alt={att.name} className="w-8 h-8 object-cover rounded" />
              ) : (
                <span>{att.type === 'excel' ? '📊' : '📄'}</span>
              )}
              <span className="truncate max-w-[160px] font-medium">{att.name}</span>
              <button
                type="button"
                onClick={() =>
                  setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                }
                className="text-zinc-400 hover:text-red-400 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.xlsx,.xls,.csv,.pdf,.txt,.docx"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer transition"
        >
          <span>📎</span>
          <span>Joindre Photo / Excel / PDF</span>
        </button>

        <textarea
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Collez la capture d'écran du tableau client (Ctrl+V) ou cliquez sur Joindre Photo, puis cliquez sur 'Créer le Devis'..."
          className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-700 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none resize-none"
        />

        <button
          type="submit"
          disabled={isProcessing}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 shrink-0 cursor-pointer transition"
        >
          {isProcessing ? 'Analyse...' : '✨ Créer le Devis'}
        </button>
      </form>
    </div>
  );
};
