/**
 * src/utils/devisInvoiceGenerator.ts
 *
 * Exact 1:1 Replica of the Official VERDANOVE SARL Word (.docx) Devis Template:
 * - Left-aligned VERDANOVE Logo (293px × 73px) (/images/verdanove-header-logo.png)
 * - Times New Roman 21pt "DEVIS" on left & "client : <Name>" on right
 * - Table 1 (54% width, left-aligned): | NUMERO (24.5%) | DATE (25.2%) | REFERENCE (50.3%) |
 * - Table 2 (100% width): | Désignation (74.7%) | Qté (11.6%) | Montant HT (13.7%) |
 * - Validity & Stamp Row + Left-aligned Table 3 (52% width) beside Cachet et Signature (VERDANOVE) blue stamp (/images/verdanove-stamp.png, 186px × 89px)
 * - "Arrêté le présent devis à la somme de : ..."
 * - Official VERDANOVE Footer:
 *   VERDANOVE
 *   174 BD ZERKTOUNI ET MOUSA BNOU NOUSSAIR CASABLANCA
 *   ICE: 003746027000044 IF: 66987636 / RC: 680157
 *   Email :Verdanove@gmail.com   Tél : +212 661150961
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
  isConfirmedByOwner?: boolean;
  companySettings?: Partial<ErpCompanySettings>;
}

const STORAGE_KEY_COMPANY = 'verdanove_erp_company_settings_v3';

export const DEFAULT_COMPANY_SETTINGS: ErpCompanySettings = {
  companyName: 'VERDANOVE',
  legalName: 'VERDANOVE SARL',
  address: '174 BD ZERKTOUNI ET MOUSA BNOU NOUSSAIR CASABLANCA',
  phone: '+212 661150961',
  email: 'Verdanove@gmail.com',
  website: 'www.gearshop.ma',
  ice: '003746027000044',
  rc: '680157',
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
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMPANY_SETTINGS,
      ...parsed,
      logoUrl: '/images/verdanove-header-logo.png',
      stampUrl: '/images/verdanove-stamp.png',
    };
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
  const company = {
    ...loadErpCompanySettings(),
    ...(payload.companySettings || {}),
    logoUrl: '/images/verdanove-header-logo.png',
    stampUrl: '/images/verdanove-stamp.png',
  };
  const calc = calculateErpTotals(payload);
  const { dateShort, refDefault } = formatShortDate(payload.issueDate);
  const referenceDisplay = payload.referenceText?.trim() || refDefault;
  const isConfirmedByOwner = payload.isConfirmedByOwner !== false;
  const showStamp = isConfirmedByOwner && payload.showStamp !== false;

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
  const docTitleWithStatus = isConfirmedByOwner ? docTitle : `${docTitle} (À CONFIRMER)`;
  const docWord = docWordMap[payload.docType] || 'devis';
  const clientDisplay = [payload.clientCompany, payload.clientName].filter(Boolean).join(' - ') || 'Client';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(docTitleWithStatus)} ${escapeHtml(payload.docNumber)} - ${escapeHtml(clientDisplay)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      background: #e5e7eb;
      padding: 20px;
      font-size: 11pt;
      line-height: 1.3;
    }
    .toolbar {
      max-width: 210mm;
      margin: 0 auto 14px auto;
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
      padding: 12mm 14mm 12mm 14mm;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* 1. Top Left VERDANOVE Logo (Exact docx size: 293px x 73px) */
    .logo-container {
      text-align: left;
      margin-bottom: 10px;
    }
    .logo-container img {
      width: 293px;
      height: 73px;
      object-fit: contain;
      display: block;
    }

    /* 2. DEVIS & client : Row (Times New Roman 21pt as in docx) */
    .title-client-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: 'Times New Roman', Times, serif;
      font-size: 21pt;
      font-weight: 400;
      margin: 4px 0 18px 0;
      padding: 0 12px;
    }
    .client-ice {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
      text-align: right;
      margin-top: 2px;
    }

    /* Standard Verdanove Black-Bordered Tables */
    table.verdanove-table {
      border-collapse: collapse;
      border: 1.5px solid #000000;
    }
    table.verdanove-table th,
    table.verdanove-table td {
      border: 1px solid #000000;
      padding: 5px 8px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #000000;
    }
    table.verdanove-table th {
      font-weight: 700;
      text-align: center;
      background: #ffffff;
    }

    /* 3. Table 1: NUMERO | DATE | REFERENCE (54% width, left-aligned as in docx) */
    .meta-table {
      width: 54%;
      margin-bottom: 16px;
    }
    .meta-table td {
      text-align: center;
      font-weight: 400;
    }

    /* 4. Table 2: Désignation | Qté | Montant HT (100% width as in docx) */
    .items-table {
      width: 100%;
      margin-bottom: 10px;
    }
    .items-table td.designation {
      text-align: left;
      width: 74.7%;
      padding-left: 10px;
    }
    .items-table td.qty {
      text-align: center;
      width: 11.6%;
    }
    .items-table td.amount {
      text-align: center;
      width: 13.7%;
    }

    /* 5. Validity, Totals Table (Left) & Cachet/Stamp (Right) as in docx */
    .bottom-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 4px;
      gap: 20px;
    }
    .bottom-left {
      width: 56%;
    }
    .validity-text {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10pt;
      font-weight: 700;
      margin-bottom: 24px;
    }

    /* Table 3: Total HT | Total TVA (20%) | Total TTC (Left side box as in docx) */
    .totals-table {
      width: 100%;
      margin-bottom: 14px;
    }
    .totals-table th {
      font-size: 9.5pt;
      font-weight: 700;
      padding: 6px 6px;
      text-align: center;
    }
    .totals-table td {
      font-size: 10pt;
      font-weight: 700;
      padding: 7px 6px;
      text-align: center;
    }

    .bottom-right {
      width: 40%;
      text-align: left;
    }
    .stamp-label {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10.5pt;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .stamp-img {
      width: 190px;
      height: auto;
      object-fit: contain;
      display: block;
      margin-left: 18px;
    }
    .unconfirmed-box {
      border: 1.5px solid #dc2626;
      background: #fffbeb;
      border-radius: 6px;
      padding: 8px 10px;
      margin-top: 4px;
    }
    .unconfirmed-title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      font-weight: 800;
      color: #b91c1c;
      margin-bottom: 4px;
    }
    .unconfirmed-body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      line-height: 1.35;
      color: #78350f;
    }
    .unconfirmed-badge {
      display: inline-block;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      font-weight: 800;
      color: #b91c1c;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 2px 8px;
      border-radius: 4px;
      vertical-align: middle;
      margin-left: 8px;
    }

    /* 6. Arrêté le présent devis à la somme de */
    .amount-words {
      margin-top: 6px;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
    }

    /* 7. Official VERDANOVE Footer */
    .footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #d1d5db;
      text-align: center;
      font-family: 'Times New Roman', Times, serif;
      font-size: 10pt;
      color: #666666;
      line-height: 1.35;
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .page {
        width: 210mm;
        min-height: 297mm;
        box-shadow: none;
        padding: 12mm 14mm 12mm 14mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-badge" style="background: ${isConfirmedByOwner ? '#16a34a' : '#d97706'};">${isConfirmedByOwner ? 'VERDANOVE SARL' : 'À CONFIRMER'}</span>
      <span>${escapeHtml(docTitleWithStatus)} N° ${escapeHtml(payload.docNumber)} — client : ${escapeHtml(clientDisplay)}</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">Fermer</button>
    </div>
  </div>

  <div class="page">
    <div>
      <!-- 1. Top Left VERDANOVE Logo -->
      <div class="logo-container">
        <img src="${escapeHtml(company.logoUrl || '/images/verdanove-header-logo.png')}" alt="VERDANOVE" />
      </div>

      <!-- 2. DEVIS & client Row -->
      <div class="title-client-row">
        <div>&nbsp;&nbsp;${escapeHtml(docTitle)}${!isConfirmedByOwner ? '<span class="unconfirmed-badge">(À CONFIRMER)</span>' : ''}</div>
        <div>
          <div>client : ${escapeHtml(clientDisplay)}</div>
          ${payload.clientIce ? `<div class="client-ice">ICE : ${escapeHtml(payload.clientIce)}</div>` : ''}
        </div>
      </div>

      <!-- 3. NUMERO | DATE | REFERENCE Table (54% width, left-aligned) -->
      <table class="verdanove-table meta-table">
        <thead>
          <tr>
            <th style="width: 24.5%;">NUMERO</th>
            <th style="width: 25.2%;">DATE</th>
            <th style="width: 50.3%;">REFERENCE</th>
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

      <!-- 4. Désignation | Qté | Montant HT Table (100% width) -->
      <table class="verdanove-table items-table">
        <thead>
          <tr>
            <th class="designation" style="text-align:center;">Désignation</th>
            <th class="qty">Qté</th>
            <th class="amount">Montant HT</th>
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

      <!-- 5. Validity + Totals Table (Left) & Cachet et Signature (Right) -->
      <div class="bottom-grid">
        <div class="bottom-left">
          <div class="validity-text">
            « Validité de l'offre : ${payload.validityDays || 30} jours »
          </div>

          <table class="verdanove-table totals-table">
            <thead>
              <tr>
                <th style="width: 33%;">Total Hors Taxes (HT)</th>
                <th style="width: 28%;">Total TVA (20%)</th>
                <th style="width: 39%;">Total Toutes Taxes Comprises (TTC)</th>
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
        </div>

        <div class="bottom-right">
          ${
            !isConfirmedByOwner
              ? `<div class="stamp-label">Validation &amp; Confirmation (${escapeHtml(company.companyName)}):</div>
                 <div class="unconfirmed-box">
                   <div class="unconfirmed-title">⏳ DEVIS EN ATTENTE DE CONFIRMATION</div>
                   <div class="unconfirmed-body">
                     Ce devis a été généré en ligne et doit être confirmé par le responsable. Veuillez envoyer ce devis au responsable VERDANOVE / GearShop (<strong>+212 724 66 46 56</strong> / <strong>Verdanove@gmail.com</strong>) afin de vérifier la disponibilité et valider définitivement votre commande.
                   </div>
                 </div>`
              : `<div class="stamp-label">Cachet et Signature (${escapeHtml(company.companyName)}):</div>
                 ${
                   showStamp
                     ? `<img class="stamp-img" src="${escapeHtml(company.stampUrl || '/images/verdanove-stamp.png')}" alt="Cachet VERDANOVE" />`
                     : `<div style="height: 90px;"></div>`
                 }`
          }
        </div>
      </div>

      <!-- 6. Arrêté le présent devis à la somme de -->
      <div class="amount-words">
        Arrêté le présent ${escapeHtml(docWord)} à la somme de : ${escapeHtml(calc.amountInWords)}
      </div>
    </div>

    <!-- 7. Official VERDANOVE Footer (exact footer1.xml from docx) -->
    <div class="footer">
      <div>${escapeHtml(company.companyName)}</div>
      <div>${escapeHtml(company.address)}</div>
      <div>ICE: ${escapeHtml(company.ice)} IF: ${escapeHtml(company.ifNumber)} / RC: ${escapeHtml(company.rc)}</div>
      <div>Email :${escapeHtml(company.email)} &nbsp;&nbsp;&nbsp; Tél : ${escapeHtml(company.phone)}</div>
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
