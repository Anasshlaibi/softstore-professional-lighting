import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { lookupClientOrdersInSupabase, QuoteRequestItem } from '../services/leadService';
import { openAndPrintDevisOrInvoice, ErpDocumentPayload } from '../utils/devisInvoiceGenerator';

const ORDER_STEPS = [
  {
    status: 'New',
    step: 1,
    title: 'Commande / Devis Enregistré',
    desc: 'Votre demande ou devis officiel a été créé dans notre système.',
    icon: 'fa-file-signature',
  },
  {
    status: 'Contacted',
    step: 2,
    title: 'Validation & Confirmation',
    desc: 'Votre commande a été confirmée par notre conseiller commercial.',
    icon: 'fa-phone-volume',
  },
  {
    status: 'Negotiating',
    step: 3,
    title: 'En Préparation (Showroom Casablanca)',
    desc: 'Contrôle qualité, test et emballage sécurisé de votre matériel.',
    icon: 'fa-box-open',
  },
  {
    status: 'Waiting',
    step: 4,
    title: 'En Cours de Livraison Express',
    desc: 'Expédié via transporteur express (24h-48h) vers votre ville.',
    icon: 'fa-truck-fast',
  },
  {
    status: 'Won',
    step: 5,
    title: 'Livré & Garantie 1 An Active',
    desc: 'Commande livrée avec succès. Votre garantie officielle est active.',
    icon: 'fa-circle-check',
  },
];

function getStepNumber(status: string): number {
  switch (status) {
    case 'New':
      return 1;
    case 'Contacted':
      return 2;
    case 'Negotiating':
      return 3;
    case 'Waiting':
      return 4;
    case 'Won':
      return 5;
    case 'Lost':
      return -1;
    default:
      return 1;
  }
}

export const ClientOrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialTel = searchParams.get('tel') || '';

  const [mode, setMode] = useState<'lookup' | 'account'>('lookup');

  // Lookup state
  const [phoneInput, setPhoneInput] = useState<string>(initialTel);
  const [refInput, setRefInput] = useState<string>(initialRef);
  const [orders, setOrders] = useState<QuoteRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchedOnce, setSearchedOnce] = useState<boolean>(false);

  // Supabase Auth Client Account state
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authPhoneInput, setAuthPhoneInput] = useState<string>('');
  const [authNameInput, setAuthNameInput] = useState<string>('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const runSearch = async (phone?: string, ref?: string, email?: string) => {
    setLoading(true);
    setSearchedOnce(true);
    try {
      const results = await lookupClientOrdersInSupabase({
        phone: phone ?? phoneInput,
        ref: ref ?? refInput,
        email,
      });
      setOrders(results);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run if URL has ?ref= or ?tel=
  useEffect(() => {
    if (initialRef || initialTel) {
      runSearch(initialTel, initialRef);
    }
  }, [initialRef, initialTel]);

  // Check active Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setAuthUserEmail(session.user.email);
        const savedPhone = session.user.user_metadata?.phone || '';
        runSearch(savedPhone, '', session.user.email);
      }
    });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: emailInput.trim(),
          password: passwordInput,
          options: {
            data: {
              full_name: authNameInput.trim(),
              phone: authPhoneInput.trim(),
            },
          },
        });
        if (error) throw error;
        if (data.user?.email) {
          setAuthUserEmail(data.user.email);
          setAuthMessage('Compte créé avec succès ! Voici vos commandes et devis associés.');
          await runSearch(authPhoneInput, '', data.user.email);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.trim(),
          password: passwordInput,
        });
        if (error) throw error;
        if (data.user?.email) {
          setAuthUserEmail(data.user.email);
          const metaPhone = data.user.user_metadata?.phone || '';
          await runSearch(metaPhone, '', data.user.email);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOrderPdf = (order: QuoteRequestItem) => {
    // Check if order.message contains ||ERP_JSON||
    const rawMsg = order.message || '';
    if (rawMsg.includes('||ERP_JSON||')) {
      try {
        const jsonPart = rawMsg.split('||ERP_JSON||')[1];
        const parsed: ErpDocumentPayload = JSON.parse(jsonPart);
        openAndPrintDevisOrInvoice(parsed);
        return;
      } catch {
        // fallback below
      }
    }

    // Fallback: Build a clean VERDANOVE Devis PDF from the order fields
    const refMatch = (order.product_name + ' ' + rawMsg).match(/\b(FA26\d+|DEV-[\w-]+|GS-\d+)\b/i);
    const docNum = refMatch ? refMatch[1] : `FA26${String(order.id).padStart(5, '0')}`;
    const issueDate = (order.created_at || new Date().toISOString()).split('T')[0];

    openAndPrintDevisOrInvoice({
      docType: 'DEVIS',
      docNumber: docNum,
      issueDate,
      clientName: order.name || 'Client',
      clientCompany: order.company || undefined,
      clientPhone: order.phone || undefined,
      clientEmail: order.email || undefined,
      items: [
        {
          sku: `GS-${order.id}`,
          name: order.product_name.replace(/^\[.*?\]\s*/, ''),
          quantity: order.quantity || 1,
          unitPriceTtc: order.deal_value > 0 ? Math.round(order.deal_value / 1.2) : 1500,
        },
      ],
      taxMode: 'ht_plus_20',
      showStamp: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
          <div>
            <Link
              to="/"
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 mb-2"
            >
              <i className="fa-solid fa-arrow-left" /> Retour à la boutique GearShop.ma
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              📦 Espace Client & Suivi de Commande / Devis
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Suivez l'état d'avancement de votre commande ou téléchargez votre Devis Officiel VERDANOVE en temps réel.
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0 self-start">
            <button
              type="button"
              onClick={() => setMode('lookup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'lookup' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              🔍 Suivi Rapide
            </button>
            <button
              type="button"
              onClick={() => setMode('account')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'account' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              👤 {authUserEmail ? 'Mon Compte' : 'Connexion / Compte'}
            </button>
          </div>
        </div>

        {/* Mode 1: Quick Lookup by Phone or Order/Devis Reference */}
        {mode === 'lookup' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  📱 Votre Numéro de Téléphone (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ex: 06 61 15 09 61"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  📄 Ou N° de Devis / Commande (Optionnel)
                </label>
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Ex: FA2600330 ou GS-..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 transition cursor-pointer"
            >
              {loading ? 'Recherche en cours...' : '🔍 Rechercher ma Commande / mon Devis'}
            </button>
          </form>
        )}

        {/* Mode 2: Client Account Login / Register */}
        {mode === 'account' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
            {authUserEmail ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold mb-1">
                    ✓ Connecté à votre Espace Client
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900">{authUserEmail}</h3>
                  <p className="text-xs text-gray-500">
                    Retrouvez ci-dessous l'historique complet de vos devis et commandes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setAuthUserEmail(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900">
                    {authMode === 'login' ? 'Connexion Compte Client' : 'Créer un Compte Client'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    {authMode === 'login' ? 'Créer un compte ➔' : 'Déjà inscrit ? Se connecter'}
                  </button>
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nom Complet ou Société
                      </label>
                      <input
                        type="text"
                        required
                        value={authNameInput}
                        onChange={(e) => setAuthNameInput(e.target.value)}
                        placeholder="Ex: Aya Toraif / Studio Prod"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Numéro de Téléphone (pour lier vos commandes)
                      </label>
                      <input
                        type="tel"
                        required
                        value={authPhoneInput}
                        onChange={(e) => setAuthPhoneInput(e.target.value)}
                        placeholder="06 XX XX XX XX"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="client@exemple.ma"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                {authError && <p className="text-xs text-red-600 font-semibold">{authError}</p>}
                {authMessage && <p className="text-xs text-emerald-600 font-semibold">{authMessage}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  {authMode === 'login' ? 'Accéder à mes commandes' : 'Créer mon compte client'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Results Section */}
        {searchedOnce && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-2">
                <div className="text-3xl">🔎</div>
                <h3 className="text-base font-bold text-gray-900">
                  Aucune commande ou devis trouvé pour ces informations
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Vérifiez votre numéro de téléphone (ex: 06...) ou votre numéro de référence (ex: FA26...), ou contactez notre service client sur WhatsApp au +212 673 011 873.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const currentStep = getStepNumber(order.status);
                const dateFormatted = new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-6"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-black font-mono">
                            Réf #{order.id}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Créé le {dateFormatted}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mt-1.5">
                          {order.product_name.replace(/\|\|ERP_JSON\|\|.*$/, '')}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Client : <strong>{order.name}</strong>{' '}
                          {order.company ? `(${order.company})` : ''} • Tél : {order.phone}
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {order.deal_value > 0 && (
                          <div className="text-lg font-black text-gray-900 font-mono">
                            {order.deal_value.toLocaleString('fr-FR')} DH TTC
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadOrderPdf(order)}
                            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <i className="fa-solid fa-file-pdf text-red-500" />
                            <span>Télécharger Devis / Facture PDF</span>
                          </button>
                          <a
                            href={`https://wa.me/212673011873?text=${encodeURIComponent(
                              `Bonjour GearShop / Verdanove, je souhaite suivre ma commande / mon devis Réf #${order.id} (${order.name}).`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <i className="fa-brands fa-whatsapp" />
                            <span>Assistance WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 5-Step Progress Tracker */}
                    {currentStep === -1 ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
                        ❌ Ce dossier / devis est marqué comme annulé ou expiré. Contactez-nous sur WhatsApp pour le réactiver.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                        {ORDER_STEPS.map((st) => {
                          const isCompleted = currentStep >= st.step;
                          const isCurrent = currentStep === st.step;
                          return (
                            <div
                              key={st.step}
                              className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                                isCurrent
                                  ? 'bg-red-50/70 border-red-500 shadow-sm'
                                  : isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-300'
                                  : 'bg-gray-50 border-gray-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                                    isCurrent
                                      ? 'bg-red-600 text-white'
                                      : isCompleted
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {isCompleted && !isCurrent ? '✓' : st.step}
                                </span>
                                <i
                                  className={`fa-solid ${st.icon} text-sm ${
                                    isCurrent
                                      ? 'text-red-600'
                                      : isCompleted
                                      ? 'text-emerald-600'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-gray-900 leading-snug">
                                  {st.title}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                  {st.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrderTrackingPage;
