import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../src/context/CartContext';
import { supabase } from '../src/lib/supabase';
import { saveErpDocumentToSupabase, subscribeNewsletter } from '../src/services/leadService';
import { sendMetaCapiEvent } from '../src/services/metaCapiService';
import { trackCheckoutStarted, trackWhatsAppLead } from '../src/services/googleAnalytics';
import { openAndPrintDevisOrInvoice, ErpDocumentPayload } from '../src/utils/devisInvoiceGenerator';

interface CheckoutModalProps {
  onClose: () => void;
  siteConfig: { currency: string; phone: string; brandName: string };
  appliedPromo: number | null;
  onSuccess: () => void;
}

const CLIENT_PROFILE_KEY = 'gearshop_client_profile_v1';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  siteConfig,
  appliedPromo,
  onSuccess,
}) => {
  const { cart: cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  // Fire InitiateCheckout when modal opens
  useEffect(() => {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    trackCheckoutStarted(
      cartTotal,
      cartItems.reduce((sum, item) => sum + item.qty, 0),
      cartItems.map(item => ({
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.qty,
      }))
    );
    const win = window as any;
    if (typeof win.fbq === 'function') {
      win.fbq('track', 'InitiateCheckout', {
        value: cartTotal,
        currency: 'MAD',
        num_items: cartItems.reduce((sum, item) => sum + item.qty, 0),
        content_ids: cartItems.map(i => i.id.toString()),
        content_type: 'product'
      });
    }
  }, [cartItems]);

  const savedProfile = (() => {
    try {
      const raw = localStorage.getItem(CLIENT_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [formData, setFormData] = useState({
    name: savedProfile?.fullName || '',
    email: savedProfile?.email || '',
    phone: savedProfile?.phone || '',
    company: savedProfile?.company || '',
    ice: savedProfile?.ice || '',
    city: savedProfile?.city || 'Casablanca',
    address: '',
    message: '',
  });
  const [linkClientAccount, setLinkClientAccount] = useState(true);
  const [accountPassword, setAccountPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistAccountAndEmail = async () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const profileObj = {
      fullName: formData.name.trim(),
      email: cleanEmail,
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      ice: formData.ice.trim(),
      city: formData.city,
    };
    if (linkClientAccount && (profileObj.fullName || profileObj.email || profileObj.phone)) {
      try {
        localStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(profileObj));
      } catch {}
    }
    if (cleanEmail && cleanEmail.includes('@')) {
      try {
        await subscribeNewsletter(cleanEmail);
      } catch {}
      if (linkClientAccount && accountPassword.trim().length >= 6) {
        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password: accountPassword.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/mon-compte`,
              data: {
                full_name: profileObj.fullName,
                phone: profileObj.phone,
                company: profileObj.company,
                ice: profileObj.ice,
                city: profileObj.city,
              },
            },
          });
        } catch {}
      }
    }
  };

  const handleDownloadInstantDevis = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [, mm, dd] = todayStr.split('-');
    const validUntilStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const devisNum = `FA26${String(Math.floor(100 + Math.random() * 900)).padStart(5, '0')}`;

    const devisPayload: ErpDocumentPayload = {
      docType: 'DEVIS',
      docNumber: devisNum,
      issueDate: todayStr,
      referenceText: `DEMANDE DU ${dd}/${mm}`,
      validUntilDate: validUntilStr,
      validityDays: 30,
      clientName: formData.name || 'Client',
      clientCompany: formData.company || undefined,
      clientIce: formData.ice || undefined,
      clientPhone: formData.phone || undefined,
      clientEmail: formData.email || undefined,
      clientCity: formData.city,
      clientAddress: formData.address || undefined,
      items: cartItems.map((item) => ({
        id: item.id,
        sku: `GS-${item.id}`,
        name: item.name,
        quantity: item.qty,
        unitPriceTtc: item.price,
      })),
      discountPercent: appliedPromo || 0,
      shippingCostTtc: 0,
      taxMode: 'ttc_includes_20',
      isConfirmedByOwner: false,
      showStamp: false,
    };

    openAndPrintDevisOrInvoice(devisPayload);

    trackWhatsAppLead({
      source: 'instant_pdf_devis_checkout',
      itemName: cartItems.map((i) => i.name).join(', '),
      value: subtotal - discountAmount,
    });

    if (formData.name || formData.phone || formData.email) {
      try {
        await persistAccountAndEmail();
        await saveErpDocumentToSupabase({
          docNumber: devisNum,
          docType: 'DEVIS (À CONFIRMER)',
          clientName: formData.name || 'Client Devis PDF',
          clientCompany: [formData.company, formData.ice ? `ICE: ${formData.ice}` : '', formData.city]
            .filter(Boolean)
            .join(' | '),
          clientPhone: formData.phone || 'Non renseigné',
          clientEmail: formData.email || undefined,
          totalTtc: subtotal - discountAmount,
          itemsSummary: cartItems.map((i) => `${i.qty}x ${i.name}`).join(', '),
          totalQty: cartItems.reduce((sum, item) => sum + item.qty, 0),
          fullPayloadJson: JSON.stringify(devisPayload),
        });
      } catch {
        // non-blocking
      }
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const discountAmount = appliedPromo
    ? Math.round(subtotal * (appliedPromo / 100))
    : 0;

  // Mandatory policy: Free shipping applies strictly to orders above 2,000 DH
  const isFreeShipping = subtotal > 2000;
  const standardShipping = formData.city === 'Casablanca' ? 30 : 45;
  const shipping = isFreeShipping ? 0 : standardShipping;
  const total = subtotal - discountAmount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cityName = formData.city;
    const curr = siteConfig.currency;
    const commandId = 'GS-' + Math.floor(100000 + Math.random() * 900000);
    const slugify = (text: string) => {
      return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    // Construct WhatsApp Message
    let msg = `*Nouvelle Commande #${commandId} - ${siteConfig.brandName}*\n\n`;
    msg += `*Client:*\n`;
    msg += `Nom: ${formData.name}\n`;
    msg += `Tél: ${formData.phone}\n`;
    msg += `Ville: ${cityName}\n`;
    msg += `Adresse: ${formData.address}\n\n`;

    msg += `*Détails des articles commandés:*\n`;
    cartItems.forEach((item) => {
      const itemUrl = `https://www.gearshop.ma/product/${item.id}-${slugify(item.name)}`;
      msg += `👉 *${item.name}* (x${item.qty}) : ${item.price * item.qty} ${curr}\n   🔗 ${itemUrl}\n`;
    });
    msg += `\n`;

    msg += `Sous-total: ${subtotal} ${curr}\n`;
    if (appliedPromo) {
      msg += `Remise (${appliedPromo}%): -${discountAmount} ${curr}\n`;
    }
    msg += `Livraison: ${isFreeShipping ? 'GRATUITE (Commande > 2 000 DH)' : `${shipping} ${curr}`}\n`;
    msg += `*TOTAL FINAL: ${total} ${curr}*\n\n`;

    if (formData.message) {
      msg += `*Message du client:*\n${formData.message}\n\n`;
    }
    
    msg += `Paiement: Cash à la livraison après vérification du colis.\n`;
    msg += `Merci pour votre confiance!`;

    const phoneNum = (siteConfig.phone || '212673011873').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp synchronously in user click gesture so mobile Safari never blocks it
    window.open(waUrl, '_blank');

    // 1. Record lead / order & client account safely in Supabase
    try {
      await persistAccountAndEmail();
      const todayStr = new Date().toISOString().split('T')[0];
      const [, mm, dd] = todayStr.split('-');
      const orderPayload: ErpDocumentPayload = {
        docType: 'DEVIS',
        docNumber: commandId,
        issueDate: todayStr,
        referenceText: `COMMANDE DU ${dd}/${mm}`,
        validityDays: 30,
        clientName: formData.name,
        clientCompany: formData.company || undefined,
        clientIce: formData.ice || undefined,
        clientPhone: formData.phone,
        clientEmail: formData.email.trim().toLowerCase(),
        clientCity: cityName,
        clientAddress: formData.address,
        items: cartItems.map((item) => ({
          id: item.id,
          sku: `GS-${item.id}`,
          name: item.name,
          quantity: item.qty,
          unitPriceTtc: item.price,
        })),
        discountPercent: appliedPromo || 0,
        shippingCostTtc: shipping,
        taxMode: 'ttc_includes_20',
        isConfirmedByOwner: false,
        showStamp: false,
      };
      await saveErpDocumentToSupabase({
        docNumber: commandId,
        docType: 'COMMANDE',
        clientName: formData.name,
        clientCompany: [formData.company, cityName, formData.address].filter(Boolean).join(' — '),
        clientPhone: formData.phone,
        clientEmail: formData.email.trim().toLowerCase(),
        totalTtc: total,
        itemsSummary: cartItems.map((i) => `${i.qty}x ${i.name}`).join(', '),
        totalQty: cartItems.reduce((sum, item) => sum + item.qty, 0),
        fullPayloadJson: JSON.stringify(orderPayload),
      });
    } catch (dbErr) {
      console.warn('Database lead record non-blocking error:', dbErr);
    }

    // 2. Track Serverless Meta CAPI & Analytics
    try {
      sendMetaCapiEvent({
        eventName: 'Lead',
        value: total,
        currency: 'MAD',
        phone: formData.phone,
        email: formData.email.trim().toLowerCase(),
        customData: {
          content_name: 'WhatsApp E-commerce Order',
          content_ids: cartItems.map(i => i.id.toString()),
          content_type: 'product',
          order_id: commandId.toString(),
          lead_type: 'WhatsAppCheckout'
        }
      });
      trackWhatsAppLead({
        source: 'checkout_whatsapp_order',
        itemName: cartItems.map(item => item.name).join(', '),
        value: total,
      });
    } catch (trackErr) {
      console.error('Tracking error:', trackErr);
    }

    clearCart();
    setIsSubmitting(false);
    onSuccess();
    if (linkClientAccount) {
      navigate(`/mon-compte?ref=${encodeURIComponent(commandId)}&tel=${encodeURIComponent(formData.phone)}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] overflow-y-auto flex items-center justify-center p-4"
      aria-hidden="false"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2 text-gray-900">
          <i className="fa-solid fa-truck-fast text-red-600"></i> Finaliser la Commande
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Livraison rapide 24h/48h partout au Maroc • Paiement à la réception
        </p>

        {/* ── Reassurance Banner ─────────────────────────────────── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5 mb-4">
          <i className="fa-solid fa-shield-halved text-emerald-600 text-sm mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Garantie Sérénité :</span> Vous payez en espèces au livreur après avoir ouvert et vérifié l'état de votre colis.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nom Complet
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
              placeholder="Ex: Mohamed Alami"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Téléphone (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-sm focus:outline-none focus:border-black transition"
                placeholder="06 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email (Suivi &amp; Facture) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-sm focus:outline-none focus:border-black transition"
                placeholder="client@exemple.ma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Ville de Livraison
            </label>
            <select
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
            >
              <option value="Casablanca">Casablanca {isFreeShipping ? '(Livraison Gratuite)' : '(30 DH)'}</option>
              <option value="Rabat">Rabat {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Marrakech">Marrakech {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Tanger">Tanger {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Fès">Fès {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Agadir">Agadir {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Meknès">Meknès {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Oujda">Oujda {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Kénitra">Kénitra {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Tétouan">Tétouan {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
              <option value="Autre Ville">Autre Ville du Maroc {isFreeShipping ? '(Livraison Gratuite)' : '(45 DH)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Adresse de Livraison
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:border-black transition"
              placeholder="Quartier, N° rue, Résidence..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Société (Optionnel)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-xs focus:outline-none focus:border-black transition"
                placeholder="Nom d'entreprise"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                N° ICE (Optionnel)
              </label>
              <input
                type="text"
                value={formData.ice}
                onChange={(e) =>
                  setFormData({ ...formData, ice: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-xs font-mono focus:outline-none focus:border-black transition"
                placeholder="Pour facture / devis"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Instructions & Notes (Optionnel)
            </label>
            <textarea
              rows={1}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-black text-xs focus:outline-none focus:border-black transition"
              placeholder="Besoin de facture TVA, créneau horaire..."
            ></textarea>
          </div>

          {/* ── Order Breakdown ──────────────────────────────────── */}
          <div className="border-t border-dashed border-gray-200 pt-3.5 mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-600 font-semibold">
              <span>Articles ({cartItems.reduce((s, i) => s + i.qty, 0)})</span>
              <span>{subtotal.toLocaleString('fr-FR')} {siteConfig.currency}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>Remise appliquée</span>
                <span>-{discountAmount.toLocaleString('fr-FR')} {siteConfig.currency}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-600">Frais de livraison</span>
              {isFreeShipping ? (
                <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded text-[11px]">
                  GRATUITE (&gt; 2 000 DH)
                </span>
              ) : (
                <span className="text-gray-900">{shipping} {siteConfig.currency}</span>
              )}
            </div>

            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-100 mt-2">
              <span>Total à Payer :</span>
              <span className="text-red-600">{total.toLocaleString('fr-FR')} {siteConfig.currency}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-800 font-semibold">
              <input
                type="checkbox"
                checked={linkClientAccount}
                onChange={(e) => setLinkClientAccount(e.target.checked)}
                className="mt-0.5 accent-red-600 rounded"
              />
              <span>
                Créer / lier mon <strong>Compte Client</strong> pour suivre ma commande, mes devis et mes paiements en ligne
              </span>
            </label>
            {linkClientAccount && !savedProfile && (
              <input
                type="password"
                minLength={6}
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Mot de passe du compte (optionnel, min 6 car.)"
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-black text-xs focus:outline-none focus:border-black"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-green-600/20 flex justify-center items-center gap-2 mt-4 text-base disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Traitement...
              </>
            ) : (
              <>
                <i className="fa-brands fa-whatsapp text-xl"></i> Confirmer par WhatsApp Express
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadInstantDevis}
            className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 text-xs cursor-pointer border border-gray-800"
          >
            <i className="fa-solid fa-file-pdf text-red-500 text-sm"></i>
            <span>Télécharger un Devis PDF (À Confirmer par le Responsable)</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
