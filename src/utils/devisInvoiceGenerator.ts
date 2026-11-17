/**
 * src/utils/devisInvoiceGenerator.ts
 *
 * IDURAR ERP/CRM-inspired Document Engine for GearShop.ma
 * Generates official Moroccan B2B/B2C Devis, Facture Proforma, and Facture Commerciale
 * with HT / TVA 20% / TTC breakdown, ICE/RC/IF legal fields, and French amount-in-words.
 */

export type ErpDocumentType = 'DEVIS' | 'PROFORMA' | 'FACTURE';

export interface ErpLineItem {
  id?: number | string;
  sku?: string;
  name: string;
  quantity: number;
  unitPriceTtc: number;
}

export interface ErpCompanySettings {
  companyName: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  ice: string;
  rc: string;
  ifNumber: string;
  tp: string;
  rib: string;
  bankName: string;
}

export interface ErpDocumentPayload {
  docType: ErpDocumentType;
  docNumber: string;
  issueDate: string;
  validUntilDate?: string;
  clientName: string;
  clientCompany?: string;
  clientIce?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCity?: string;
  clientAddress?: string;
  items: ErpLineItem[];
  discountPercent?: number;
  shippingCostTtc?: number;
  taxMode?: 'ttc_includes_20' | 'ht_plus_20' | 'exempt_0';
  paymentMethod?: string;
  notes?: string;
  companySettings?: Partial<ErpCompanySettings>;
}

const STORAGE_KEY_COMPANY = 'gearshop_erp_company_settings_v1';

export const DEFAULT_COMPANY_SETTINGS: ErpCompanySettings = {
  companyName: 'GEARSHOP MAROC',
  legalName: 'Soft Store Maroc — Matériel Photo, Cinéma & Audiovisuel Pro',
  address: 'Casablanca, Maroc',
  phone: '+212 673 011 873',
  email: 'contact@gearshop.ma',
  website: 'www.gearshop.ma',
  ice: '003198452000084',
  rc: 'Casablanca',
  ifNumber: '52849103',
  tp: '34901827',
  rib: 'Demander le RIB officiel sur WhatsApp (+212 673 011 873)',
  bankName: 'Virement Bancaire / Chèque Certifié / Espèces à la livraison',
};

export function loadErpCompanySettings(): ErpCompanySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    if (!raw) return DEFAULT_COMPANY_SETTINGS;
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveErpCompanySettings(settings: ErpCompanySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

/**
 * Converts a number into French words for Moroccan financial documents
 * ("Arrêté le présent devis à la somme de : ...")
 */
function underThousandToFrench(n: number): string {
  const units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
    'dix-sept', 'dix-huit', 'dix-neuf'
  ];
  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante',
    'soixante', 'quatre-vingt', 'quatre-vingt'
  ];

  if (n === 0) return '';
  if (n < 20) return units[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) {
      const sub = 10 + u;
      const sep = (t === 7 && u === 1) ? ' et ' : '-';
      return `${tens[t]}${sep}${units[sub]}`;
    }
    if (u === 0) return t === 8 ? 'quatre-vingts' : tens[t];
    if (u === 1 && t !== 8) return `${tens[t]} et un`;
    return `${tens[t]}-${units[u]}`;
  }
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const hundredPart = h === 1 ? 'cent' : `${units[h]} cent${rem === 0 ? 's' : ''}`;
  return rem === 0 ? hundredPart : `${hundredPart} ${underThousandToFrench(rem)}`;
}

export function numberToFrenchWordsMAD(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(rounded);
  const cents = Math.round((rounded - intPart) * 100);

  if (intPart === 0) return 'Zéro Dirham';

  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const remainder = intPart % 1000;

  const parts: string[] = [];
  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${underThousandToFrench(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${underThousandToFrench(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(underThousandToFrench(remainder));
  }

  const words = parts.join(' ').trim();
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  const centPart = cents > 0 ? ` et ${cents} centimes` : '';
  return `${capitalized} Dirhams${centPart} TTC`;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMAD(n: number): string {
  return n.toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' DH';
}

export function calculateErpTotals(payload: ErpDocumentPayload) {
  const taxMode = payload.taxMode || 'ttc_includes_20';
  const discountPct = Math.max(0, Math.min(100, payload.discountPercent || 0));

  const lines = payload.items.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const rawUnit = Math.max(0, Number(item.unitPriceTtc) || 0);

    let unitHt = rawUnit;
    let unitTtc = rawUnit;
    if (taxMode === 'ttc_includes_20') {
      unitHt = rawUnit / 1.2;
      unitTtc = rawUnit;
    } else if (taxMode === 'ht_plus_20') {
      unitHt = rawUnit;
      unitTtc = rawUnit * 1.2;
    } else {
      unitHt = rawUnit;
      unitTtc = rawUnit;
    }

    const totalHt = unitHt * qty;
    const totalTtc = unitTtc * qty;
    const totalTva = totalTtc - totalHt;

    return {
      index: idx + 1,
      sku: item.sku || (item.id ? `GS-${item.id}` : `REF-${idx + 1}`),
      name: item.name,
      quantity: qty,
      unitHt,
      unitTtc,
      totalHt,
      totalTva,
      totalTtc,
    };
  });

  const subtotalHt = lines.reduce((s, l) => s + l.totalHt, 0);
  const subtotalTtc = lines.reduce((s, l) => s + l.totalTtc, 0);

  const discountTtc = subtotalTtc * (discountPct / 100);
  const discountHt = subtotalHt * (discountPct / 100);

  const afterDiscountHt = subtotalHt - discountHt;
  const afterDiscountTtc = subtotalTtc - discountTtc;
  const totalTva = afterDiscountTtc - afterDiscountHt;

  // Shipping: strictly > 2000 DH is free unless explicitly overridden
  const shippingTtc =
    typeof payload.shippingCostTtc === 'number'
      ? payload.shippingCostTtc
      : afterDiscountTtc > 2000
      ? 0
      : payload.clientCity?.toLowerCase() === 'casablanca'
      ? 30
      : 45;

  const grandTotalTtc = afterDiscountTtc + shippingTtc;

  return {
    lines,
    subtotalHt,
    subtotalTtc,
    discountPct,
    discountHt,
    discountTtc,
    afterDiscountHt,
    totalTva,
    shippingTtc,
    grandTotalTtc,
    amountInWords: numberToFrenchWordsMAD(grandTotalTtc),
  };
}

export function openAndPrintDevisOrInvoice(payload: ErpDocumentPayload): void {
  const company = { ...loadErpCompanySettings(), ...(payload.companySettings || {}) };
  const calc = calculateErpTotals(payload);

  const docTitleMap: Record<ErpDocumentType, string> = {
    DEVIS: 'DEVIS OFFICIEL',
    PROFORMA: 'FACTURE PROFORMA',
    FACTURE: 'FACTURE COMMERCIALE',
  };

  const docLabelMap: Record<ErpDocumentType, string> = {
    DEVIS: 'Devis',
    PROFORMA: 'Facture Proforma',
    FACTURE: 'Facture',
  };

  const docTitle = docTitleMap[payload.docType] || 'DEVIS OFFICIEL';
  const docLabel = docLabelMap[payload.docType] || 'Devis';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(docTitle)} ${escapeHtml(payload.docNumber)} - ${escapeHtml(company.companyName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111827;
      background: #f3f4f6;
      padding: 24px;
      font-size: 12px;
      line-height: 1.45;
    }
    .toolbar {
      max-width: 210mm;
      margin: 0 auto 16px auto;
      background: #111827;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 13px;
    }
    .toolbar-badge {
      background: #dc2626;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #dc2626;
      color: #ffffff;
    }
    .btn-primary:hover { background: #b91c1c; }
    .btn-secondary {
      background: #374151;
      color: #ffffff;
    }
    .btn-secondary:hover { background: #4b5563; }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 16mm 16mm 14mm 16mm;
      box-shadow: 0 15px 35px rgba(0,0,0,0.08);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      border-top: 6px solid #dc2626;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 2px solid #f3f4f6;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #111827;
    }
    .brand-title span { color: #dc2626; }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      margin-top: 2px;
    }
    .company-meta {
      margin-top: 8px;
      font-size: 11px;
      color: #4b5563;
      line-height: 1.5;
    }

    .doc-box {
      text-align: right;
    }
    .doc-type-badge {
      display: inline-block;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      font-size: 15px;
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    .doc-meta-table {
      margin-left: auto;
      border-collapse: collapse;
      font-size: 11px;
    }
    .doc-meta-table td {
      padding: 2px 0 2px 14px;
    }
    .doc-meta-table td.label {
      color: #6b7280;
      font-weight: 600;
    }
    .doc-meta-table td.val {
      color: #111827;
      font-weight: 800;
      font-family: monospace;
      font-size: 12px;
    }

    /* Parties Grid */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 22px;
    }
    .party-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .party-card.client {
      background: #fff;
      border: 1.5px solid #111827;
    }
    .party-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 14px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 4px;
    }
    .party-details {
      font-size: 11px;
      color: #374151;
      line-height: 1.5;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      background: #111827;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 9px 10px;
      text-align: left;
    }
    .items-table th.num, .items-table td.num {
      text-align: right;
    }
    .items-table th.center, .items-table td.center {
      text-align: center;
    }
    .items-table td {
      padding: 10px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11.5px;
      vertical-align: middle;
    }
    .items-table tr:nth-child(even) td {
      background: #f9fafb;
    }
    .sku-pill {
      font-family: monospace;
      font-size: 10px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .item-title {
      font-weight: 700;
      color: #111827;
    }

    /* Summary Row */
    .summary-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: start;
      margin-bottom: 22px;
    }
    .words-box {
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .words-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .words-value {
      font-size: 12px;
      font-weight: 800;
      color: #111827;
      font-style: italic;
    }
    .conditions-list {
      margin-top: 10px;
      font-size: 10.5px;
      color: #4b5563;
      line-height: 1.55;
    }

    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 10px;
      font-size: 11.5px;
      border-bottom: 1px solid #f3f4f6;
    }
    .totals-table td.label {
      color: #4b5563;
      font-weight: 600;
    }
    .totals-table td.val {
      text-align: right;
      font-weight: 700;
      color: #111827;
    }
    .totals-table tr.grand-total td {
      background: #111827;
      color: #ffffff;
      font-size: 14px;
      font-weight: 900;
      padding: 10px 12px;
      border: none;
    }
    .totals-table tr.grand-total td.val {
      color: #f87171;
    }

    /* Signatures */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 10px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .sig-box {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 14px;
      min-height: 85px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #6b7280;
    }
    .sig-stamp {
      font-size: 11px;
      font-weight: 800;
      color: #dc2626;
      border: 1.5px dashed #fca5a5;
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      align-self: flex-start;
      margin-top: 8px;
    }

    /* Footer */
    .footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 2px solid #111827;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
      line-height: 1.5;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .page {
        width: 100%;
        min-height: auto;
        box-shadow: none;
        padding: 10mm;
        border-top: 4px solid #dc2626;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-badge">ERP GearShop</span>
      <span>${escapeHtml(docTitle)} — N° ${escapeHtml(payload.docNumber)}</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">Fermer</button>
    </div>
  </div>

  <div class="page">
    <div>
      <!-- Top Header -->
      <div class="header">
        <div>
          <div class="brand-title">GEAR<span>SHOP</span>.MA</div>
          <div class="brand-subtitle">${escapeHtml(company.legalName)}</div>
          <div class="company-meta">
            📍 ${escapeHtml(company.address)}<br/>
            📞 ${escapeHtml(company.phone)} &nbsp;|&nbsp; ✉️ ${escapeHtml(company.email)}<br/>
            🌐 ${escapeHtml(company.website)}
          </div>
        </div>

        <div class="doc-box">
          <div class="doc-type-badge">${escapeHtml(docTitle)}</div>
          <table class="doc-meta-table">
            <tr>
              <td class="label">Référence :</td>
              <td class="val">${escapeHtml(payload.docNumber)}</td>
            </tr>
            <tr>
              <td class="label">Date d'émission :</td>
              <td class="val">${escapeHtml(payload.issueDate)}</td>
            </tr>
            ${
              payload.validUntilDate
                ? `<tr>
              <td class="label">Valable jusqu'au :</td>
              <td class="val">${escapeHtml(payload.validUntilDate)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td class="label">Devise :</td>
              <td class="val">MAD (Dirham Marocain)</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Seller & Client Cards -->
      <div class="parties">
        <div class="party-card">
          <div class="party-label">Émetteur / Fournisseur</div>
          <div class="party-name">${escapeHtml(company.companyName)}</div>
          <div class="party-details">
            ${escapeHtml(company.legalName)}<br/>
            <strong>ICE :</strong> ${escapeHtml(company.ice)} &nbsp;|&nbsp; <strong>IF :</strong> ${escapeHtml(company.ifNumber)}<br/>
            <strong>RC :</strong> ${escapeHtml(company.rc)} &nbsp;|&nbsp; <strong>TP :</strong> ${escapeHtml(company.tp)}<br/>
            <strong>Support & Showroom :</strong> ${escapeHtml(company.phone)}
          </div>
        </div>

        <div class="party-card client">
          <div class="party-label">Client / Destinataire</div>
          <div class="party-name">${escapeHtml(payload.clientCompany || payload.clientName || 'Client Professionnel')}</div>
          <div class="party-details">
            ${payload.clientCompany && payload.clientName ? `<strong>Contact :</strong> ${escapeHtml(payload.clientName)}<br/>` : ''}
            ${payload.clientIce ? `<strong>ICE Client :</strong> ${escapeHtml(payload.clientIce)}<br/>` : ''}
            ${payload.clientPhone ? `<strong>Tél :</strong> ${escapeHtml(payload.clientPhone)}<br/>` : ''}
            ${payload.clientEmail ? `<strong>Email :</strong> ${escapeHtml(payload.clientEmail)}<br/>` : ''}
            ${payload.clientCity || payload.clientAddress ? `<strong>Adresse :</strong> ${escapeHtml([payload.clientAddress, payload.clientCity, 'Maroc'].filter(Boolean).join(', '))}` : 'Maroc'}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 34px;" class="center">#</th>
            <th style="width: 90px;">Réf / SKU</th>
            <th>Désignation de l'Équipement</th>
            <th style="width: 55px;" class="center">Qté</th>
            <th style="width: 105px;" class="num">P.U. HT</th>
            <th style="width: 105px;" class="num">P.U. TTC</th>
            <th style="width: 115px;" class="num">Total TTC</th>
          </tr>
        </thead>
        <tbody>
          ${calc.lines
            .map(
              (line) => `
            <tr>
              <td class="center">${line.index}</td>
              <td><span class="sku-pill">${escapeHtml(line.sku)}</span></td>
              <td>
                <div class="item-title">${escapeHtml(line.name)}</div>
                <div style="font-size: 10px; color: #6b7280;">Matériel neuf scellé — Garantie officielle 1 An Maroc</div>
              </td>
              <td class="center" style="font-weight: 800;">${line.quantity}</td>
              <td class="num">${formatMAD(line.unitHt)}</td>
              <td class="num">${formatMAD(line.unitTtc)}</td>
              <td class="num" style="font-weight: 800;">${formatMAD(line.totalTtc)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <!-- Summary & Totals -->
      <div class="summary-section">
        <div>
          <div class="words-box">
            <div class="words-label">Arrêté le présent ${escapeHtml(docLabel.toLowerCase())} à la somme de :</div>
            <div class="words-value">${escapeHtml(calc.amountInWords)}</div>
          </div>

          <div class="conditions-list">
            <strong>Conditions commerciales & Garantie :</strong><br/>
            • <strong>Garantie :</strong> 1 an garantie constructeur avec SAV local à Casablanca.<br/>
            • <strong>Règlement :</strong> ${escapeHtml(payload.paymentMethod || company.bankName)}.<br/>
            • <strong>Livraison :</strong> Expédition sécurisée 24h-48h partout au Maroc (Gratuite dès 2 001 DH).<br/>
            ${payload.notes ? `• <strong>Note :</strong> ${escapeHtml(payload.notes)}` : ''}
          </div>
        </div>

        <div>
          <table class="totals-table">
            <tr>
              <td class="label">Total Hors Taxes (HT)</td>
              <td class="val">${formatMAD(calc.afterDiscountHt)}</td>
            </tr>
            ${
              calc.discountPct > 0
                ? `<tr>
              <td class="label" style="color:#dc2626;">Remise Commerciale (${calc.discountPct}%)</td>
              <td class="val" style="color:#dc2626;">-${formatMAD(calc.discountTtc)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td class="label">TVA (20% incluse)</td>
              <td class="val">${formatMAD(calc.totalTva)}</td>
            </tr>
            <tr>
              <td class="label">Frais de Livraison</td>
              <td class="val">${calc.shippingTtc === 0 ? 'GRATUIT (0,00 DH)' : formatMAD(calc.shippingTtc)}</td>
            </tr>
            <tr class="grand-total">
              <td>NET À PAYER (TTC)</td>
              <td class="val">${formatMAD(calc.grandTotalTtc)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div>
      <!-- Signatures -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">Cachet & Validation ${escapeHtml(company.companyName)}</div>
          <div class="sig-stamp">✓ CERTIFIÉ CONFORME — GEARSHOP MAROC<br/>Tél: ${escapeHtml(company.phone)}</div>
          <div style="font-size: 9.5px; color: #9ca3af; margin-top: 6px;">Document généré électroniquement le ${escapeHtml(payload.issueDate)}</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">Bon pour accord Client (Date, Cachet & Signature)</div>
          <div style="font-size: 10px; color: #9ca3af; margin-top: 40px;">Mention "Lu et approuvé, bon pour commande"</div>
        </div>
      </div>

      <!-- Legal Footer -->
      <div class="footer">
        <strong>${escapeHtml(company.companyName)}</strong> — ${escapeHtml(company.legalName)} | Adresse : ${escapeHtml(company.address)}<br/>
        ICE : ${escapeHtml(company.ice)} | IF : ${escapeHtml(company.ifNumber)} | RC : ${escapeHtml(company.rc)} | TP : ${escapeHtml(company.tp)} | Tél : ${escapeHtml(company.phone)} | Web : ${escapeHtml(company.website)}
      </div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        // user can click print button in toolbar
      }
    }, 450);
  }
}
