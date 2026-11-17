import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../../App';
import { QuoteRequestItem } from '../../services/leadService';
import {
  ErpDocumentType,
  ErpLineItem,
  ErpCompanySettings,
  ErpDocumentPayload,
  loadErpCompanySettings,
  saveErpCompanySettings,
  calculateErpTotals,
  openAndPrintDevisOrInvoice,
} from '../../utils/devisInvoiceGenerator';

interface ErpDevisFactureManagerProps {
  products: Product[];
  quoteRequests: QuoteRequestItem[];
  initialLead?: QuoteRequestItem | null;
}

interface SavedErpDoc extends ErpDocumentPayload {
  createdAt: string;
  totalTtc: number;
}

const SAVED_DOCS_KEY = 'gearshop_erp_saved_documents_v1';

export const ErpDevisFactureManager: React.FC<ErpDevisFactureManagerProps> = ({
  products,
  quoteRequests,
  initialLead,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const validUntilDefault = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [, mm, dd] = todayStr.split('-');

  const [docType, setDocType] = useState<ErpDocumentType>('DEVIS');
  const [docNumber, setDocNumber] = useState<string>(
    `FA26${String(Math.floor(100 + Math.random() * 900)).padStart(5, '0')}`
  );
  const [issueDate, setIssueDate] = useState<string>(todayStr);
  const [referenceText, setReferenceText] = useState<string>(`DEMANDE DU ${dd}/${mm}`);
  const [validUntilDate, setValidUntilDate] = useState<string>(validUntilDefault);
  const [showStamp, setShowStamp] = useState<boolean>(true);

  const [clientName, setClientName] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientIce, setClientIce] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientCity, setClientCity] = useState<string>('Casablanca');
  const [clientAddress, setClientAddress] = useState<string>('');

  const [items, setItems] = useState<ErpLineItem[]>([
    {
      id: 6042,
      sku: 'GS-6042',
      name: 'Canon EOS R6 Mark III (Boîtier)',
      quantity: 1,
      unitPriceTtc: 34990,
    },
  ]);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxMode, setTaxMode] = useState<'ttc_includes_20' | 'ht_plus_20' | 'exempt_0'>('ht_plus_20');
  const [customShipping, setCustomShipping] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    'Virement Bancaire / Chèque Certifié / Paiement à la livraison'
  );
  const [notes, setNotes] = useState<string>(
    'Matériel neuf officiel avec garantie constructeur 1 an et SAV local à Casablanca.'
  );

  // Catalog search to add products
  const [productSearch, setProductSearch] = useState<string>('');

  // Company Legal Settings
  const [companySettings, setCompanySettings] = useState<ErpCompanySettings>(() => loadErpCompanySettings());
  const [showCompanySettings, setShowCompanySettings] = useState<boolean>(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState<boolean>(false);

  // Saved History
  const [savedDocs, setSavedDocs] = useState<SavedErpDoc[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_DOCS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Update prefix when docType changes
  const handleDocTypeChange = (newType: ErpDocumentType) => {
    setDocType(newType);
    const prefix = newType === 'DEVIS' ? 'DEV' : newType === 'PROFORMA' ? 'PRO' : 'FAC';
    setDocNumber((prev) => prev.replace(/^(DEV|PRO|FAC)/, prefix));
  };

  // Load initialLead if passed from Pipeline tab
  useEffect(() => {
    if (initialLead) {
      loadFromLead(initialLead);
    }
  }, [initialLead]);

  const loadFromLead = (lead: QuoteRequestItem) => {
    setClientName(lead.name || '');
    setClientCompany(lead.company || '');
    setClientPhone(lead.phone || '');
    setClientEmail(lead.email || '');

    // Try matching product(s) from lead.product_name
    const rawProd = lead.product_name || '';
    const matchedLines: ErpLineItem[] = [];

    // Check if it's a multi-item cart lead like "1x Canon EOS R50, 2x Sony FE 50mm"
    const parts = rawProd.split(',').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const qtyMatch = part.match(/^(\d+)\s*x\s*(.+)$/i);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : lead.quantity || 1;
      const cleanName = (qtyMatch ? qtyMatch[2] : part).replace(/^\[DEVIS PDF\]\s*/i, '').trim();

      const found = products.find(
        (p) =>
          p.name.toLowerCase() === cleanName.toLowerCase() ||
          p.name.toLowerCase().includes(cleanName.toLowerCase()) ||
          cleanName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (found) {
        matchedLines.push({
          id: found.id,
          sku: `GS-${found.id}`,
          name: found.name,
          quantity: qty,
          unitPriceTtc: found.price || 0,
        });
      } else if (cleanName) {
        matchedLines.push({
          sku: 'GS-CUSTOM',
          name: cleanName,
          quantity: qty,
          unitPriceTtc: lead.deal_value || 0,
        });
      }
    }

    if (matchedLines.length > 0) {
      setItems(matchedLines);
    }
  };

  const filteredCatalog = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.filter((p) => p.price > 0).slice(0, 8);
    return products
      .filter(
        (p) =>
          p.price > 0 &&
          (p.name.toLowerCase().includes(q) ||
            String(p.id).includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.brand || '').toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [products, productSearch]);

  const addProductToDoc = (p: Product) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === p.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: p.id,
          sku: `GS-${p.id}`,
          name: p.name,
          quantity: 1,
          unitPriceTtc: p.price || 0,
        },
      ];
    });
  };

  const addCustomLine = () => {
    setItems((prev) => [
      ...prev,
      {
        sku: `GS-${prev.length + 1}`,
        name: 'Équipement ou Prestation Audiovisuelle',
        quantity: 1,
        unitPriceTtc: 1000,
      },
    ]);
  };

  const updateLine = (index: number, field: keyof ErpLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const removeLine = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const currentPayload: ErpDocumentPayload = useMemo(() => {
    const shippingNum =
      customShipping === 'auto' ? undefined : Math.max(0, Number(customShipping) || 0);
    return {
      docType,
      docNumber,
      issueDate,
      referenceText,
      validUntilDate: docType === 'FACTURE' ? undefined : validUntilDate,
      validityDays: 30,
      clientName,
      clientCompany,
      clientIce,
      clientPhone,
      clientEmail,
      clientCity,
      clientAddress,
      items,
      discountPercent,
      shippingCostTtc: shippingNum,
      taxMode,
      paymentMethod,
      notes: '',
      showStamp,
      companySettings,
    };
  }, [
    docType,
    docNumber,
    issueDate,
    referenceText,
    validUntilDate,
    clientName,
    clientCompany,
    clientIce,
    clientPhone,
    clientEmail,
    clientCity,
    clientAddress,
    items,
    discountPercent,
    customShipping,
    taxMode,
    paymentMethod,
    notes,
    showStamp,
    companySettings,
  ]);

  const totals = useMemo(() => calculateErpTotals(currentPayload), [currentPayload]);

  const handleGeneratePdf = () => {
    if (items.length === 0) return;
    openAndPrintDevisOrInvoice(currentPayload);

    // Save to history
    const record: SavedErpDoc = {
      ...currentPayload,
      createdAt: new Date().toISOString(),
      totalTtc: totals.grandTotalTtc,
    };
    const updated = [record, ...savedDocs.filter((d) => d.docNumber !== record.docNumber)].slice(0, 50);
    setSavedDocs(updated);
    try {
      localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSendWhatsAppToClient = () => {
    const cleanPhone = (clientPhone || '').replace(/[^0-9]/g, '').replace(/^0/, '212');
    const itemsList = totals.lines
      .map((l) => `• ${l.quantity}x ${l.name} (${l.totalTtc.toLocaleString('fr-MA')} DH TTC)`)
      .join('\n');

    const msg =
      `Bonjour ${clientCompany || clientName || ''},\n\n` +
      `Voici le récapitulatif de votre *${docType} N° ${docNumber}* chez *GearShop Maroc* :\n\n` +
      `${itemsList}\n\n` +
      `💰 *Total HT :* ${totals.afterDiscountHt.toFixed(2)} DH\n` +
      `🏛️ *TVA (20%) :* ${totals.totalTva.toFixed(2)} DH\n` +
      `🚚 *Livraison :* ${totals.shippingTtc === 0 ? 'GRATUITE' : totals.shippingTtc + ' DH'}\n` +
      `✅ *NET À PAYER TTC : ${totals.grandTotalTtc.toLocaleString('fr-MA')} DH*\n\n` +
      `Restant à votre entière disposition pour toute question ou validation.`;

    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveErpCompanySettings(companySettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-md">
              IDURAR ERP MODULE
            </span>
            <h3 className="text-lg font-extrabold text-white">
              Générateur Automatique de Devis, Proforma & Factures (TVA 20% / ICE)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Créez des devis officiels et factures proforma PDF instantanément à partir des 299 produits du catalogue ou des demandes clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCompanySettings(!showCompanySettings)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition cursor-pointer"
          >
            ⚙️ Paramètres Légaux (ICE / RC / RIB)
          </button>
          <button
            type="button"
            onClick={() => {
              const prefix = docType === 'DEVIS' ? 'DEV' : docType === 'PROFORMA' ? 'PRO' : 'FAC';
              setDocNumber(`${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
            }}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition cursor-pointer"
          >
            🔄 Nouveau N° Document
          </button>
        </div>
      </div>

      {/* Collapsible Legal Settings */}
      {showCompanySettings && (
        <form
          onSubmit={handleSaveCompanySettings}
          className="bg-zinc-900 border border-red-500/40 p-5 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              🏛️ Informations Légales de l'Entreprise (Pied de page Devis & Factures)
            </h4>
            {settingsSavedToast && (
              <span className="text-xs font-bold text-emerald-400">✓ Paramètres sauvegardés !</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Nom Commercial</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Raison Sociale / Slogan</label>
              <input
                type="text"
                value={companySettings.legalName}
                onChange={(e) => setCompanySettings({ ...companySettings, legalName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">N° ICE</label>
              <input
                type="text"
                value={companySettings.ice}
                onChange={(e) => setCompanySettings({ ...companySettings, ice: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Identifiant Fiscal (IF)</label>
              <input
                type="text"
                value={companySettings.ifNumber}
                onChange={(e) => setCompanySettings({ ...companySettings, ifNumber: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Registre de Commerce (RC)</label>
              <input
                type="text"
                value={companySettings.rc}
                onChange={(e) => setCompanySettings({ ...companySettings, rc: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Taxe Professionnelle (TP)</label>
              <input
                type="text"
                value={companySettings.tp}
                onChange={(e) => setCompanySettings({ ...companySettings, tp: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Téléphone Officiel</label>
              <input
                type="text"
                value={companySettings.phone}
                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Adresse</label>
              <input
                type="text"
                value={companySettings.address}
                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Enregistrer les informations légales
            </button>
          </div>
        </form>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Document Details, Client, and Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Document Type & Quick Lead Import */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(['DEVIS', 'PROFORMA', 'FACTURE'] as ErpDocumentType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleDocTypeChange(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      docType === type
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {type === 'DEVIS'
                      ? '📋 DEVIS OFFICIEL'
                      : type === 'PROFORMA'
                      ? '📄 FACTURE PROFORMA'
                      : '🧾 FACTURE COMMERCIALE'}
                  </button>
                ))}
              </div>

              {quoteRequests.length > 0 && (
                <select
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const found = quoteRequests.find((q) => q.id === id);
                    if (found) loadFromLead(found);
                  }}
                  defaultValue=""
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none focus:border-red-500"
                >
                  <option value="" disabled>
                    📥 Importer depuis une demande client ({quoteRequests.length})...
                  </option>
                  {quoteRequests.slice(0, 30).map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} {q.company ? `(${q.company})` : ''} — {q.product_name.slice(0, 40)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">NUMERO (ex: FA2600002)</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">DATE</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setIssueDate(v);
                    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                      const [, m, d] = v.split('-');
                      setReferenceText(`DEMANDE DU ${d}/${m}`);
                    }
                  }}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">REFERENCE (ex: DEMANDE DU 03/09)</label>
                <input
                  type="text"
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 2. Client / Destinataire Info */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>👤</span> Informations Client / Société / Projet INDH
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nom du Contact / Client</label>
                <input
                  type="text"
                  placeholder="Ex: Yassine Benali"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Société / Studio / Coopérative</label>
                <input
                  type="text"
                  placeholder="Ex: Atlas Production SARL"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">N° ICE Client (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: 002548791000042"
                  value={clientIce}
                  onChange={(e) => setClientIce(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Téléphone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+212 6..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="contact@client.ma"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Ville</label>
                <input
                  type="text"
                  placeholder="Casablanca, Rabat, Marrakech..."
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Line Items & Catalog Picker */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📦</span> Articles & Équipements ({items.length})
              </h4>
              <button
                type="button"
                onClick={addCustomLine}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold border border-zinc-700 cursor-pointer"
              >
                + Ajouter une ligne libre
              </button>
            </div>

            {/* Search bar to add from catalog */}
            <div className="space-y-2">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="🔍 Rechercher un produit du catalogue à ajouter (ex: Canon R6 III, Sony FX3, Godox, 7Artisans...)"
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-xs text-white outline-none"
              />
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                {filteredCatalog.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProductToDoc(p)}
                    className="px-2.5 py-1 bg-zinc-800/90 hover:bg-red-600/20 hover:border-red-500 border border-zinc-700 rounded-lg text-[11px] text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="text-red-400 font-bold">+</span>
                    <span className="truncate max-w-[200px]">{p.name}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">({p.price} DH)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-200">
                <thead className="bg-zinc-800/80 text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-2.5 py-2 w-24">SKU</th>
                    <th className="px-2.5 py-2">Désignation</th>
                    <th className="px-2.5 py-2 w-20 text-center">Qté</th>
                    <th className="px-2.5 py-2 w-28 text-right">P.U. (MAD)</th>
                    <th className="px-2.5 py-2 w-28 text-right">Total TTC</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => updateLine(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[11px] font-mono text-zinc-300"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateLine(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white font-semibold"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateLine(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-center text-white font-bold"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          value={item.unitPriceTtc}
                          onChange={(e) => updateLine(idx, 'unitPriceTtc', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-right text-white font-mono"
                        />
                      </td>
                      <td className="px-2.5 py-2 text-right font-extrabold text-white font-mono">
                        {(item.quantity * item.unitPriceTtc).toLocaleString('fr-MA')} DH
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Supprimer la ligne"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Totals, Tax Settings & Actions */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 sticky top-20">
            <h4 className="text-sm font-bold text-white">💰 Récapitulatif Financier & TVA</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Mode de Calcul TVA (20%)</label>
                <select
                  value={taxMode}
                  onChange={(e) => setTaxMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                >
                  <option value="ttc_includes_20">Prix affichés TTC (incluent 20% de TVA)</option>
                  <option value="ht_plus_20">Prix saisis HT (+ ajouter 20% de TVA)</option>
                  <option value="exempt_0">Exonéré de TVA (0%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Remise (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Livraison (DH)</label>
                  <select
                    value={customShipping}
                    onChange={(e) => setCustomShipping(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                  >
                    <option value="auto">Auto (&gt; 2000 DH = 0 DH)</option>
                    <option value="0">Gratuite (0 DH)</option>
                    <option value="30">Casablanca (30 DH)</option>
                    <option value="45">National Maroc (45 DH)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Mode de règlement affiché</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer text-zinc-200 font-semibold">
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={(e) => setShowStamp(e.target.checked)}
                  className="rounded accent-red-600"
                />
                <span>Inclure le Cachet & Signature officiel VERDANOVE</span>
              </label>
            </div>

            {/* Totals Breakdown Box */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total HT :</span>
                <span className="font-mono text-white font-semibold">
                  {totals.afterDiscountHt.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                </span>
              </div>
              {totals.discountPct > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Remise ({totals.discountPct}%) :</span>
                  <span className="font-mono font-semibold">
                    -{totals.discountTtc.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                  </span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>TVA (20%) :</span>
                <span className="font-mono text-white font-semibold">
                  {totals.totalTva.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Livraison :</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {totals.shippingTtc === 0 ? 'GRATUITE' : `${totals.shippingTtc} DH`}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-extrabold text-white text-sm">NET À PAYER TTC :</span>
                <span className="font-black text-red-500 text-lg font-mono">
                  {totals.grandTotalTtc.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 italic pt-1">
                « {totals.amountInWords} »
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🖨️</span>
                <span>Générer & Télécharger {docType} PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppToClient}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>Envoyer le récapitulatif sur WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Documents History */}
      {savedDocs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white">🗂️ Historique des Documents Générés ({savedDocs.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-800/80 text-zinc-400 text-[10px] uppercase">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">N° Document</th>
                  <th className="px-3 py-2">Client / Société</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Total TTC</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {savedDocs.slice(0, 10).map((doc, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded font-bold text-[10px]">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-white">{doc.docNumber}</td>
                    <td className="px-3 py-2">{doc.clientCompany || doc.clientName || 'Client'}</td>
                    <td className="px-3 py-2 text-zinc-400">{doc.issueDate}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                      {doc.totalTtc.toLocaleString('fr-MA')} DH
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openAndPrintDevisOrInvoice(doc)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                      >
                        🖨️ PDF
                      </button>
                      {doc.docType !== 'FACTURE' && (
                        <button
                          type="button"
                          onClick={() => {
                            const facPayload: ErpDocumentPayload = {
                              ...doc,
                              docType: 'FACTURE',
                              docNumber: doc.docNumber.replace(/^(DEV|PRO)/, 'FAC'),
                              issueDate: todayStr,
                            };
                            openAndPrintDevisOrInvoice(facPayload);
                          }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          ➔ Convertir en Facture
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
