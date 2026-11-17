import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../../App';
import { ErpLineItem, ErpDocumentType } from '../../utils/devisInvoiceGenerator';

interface SupplierExtraItem {
  name: string;
  priceHt: number;
  brand?: string;
  source?: string;
}

interface ChatAttachment {
  name: string;
  type: 'image' | 'excel' | 'document';
  mimeType: string;
  dataUrl?: string; // base64 data URL for images/pdfs
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

/**
 * Built-in Moroccan Pro Audiovisual Market Reference Catalog
 * Used when a client requests items not currently in the 299 website products
 * (e.g. Sigma lenses, DJI RS 4, DJI Mic 2, Audio-Technica, Lexar V60, C-Stands, Anker, etc.)
 */
const MOROCCAN_MARKET_REFERENCE_ITEMS: SupplierExtraItem[] = [
  { name: 'Caméra Sony FX30 (Boîtier Nu Cinema Line 4K)', priceHt: 22999, brand: 'Sony' },
  { name: 'Optiques Sigma 18-50mm f/2.8 DC DN Contemporary (Sony E)', priceHt: 7000, brand: 'Sigma' },
  { name: 'Sigma 24-70mm f/2.8 DG DN Art II (Sony E / L-Mount)', priceHt: 14500, brand: 'Sigma' },
  { name: 'Sigma 16mm f/1.4 DC DN Contemporary', priceHt: 4900, brand: 'Sigma' },
  { name: 'Sigma 30mm f/1.4 DC DN Contemporary', priceHt: 4200, brand: 'Sigma' },
  { name: 'Sigma 56mm f/1.4 DC DN Contemporary', priceHt: 5200, brand: 'Sigma' },
  { name: '7Artisans AF 35mm f/1.8 Sony E + AF 40mm f/2.5', priceHt: 6000, brand: '7Artisans' },
  { name: 'Filtre K&F Concept ND Variable 82mm (Nano-X Pro)', priceHt: 1500, brand: 'K&F Concept' },
  { name: 'Kit 18 pcs Bagues Step-Up / Step-Down K&F (37–82mm)', priceHt: 350, brand: 'K&F Concept' },
  { name: 'Powerbank (Anker 24,000mAh 65W/140W)', priceHt: 1200, brand: 'Anker' },
  { name: 'Cage complète avec poignée supérieure NATO pour Sony FX30', priceHt: 1400, brand: 'SmallRig' },
  { name: 'DJI RS 4 (Gimbal 3 axes standard)', priceHt: 5760, brand: 'DJI' },
  { name: 'DJI RS 4 Combo (Stabilisateur 3 axes Pro)', priceHt: 7490, brand: 'DJI' },
  { name: 'DJI RS 4 Pro Combo (Stabilisateur Cinéma)', priceHt: 11500, brand: 'DJI' },
  { name: 'DJI RS 3 Mini (Stabilisateur Hybride)', priceHt: 3690, brand: 'DJI' },
  { name: 'Trépied Vidéo Fluide Heavy-Duty (SmallRig AD-01)', priceHt: 2500, brand: 'SmallRig' },
  { name: 'ZSYB Y300S (Projecteur 300W Bi-Color Bowens)', priceHt: 4000, brand: 'ZSYB' },
  { name: 'Softbox Parabolique 90cm Bowens avec grille', priceHt: 1500, brand: 'Godox' },
  { name: 'Kit C-Stand Inox Professionnel avec Bras Magique', priceHt: 1600, brand: 'ProStudio' },
  { name: '2x Mini LED RGB de contour / décor', priceHt: 1200, brand: 'Ulanzi/Godox' },
  { name: 'DJI Mic 2 (2 TX + 1 RX + Boîtier de charge)', priceHt: 2999, brand: 'DJI' },
  { name: 'Rode Wireless PRO (Système Micro Sans Fil 32-bit Float)', priceHt: 4490, brand: 'Rode' },
  { name: 'Hollyland Lark M2 Combo (Microphone Sans Fil)', priceHt: 1990, brand: 'Hollyland' },
  { name: 'Casque Studio Audio-Technica ATH-M50x', priceHt: 1700, brand: 'Audio-Technica' },
  { name: '2x Cartes SDXC V60 128 Go (Lexar 1800x)', priceHt: 1300, brand: 'Lexar' },
  { name: 'Carte Mémoire SDXC SanDisk Extreme PRO 128 Go V30 200MB/s', priceHt: 450, brand: 'SanDisk' },
  { name: 'Carte Mémoire SDXC Sony Tough / Lexar V90 128 Go', priceHt: 1950, brand: 'Lexar' },
  { name: '2x Batteries NP-FZ100 supplémentaires + chargeur double', priceHt: 1500, brand: 'Sony' },
  { name: '2x Batteries Canon LP-E6NH + Chargeur Double USB-C', priceHt: 1450, brand: 'Canon' },
  { name: 'Sac à dos compartimenté pour matériel cinéma / hybride', priceHt: 1000, brand: 'Vanguard/K&F' },
  { name: 'Moniteur Enregistreur Atomos Ninja V 5" 4K HDMI', priceHt: 6500, brand: 'Atomos' },
  { name: 'Moniteur Terrain Feelworld F6 Plus V2 6" 4K Touch', priceHt: 2200, brand: 'Feelworld' },
  { name: 'Téléprompteur Portable Studio / Tablette & Caméra', priceHt: 1800, brand: 'Desview' },
  { name: 'Fond Vert / Studio Cyclorama Pliable + Support', priceHt: 1400, brand: 'Studio' },
];

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
        'Vous pouvez :\n' +
        '1. **Importer ou coller (`Ctrl+V`) une photo / capture WhatsApp** de la liste demandée par votre client.\n' +
        '2. **Importer un fichier Excel (`.xlsx`, `.csv`) ou Word (`.docx`)** contenant d\'autres produits ou tarifs fournisseurs.\n' +
        '3. **Me demander directement** : *"Fais un devis pour Aya Toraif avec une Sony FX30, un Sigma 18-50mm, un DJI RS 4 et un DJI Mic 2"* ou *"Augmente tous les prix de 10%".*',
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
    } catch {
      // ignore
    }
    setShowKeyModal(false);
  };

  // Parse Excel / CSV file in browser using dynamic import('xlsx')
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

        // Try detecting product name + price in row
        const textCells = cells.filter((c) => isNaN(Number(c.replace(/\s/g, ''))) && c.length > 3);
        const numCells = row
          .map((c) => (typeof c === 'number' ? c : parseFloat(String(c).replace(/[^\d.,]/g, '').replace(',', '.'))))
          .filter((n) => !isNaN(n) && n > 20 && n < 500000);

        if (textCells.length > 0 && numCells.length > 0) {
          // Pick longest text cell as product designation, and highest reasonable price cell
          const nameCandidate = textCells.reduce((a, b) => (b.length > a.length ? b : a), textCells[0]);
          if (!/designation|libelle|categorie|marque|total|prix/i.test(nameCandidate)) {
            const priceCandidate = Math.round(Math.max(...numCells));
            extractedItems.push({
              name: nameCandidate,
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

  // Convert Image or PDF to Base64 Data URL
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

  // Handle Ctrl+V paste of screenshots directly into chat input
  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      await handleFilesSelected(e.clipboardData.files);
    }
  };

  // Fallback Browser OCR using Tesseract.js CDN if user uploads an image without a Gemini API key
  const runBrowserOcrOnImage = async (dataUrl: string): Promise<string> => {
    setStatusMessage('🔍 Lecture optique (OCR) de l\'image en cours...');
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
    const result = await win.Tesseract.recognize(dataUrl, 'fra+eng');
    return result?.data?.text || '';
  };

  // Smart Local Matcher & Devis Builder (works 100% locally or augments AI)
  const buildDevisLocallyFromText = (rawText: string) => {
    const allReferenceItems: SupplierExtraItem[] = [
      ...products
        .filter((p) => p.price > 0)
        .map((p) => ({
          name: p.name,
          priceHt: p.price,
          brand: p.brand,
          source: 'GearShop.ma',
        })),
      ...extraCatalog,
      ...MOROCCAN_MARKET_REFERENCE_ITEMS,
    ];

    // Check if user wants a percentage price adjustment on current items
    const pctIncreaseMatch = rawText.match(/(?:augmente|ajoute|plus|\+)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    const pctDecreaseMatch = rawText.match(/(?:baisse|reduis|réduis|remise|moins|-)\s*(\d+(?:[.,]\d+)?)\s*%/i);

    if (pctIncreaseMatch && rawText.split('\n').length <= 2 && currentItems.length > 0) {
      const pct = parseFloat(pctIncreaseMatch[1].replace(',', '.'));
      const updated = currentItems.map((item) => ({
        ...item,
        unitPriceTtc: Math.round(item.unitPriceTtc * (1 + pct / 100)),
      }));
      return {
        items: updated,
        explanation: `J'ai augmenté les prix unitaires de tous les articles actuels de **+${pct}%**.`,
      };
    }

    if (pctDecreaseMatch && rawText.split('\n').length <= 2 && currentItems.length > 0) {
      const pct = parseFloat(pctDecreaseMatch[1].replace(',', '.'));
      const updated = currentItems.map((item) => ({
        ...item,
        unitPriceTtc: Math.round(item.unitPriceTtc * (1 - pct / 100)),
      }));
      return {
        items: updated,
        explanation: `J'ai réduit les prix unitaires de tous les articles actuels de **-${pct}%**.`,
      };
    }

    // Detect client name if mentioned ("client : X" or "pour client X" or "devis pour X")
    let detectedClient: string | undefined;
    const clientMatch = rawText.match(/(?:client\s*[:=]\s*|devis\s+pour\s+|client\s+)([A-Za-zÀ-ÿ0-9\s.&'-]{2,40})/i);
    if (clientMatch) {
      detectedClient = clientMatch[1].split(/\n|,|\bavec\b/i)[0].trim();
    }

    // Split text into candidate lines
    const rawLines = rawText
      .split(/\r?\n|;/)
      .map((l) => l.replace(/^[•\-*|\s]+|[|\s]+$/g, '').trim())
      .filter((l) => l.length >= 3);

    const matchedItems: ErpLineItem[] = [];

    for (const line of rawLines) {
      // Skip header/footer noise lines
      if (
        /^(devis|numero|numéro|date|reference|référence|designation|désignation|total\s+hors|validité|cachet|arrêté|verdanove|174\s+bd)/i.test(
          line
        )
      ) {
        continue;
      }

      // Extract explicit price if line already has one like "22999dh" or "7000 DH" or "1 500 MAD"
      const priceMatch = line.match(/(\d[\d\s.,]*)\s*(?:dh|mad|dhs)\b/i);
      const explicitPrice = priceMatch
        ? parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'))
        : null;

      // Extract quantity if line starts with "2x " or "| 1 |"
      const qtyPrefixMatch = line.match(/^(\d+)\s*[x×]\s+(.+)/i);
      const qtyColMatch = line.match(/\|\s*(\d+)\s*\|/);
      const quantity = qtyColMatch
        ? parseInt(qtyColMatch[1], 10)
        : qtyPrefixMatch
        ? parseInt(qtyPrefixMatch[1], 10)
        : 1;

      let cleanDesc = line
        .replace(/\|\s*\d+\s*\|.*$/, '')
        .replace(/(\d[\d\s.,]*)\s*(?:dh|mad|dhs)\b/gi, '')
        .replace(/\|/g, ' ')
        .trim();

      if (cleanDesc.length < 3) continue;

      // Fuzzy match against our catalog + extra supplier files + Moroccan reference DB
      const tokens = cleanDesc
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[^a-z0-9.]+/)
        .filter((t) => t.length >= 2);

      let bestMatch: SupplierExtraItem | null = null;
      let bestScore = 0;

      for (const cand of allReferenceItems) {
        const candNorm = cand.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        let score = 0;
        for (const tok of tokens) {
          if (candNorm.includes(tok)) {
            score += tok.length >= 4 || /\d/.test(tok) ? 3 : 1;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cand;
        }
      }

      if (explicitPrice && explicitPrice > 0) {
        matchedItems.push({
          name: cleanDesc,
          quantity: Math.max(1, quantity),
          unitPriceTtc: Math.round(explicitPrice / Math.max(1, quantity)),
        });
      } else if (bestMatch && bestScore >= 4) {
        matchedItems.push({
          name: bestMatch.name,
          quantity: Math.max(1, quantity),
          unitPriceTtc: bestMatch.priceHt,
        });
      } else if (tokens.length >= 2 && rawLines.length > 1) {
        matchedItems.push({
          name: cleanDesc,
          quantity: Math.max(1, quantity),
          unitPriceTtc: bestMatch ? bestMatch.priceHt : 1500,
        });
      }
    }

    return {
      items: matchedItems,
      clientName: detectedClient,
      explanation:
        matchedItems.length > 0
          ? `J'ai analysé votre demande et préparé **${matchedItems.length} article(s)** avec leurs tarifs professionnels au Maroc :`
          : `Je n'ai pas détecté de liste d'articles claire. Vous pouvez coller les lignes d'articles, importer une capture d'écran / Excel, ou configurer une clé API Gemini gratuite (bouton **🔑 Clé IA Gemini**) pour l'analyse visuelle avancée.`,
    };
  };

  // Call Gemini 2.5 Flash Multimodal API (supports Images, PDFs, Excel text, and natural language)
  const callGeminiMultimodal = async (userPrompt: string, attachments: ChatAttachment[]) => {
    // Build compact catalog context for Gemini so it knows GearShop's exact products & prices
    const catalogContext = [
      ...products
        .filter((p) => p.price > 0)
        .map((p) => `${p.name} => ${p.price} DH`),
      ...extraCatalog.slice(0, 150).map((e) => `${e.name} => ${e.priceHt} DH (${e.source || 'Tarif'})`),
      ...MOROCCAN_MARKET_REFERENCE_ITEMS.map((m) => `${m.name} => ${m.priceHt} DH`),
    ].join('\n');

    const systemInstruction = `Tu es l'assistant expert en Devis et Facturation de VERDANOVE SARL / GearShop.ma à Casablanca, Maroc.
Ton rôle est d'analyser la demande de l'utilisateur (texte, photo/capture d'écran de liste client, PDF ou fichier Excel) et de construire un DEVIS professionnel complet en Dirhams Marocains (DH HT).

RÈGLES IMPORTANTES :
1. Pour chaque produit demandé par le client (même sur une photo manuscrite ou une capture WhatsApp), utilise le prix du catalogue VERDANOVE/GearShop ci-dessous s'il existe.
2. Si un produit n'est PAS dans le catalogue (ex: Sigma, Anker, Audio-Technica, Lexar, C-Stand, etc.), ne dis JAMAIS qu'il est introuvable : rédige une désignation professionnelle complète et attribue-lui un prix HT réaliste sur le marché marocain (ou le prix indiqué sur l'image/fichier si présent).
3. Si l'utilisateur demande d'augmenter ou baisser les prix, ou de modifier le devis actuel, applique la modification demandée.
4. Réponds UNIQUEMENT avec un objet JSON valide suivant ce schéma exact :
{
  "reply": "Message professionnel expliquant le devis préparé",
  "clientName": "Nom du client ou société si détecté, sinon chaine vide",
  "referenceText": "Ex: DEMANDE DU 17/11 si détecté, sinon chaine vide",
  "items": [
    { "name": "Désignation professionnelle complète de l'article", "quantity": 1, "unitPriceTtc": 22999 }
  ]
}

DEVIS ACTUEL EN COURS :
Client actuel : ${clientName || 'Non spécifié'}
Articles actuels : ${JSON.stringify(currentItems)}

CATALOGUE DE RÉFÉRENCE (MAROC - DH) :
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
          text: `Contenu du fichier joint (${att.name}) :\n${att.extractedText}`,
        });
      }
    }

    parts.push({
      text: userPrompt.trim() || 'Analyse les fichiers/images joints et prépare le devis complet professionnel.',
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
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
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
      text: inputPrompt.trim() || `📎 Fichier(s) envoyé(s) : ${pendingAttachments.map((a) => a.name).join(', ')}`,
      attachments: [...pendingAttachments],
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const currentPrompt = inputPrompt;
    const currentAtts = [...pendingAttachments];

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setPendingAttachments([]);
    setIsProcessing(true);
    setStatusMessage('🤖 Analyse de la demande et tarification en cours...');

    try {
      let proposedItems: ErpLineItem[] = [];
      let proposedClient: string | undefined;
      let proposedReference: string | undefined;
      let replyText = '';

      const hasValidGeminiKey = apiKey && apiKey.length > 20 && !apiKey.startsWith('PLACEHOLDER');

      if (hasValidGeminiKey) {
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
      } else {
        // Zero-config local fallback (with automatic Browser OCR for images!)
        let combinedText = currentPrompt;
        for (const att of currentAtts) {
          if (att.extractedText) {
            combinedText += '\n' + att.extractedText;
          } else if (att.type === 'image' && att.dataUrl) {
            try {
              const ocrText = await runBrowserOcrOnImage(att.dataUrl);
              combinedText += '\n' + ocrText;
            } catch {
              // OCR fallback
            }
          }
        }

        const localResult = buildDevisLocallyFromText(combinedText);
        proposedItems = localResult.items;
        proposedClient = localResult.clientName;
        replyText = localResult.explanation;
      }

      // Automatically apply the proposed items & client to the live Devis editor!
      if (proposedItems.length > 0 || proposedClient) {
        onApplyDevisUpdate({
          ...(proposedItems.length > 0 ? { items: proposedItems } : {}),
          ...(proposedClient ? { clientName: proposedClient } : {}),
          ...(proposedReference ? { referenceText: proposedReference } : {}),
        });
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        proposedItems: proposedItems.length > 0 ? proposedItems : undefined,
        proposedClient,
        proposedReference,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Erreur lors de l'analyse : ${err?.message || 'Veuillez vérifier votre clé API ou réessayer.'}`,
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
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wide">
                Assistant IA Devis VERDANOVE (Vision + Excel + Catalogue)
              </h4>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                {apiKey && !apiKey.startsWith('PLACEHOLDER') ? 'Gemini 2.5 Vision Actif' : 'OCR + Moteur Local Actif'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Envoyez une photo/capture de la demande client, un fichier Excel/PDF ou écrivez vos instructions : l'IA remplit le devis automatiquement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {extraCatalog.length > 0 && (
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-mono">
              📚 +{extraCatalog.length} réf. fichiers mémorisées
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition cursor-pointer"
          >
            🔑 Clé IA Gemini Vision
          </button>
        </div>
      </div>

      {/* Optional Gemini API Key Input Drawer */}
      {showKeyModal && (
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">
              Configurer la Clé API Google Gemini (pour lecture ultra-précise des photos & manuscrits)
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
      <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
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

              {/* Attachments Preview */}
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
                            ✓ {att.extractedItems.length} produits importés
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Proposed Devis Preview inside Assistant Bubble */}
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
                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                    {m.proposedItems.map((it, idx) => (
                      <div key={idx} className="py-1 flex justify-between gap-2">
                        <span className="text-zinc-200 truncate">
                          <strong>{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="font-mono text-zinc-300 shrink-0">
                          {it.quantity * it.unitPriceTtc} dh
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onGeneratePdfNow}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1.5"
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

      {/* Input Form with File Upload & Paste Support */}
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
          title="Importer une image, capture WhatsApp, Excel (.xlsx) ou PDF"
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
          placeholder="Collez une capture d'écran (Ctrl+V), une liste d'articles, ou écrivez ex: 'Fais un devis pour Aya Toraif avec Sony FX30, Sigma 18-50mm, DJI RS4...'"
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
