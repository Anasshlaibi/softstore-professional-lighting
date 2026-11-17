/**
 * src/utils/devisInvoiceGenerator.ts
 *
 * Official VERDANOVE SARL Devis / Facture Proforma / Facture PDF Generator
 * Matches the exact VERDANOVE template layout:
 * - Top VERDANOVE Logo (/images/verdanove-header-logo.png)
 * - DEVIS / FACTURE + client : <Name>
 * - Metadata Table: | NUMERO | DATE | REFERENCE | (e.g. FA2600002 | 03/09/26 | DEMANDE DU 03/09)
 * - Items Table: | Désignation | Qté | Montant HT |
 * - « Validité de l'offre : 30 jours » + Cachet et Signature (VERDANOVE) with blue stamp (/images/verdanove-stamp.png)
 * - Totals Table: | Total Hors Taxes (HT) | Total TVA (20%) | Total Toutes Taxes Comprises (TTC) |
 * - Arrêté le présent devis à la somme de : [Montant en lettres]
 * - Official VERDANOVE Footer: 174 BD ZERKTOUNI ET MOUSA BNOU NOUSSAIR CASABLANCA | ICE: 003746027000044 | IF: 66987636 / RC: 680157 | Email : Verdanove@gmail.com | Tél : +212 661150961
 */

export type ErpDocumentType = 'DEVIS' | 'PROFORMA' | 'FACTURE';

export interface ErpLineItem {
  id?: number | string;
  sku?: string;
  name: string;
  quantity: number;
  unitPriceTtc: number; // Used as Montant unitaire (HT or TTC depending on taxMode)
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
  logoUrl?: string;
  stampUrl?: string;
}

export interface ErpDocumentPayload {
  docType: ErpDocumentType;
  docNumber: string;
  issueDate: string;
  referenceText?: string;
  validUntilDate?: string;
  validityDays?: number;
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
  taxMode?: 'ht_plus_20' | 'ttc_includes_20' | 'exempt_0';
  paymentMethod?: string;
  notes?: string;
  showStamp?: boolean;
  companySettings?: Partial<ErpCompanySettings>;
}

const STORAGE_KEY_COMPANY = 'verdanove_erp_company_settings_v2';

export const DEFAULT_COMPANY_SETTINGS: ErpCompanySettings = {
  companyName: 'VERDANOVE',
  legalName: 'VERDANOVE SARL — Importation & Exportation Matériel Audiovisuel',
  address: '174 BD ZERKTOUNI ET MOUSA BNOU NOUSSAIR, ÉTG 7, APPT 16 (CENTER TWIN), CASABLANCA',
  phone: '+212 661150961',
  email: 'Verdanove@gmail.com',
  website: 'www.gearshop.ma',
  ice: '003746027000044',
  rc: '680157 (Casablanca)',
  ifNumber: '66987636',
  tp: '',
  rib: '',
  bankName: 'Virement Bancaire / Chèque Certifié / Espèces',
  logoUrl: '/images/verdanove-header-logo.png',
  stampUrl: '/images/verdanove-stamp.png',
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
 * Converts a number into French words matching the exact Verdanove format:
 * "Soixante-dix-huit mille six cent neuf dirhams et soixante centimes"
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

  if (intPart === 0) return 'Zéro dirham';

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
  const centWords = cents > 0 ? ` et ${underThousandToFrench(cents)} centime${cents > 1 ? 's' : ''}` : '';
  return `${capitalized} dirhams${centWords}`;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatShortDate(isoOrDate: string): { dateShort: string; refDefault: string } {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
      const [yyyy, mm, dd] = isoOrDate.split('-');
      return {
        dateShort: `${dd}/${mm}/${yyyy.slice(2)}`,
        refDefault: `DEMANDE DU ${dd}/${mm}`,
      };
    }
    const d = new Date(isoOrDate);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(2);
      return {
        dateShort: `${dd}/${mm}/${yy}`,
        refDefault: `DEMANDE DU ${dd}/${mm}`,
      };
    }
  } catch {
    // fallback
  }
  return { dateShort: isoOrDate, refDefault: 'DEMANDE CLIENT' };
}

function formatTableCurrency(n: number): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLineHt(n: number): string {
  const isWhole = Math.abs(n - Math.round(n)) < 0.01;
  if (isWhole) {
    return `${Math.round(n)}dh`;
  }
  return `${n.toFixed(2).replace('.', ',')}dh`;
}

export function calculateErpTotals(payload: ErpDocumentPayload) {
  const taxMode = payload.taxMode || 'ht_plus_20';
  const discountPct = Math.max(0, Math.min(100, payload.discountPercent || 0));

  const lines = payload.items.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const rawUnit = Math.max(0, Number(item.unitPriceTtc) || 0);

    let unitHt = rawUnit;
    let unitTtc = rawUnit;
    if (taxMode === 'ht_plus_20') {
      unitHt = rawUnit;
      unitTtc = rawUnit * 1.2;
    } else if (taxMode === 'ttc_includes_20') {
      unitHt = rawUnit / 1.2;
      unitTtc = rawUnit;
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

  const discountHt = subtotalHt * (discountPct / 100);
  const discountTtc = subtotalTtc * (discountPct / 100);

  const afterDiscountHt = subtotalHt - discountHt;
  const totalTva = taxMode === 'exempt_0' ? 0 : afterDiscountHt * 0.2;
  const afterDiscountTtc = afterDiscountHt + totalTva;

  const shippingTtc =
    typeof payload.shippingCostTtc === 'number' ? payload.shippingCostTtc : 0;

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
  const { dateShort, refDefault } = formatShortDate(payload.issueDate);
  const referenceDisplay = payload.referenceText?.trim() || refDefault;
  const showStamp = payload.showStamp !== false;

  const docTitleMap: Record<ErpDocumentType, string> = {
    DEVIS: 'DEVIS',
    PROFORMA: 'FACTURE PROFORMA',
    FACTURE: 'FACTURE',
  };
  const docWordMap: Record<ErpDocumentType, string> = {
    DEVIS: 'devis',
    PROFORMA: 'facture proforma',
    FACTURE: 'facture',
  };

  const docTitle = docTitleMap[payload.docType] || 'DEVIS';
  const docWord = docWordMap[payload.docType] || 'devis';
  const clientDisplay = [payload.clientCompany, payload.clientName].filter(Boolean).join(' - ') || 'Client';

  const logoSrc = company.logoUrl || '/images/verdanove-header-logo.png';
  const stampSrc = company.stampUrl || '/images/verdanove-stamp.png';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(docTitle)} ${escapeHtml(payload.docNumber)} - ${escapeHtml(clientDisplay)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      color: #000000;
      background: #e5e7eb;
      padding: 20px;
      font-size: 13px;
      line-height: 1.35;
    }
    .toolbar {
      max-width: 210mm;
      margin: 0 auto 16px auto;
      background: #111827;
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 13px;
    }
    .toolbar-badge {
      background: #16a34a;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 5px;
      text-transform: uppercase;
    }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      border: none;
      padding: 8px 16px;
      border-radius: 7px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #374151; color: #fff; }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 14mm 18mm 14mm 18mm;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Top Logo Banner */
    .logo-container {
      text-align: center;
      margin-bottom: 14px;
    }
    .logo-container img {
      max-height: 82px;
      width: auto;
      object-fit: contain;
    }

    /* Title & Client Row */
    .title-client-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 6px 0 12px 0;
      padding: 0 4px;
    }
    .doc-heading {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .client-heading {
      font-size: 14.5px;
      font-weight: 700;
    }
    .client-sub {
      font-size: 11.5px;
      font-weight: 400;
      color: #333;
      text-align: right;
      margin-top: 2px;
    }

    /* Standard Verdanove Bordered Tables */
    table.verdanove-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    table.verdanove-table th,
    table.verdanove-table td {
      border: 1px solid #000000;
      padding: 5px 10px;
      font-size: 12.5px;
    }
    table.verdanove-table th {
      font-weight: 700;
      text-align: center;
      background: #ffffff;
    }

    /* Meta Table */
    .meta-table td {
      text-align: center;
      font-weight: 500;
    }

    /* Items Table */
    .items-table td.designation {
      text-align: left;
    }
    .items-table td.qty {
      text-align: center;
      width: 75px;
    }
    .items-table td.amount {
      text-align: center;
      width: 135px;
    }

    /* Validity & Stamp Section */
    .validity-stamp-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 8px 0 14px 0;
    }
    .validity-text {
      font-size: 13px;
      font-weight: 700;
    }
    .stamp-block {
      text-align: right;
      min-width: 240px;
    }
    .stamp-label {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stamp-img {
      max-width: 195px;
      max-height: 115px;
      object-fit: contain;
      display: inline-block;
      margin-right: 8px;
    }

    /* Totals Table */
    .totals-table th,
    .totals-table td {
      text-align: center;
      width: 33.33%;
      padding: 6px 10px;
    }
    .totals-table td {
      font-weight: 700;
      font-size: 13px;
    }

    /* Amount in Words */
    .amount-words {
      margin-top: 8px;
      font-size: 13px;
      line-height: 1.45;
    }
    .amount-words strong {
      font-weight: 700;
    }

    /* Footer */
    .footer {
      margin-top: 22px;
      padding-top: 8px;
      border-top: 1px solid #9ca3af;
      text-align: center;
      font-size: 10.5px;
      color: #1f2937;
      line-height: 1.45;
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .page {
        width: 100%;
        min-height: 275mm;
        box-shadow: none;
        padding: 8mm 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-badge">VERDANOVE ERP</span>
      <span>${escapeHtml(docTitle)} N° ${escapeHtml(payload.docNumber)} — Client : ${escapeHtml(clientDisplay)}</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">Fermer</button>
    </div>
  </div>

  <div class="page">
    <div>
      <!-- Top VERDANOVE Logo -->
      <div class="logo-container">
        <img src="${escapeHtml(logoSrc)}" alt="VERDANOVE" />
      </div>

      <!-- DEVIS & Client Row -->
      <div class="title-client-row">
        <div class="doc-heading">&nbsp;&nbsp;${escapeHtml(docTitle)}</div>
        <div>
          <div class="client-heading">client : ${escapeHtml(clientDisplay)}</div>
          ${payload.clientIce ? `<div class="client-sub">ICE : ${escapeHtml(payload.clientIce)}</div>` : ''}
          ${payload.clientCity ? `<div class="client-sub">${escapeHtml(payload.clientCity)}</div>` : ''}
        </div>
      </div>

      <!-- NUMERO / DATE / REFERENCE Table -->
      <table class="verdanove-table meta-table">
        <thead>
          <tr>
            <th style="width: 32%;">NUMERO</th>
            <th style="width: 30%;">DATE</th>
            <th style="width: 38%;">REFERENCE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${escapeHtml(payload.docNumber)}</td>
            <td>${escapeHtml(dateShort)}</td>
            <td>${escapeHtml(referenceDisplay)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Désignation / Qté / Montant HT Table -->
      <table class="verdanove-table items-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th style="width: 80px;">Qté</th>
            <th style="width: 140px;">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          ${calc.lines
            .map(
              (line) => `
            <tr>
              <td class="designation">${escapeHtml(line.name)}</td>
              <td class="qty">${line.quantity}</td>
              <td class="amount">${escapeHtml(formatLineHt(line.totalHt))}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <!-- Validité + Cachet et Signature (VERDANOVE) -->
      <div class="validity-stamp-row">
        <div class="validity-text">
          « Validité de l'offre : ${payload.validityDays || 30} jours »
          ${payload.notes ? `<div style="font-weight:400; font-size:11.5px; margin-top:4px;">${escapeHtml(payload.notes)}</div>` : ''}
        </div>
        <div class="stamp-block">
          <div class="stamp-label">Cachet et Signature (${escapeHtml(company.companyName)}):</div>
          ${
            showStamp
              ? `<img class="stamp-img" src="${escapeHtml(stampSrc)}" alt="Cachet ${escapeHtml(company.companyName)}" />`
              : `<div style="height: 85px;"></div>`
          }
        </div>
      </div>

      <!-- Bottom Totals Table: HT | TVA (20%) | TTC -->
      <table class="verdanove-table totals-table">
        <thead>
          <tr>
            <th>Total Hors Taxes (HT)</th>
            <th>Total TVA (20%)</th>
            <th>Total Toutes Taxes Comprises (TTC)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${formatTableCurrency(calc.afterDiscountHt)}</td>
            <td>${formatTableCurrency(calc.totalTva)}</td>
            <td>${formatTableCurrency(calc.grandTotalTtc)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Arrêté le présent devis à la somme de -->
      <div class="amount-words">
        Arrêté le présent ${escapeHtml(docWord)} à la somme de : <strong>${escapeHtml(calc.amountInWords)}</strong>
      </div>
    </div>

    <!-- Official VERDANOVE Footer -->
    <div class="footer">
      <strong>${escapeHtml(company.companyName)} SARL</strong> — ${escapeHtml(company.address)}<br/>
      ICE: ${escapeHtml(company.ice)} &nbsp;|&nbsp; IF: ${escapeHtml(company.ifNumber)} &nbsp;/&nbsp; RC: ${escapeHtml(company.rc)} &nbsp;|&nbsp; Email : ${escapeHtml(company.email)} &nbsp;|&nbsp; Tél : ${escapeHtml(company.phone)}
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
    }, 500);
  }
}
