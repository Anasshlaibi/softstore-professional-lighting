import React, { useState, useEffect } from 'react';
import {
  getSubscribers,
  deleteSubscriber,
  getProductRequests,
  getQuoteRequests,
  getContactLeads,
  updateContactLeadStatus,
  sendEmailCampaign,
  Subscriber,
  ProductRequestItem,
  QuoteRequestItem,
  ContactLeadItem
} from '../services/leadService';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASS = 'gearshop2026'; // Default admin password

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'product_requests' | 'quotes' | 'leads' | 'campaigns'>('overview');

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequestItem[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestItem[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLeadItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterestFilter, setSelectedInterestFilter] = useState('All');

  // Campaign state
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignSegment, setCampaignSegment] = useState('All');
  const [campaignType, setCampaignType] = useState('Promotions');
  const [campaignBody, setCampaignBody] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('gearshop_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASS || passwordInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gearshop_admin_auth', 'true');
      setAuthError(false);
      fetchData();
    } else {
      setAuthError(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, reqs, quotes, leads] = await Promise.all([
        getSubscribers().catch(() => []),
        getProductRequests().catch(() => []),
        getQuoteRequests().catch(() => []),
        getContactLeads().catch(() => [])
      ]);
      setSubscribers(subs);
      setProductRequests(reqs);
      setQuoteRequests(quotes);
      setContactLeads(leads);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet abonné?')) return;
    try {
      await deleteSubscriber(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (id: number, status: 'New' | 'Contacted' | 'Closed') => {
    try {
      await updateContactLeadStatus(id, status);
      setContactLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const exportSubscribersCSV = () => {
    if (subscribers.length === 0) return alert('Aucun abonné à exporter');
    const headers = 'ID,Email,Interests,Date Subscribed\n';
    const rows = subscribers.map(s =>
      `"${s.id}","${s.email}","${(s.interests || []).join(';') || 'General'}","${s.created_at || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gearshop_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject || !campaignBody) return alert('Veuillez remplir le sujet et le contenu');

    setLoading(true);
    setCampaignStatus(null);
    try {
      const res = await sendEmailCampaign({
        subject: campaignSubject,
        segment: campaignSegment,
        type: campaignType,
        body: campaignBody,
        resendApiKey
      });
      setCampaignStatus(res.message);
      setCampaignSubject('');
      setCampaignBody('');
    } catch (err: any) {
      setCampaignStatus(`Erreur: ${err?.message || 'Impossible d\'envoyer'}`);
    } finally {
      setLoading(false);
    }
  };

  // Analytics helper for Top Requested Products & Brands
  const getTopProducts = () => {
    const counts: Record<string, number> = {};
    productRequests.forEach(r => {
      const key = r.product_name.trim().toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const getTopBrands = () => {
    const counts: Record<string, number> = {};
    productRequests.forEach(r => {
      if (r.brand) {
        const key = r.brand.trim().toUpperCase();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  // Auth Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-red-500/30">
              🔒
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">GearShop Admin Panel</h1>
            <p className="text-xs text-zinc-400">Espace d'administration réservé pour la gestion des leads</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Mot de passe Administrateur</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Entrez le mot de passe..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white outline-none"
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs font-medium">Mot de passe incorrect. Essayez `gearshop2026`.</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 font-bold text-sm text-white rounded-xl shadow-lg shadow-red-950/50 transition"
            >
              Se Connecter
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              ← Retour au site public
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInterest = selectedInterestFilter === 'All' || (s.interests || []).includes(selectedInterestFilter);
    return matchesSearch && matchesInterest;
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              GS
            </span>
            <span className="font-extrabold text-lg tracking-tight">GearShop <span className="text-red-500">Marketing Hub</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg text-xs flex items-center gap-1.5 transition"
              title="Rafraîchir les données"
            >
              <span>🔄</span> {loading ? 'Chargement...' : 'Actualiser'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition"
            >
              Voir le Site
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('gearshop_admin_auth');
                setIsAuthenticated(false);
              }}
              className="px-3.5 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white text-xs font-semibold rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800 scrollbar-none">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble' },
            { id: 'subscribers', label: `📧 Abonnés (${subscribers.length})` },
            { id: 'product_requests', label: `📦 Demandes Produits (${productRequests.length})` },
            { id: 'quotes', label: `📝 Devis (${quoteRequests.length})` },
            { id: 'leads', label: `📞 Contacts Leads (${contactLeads.length})` },
            { id: 'campaigns', label: '🚀 Campagnes Resend' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Total Abonnés Newsletter</span>
                  <span className="text-red-400 text-base">✉️</span>
                </div>
                <div className="text-3xl font-black text-white">{subscribers.length}</div>
                <div className="text-[11px] text-zinc-500">Collectés via le site & popups</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Demandes de Matériel</span>
                  <span className="text-red-400 text-base">📦</span>
                </div>
                <div className="text-3xl font-black text-white">{productRequests.length}</div>
                <div className="text-[11px] text-zinc-500">Intention d'achat explicite</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Demandes de Devis Pro</span>
                  <span className="text-red-400 text-base">📋</span>
                </div>
                <div className="text-3xl font-black text-white">{quoteRequests.length}</div>
                <div className="text-[11px] text-zinc-500">Grosses commandes & studios</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Leads Formulaire Contact</span>
                  <span className="text-red-400 text-base">📞</span>
                </div>
                <div className="text-3xl font-black text-white">{contactLeads.length}</div>
                <div className="text-[11px] text-zinc-500">Missions & prospects</div>
              </div>
            </div>

            {/* Demand Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>🔥</span> Matériels les plus demandés
                  </h3>
                  <span className="text-xs text-zinc-500">Analyse des requêtes</span>
                </div>

                {getTopProducts().length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">Aucune demande de produit enregistrée pour l'instant.</p>
                ) : (
                  <div className="space-y-3">
                    {getTopProducts().map(([name, count], i) => (
                      <div key={name} className="flex items-center justify-between text-xs bg-zinc-800/50 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-zinc-200 capitalize">{name}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-red-600/20 text-red-400 font-bold rounded-lg text-[11px]">
                          {count} demande{count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>🏷️</span> Marques les plus recherchées
                  </h3>
                  <span className="text-xs text-zinc-500">Tendances d'importation</span>
                </div>

                {getTopBrands().length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">Aucune marque spécifique mentionnée.</p>
                ) : (
                  <div className="space-y-3">
                    {getTopBrands().map(([brand, count], i) => (
                      <div key={brand} className="flex items-center justify-between text-xs bg-zinc-800/50 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-zinc-200">{brand}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold rounded-lg text-[11px]">
                          {count} recherche{count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">Liste des Abonnés Newsletter</h3>
                <p className="text-xs text-zinc-400">Segmentés par intérêts pour ciblage Resend</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par email..."
                  className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 w-64"
                />
                <button
                  onClick={exportSubscribersCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>📥</span> Exporter CSV
                </button>
              </div>
            </div>

            {/* Interest Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', 'Canon', 'Sony', 'Nikon', 'Cinema Lenses', 'Lighting', 'Audio', 'Drones', 'Accessories'].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedInterestFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                    selectedInterestFilter === f
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Centres d'intérêt</th>
                      <th className="px-4 py-3">Date d'inscription</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          Aucun abonné trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map(sub => (
                        <tr key={sub.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-mono text-zinc-500">#{sub.id}</td>
                          <td className="px-4 py-3 font-bold text-white">{sub.email}</td>
                          <td className="px-4 py-3">
                            {sub.interests && sub.interests.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {sub.interests.map(i => (
                                  <span key={i} className="px-2 py-0.5 bg-red-950/60 border border-red-800/50 text-red-300 rounded-md text-[10px]">
                                    {i}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">Général</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition text-[11px]"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT REQUESTS */}
        {activeTab === 'product_requests' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Demandes de Matériel Introuvable</h3>
              <p className="text-xs text-zinc-400">Demandes de clients cherchant du matériel non listé</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Produit demandé</th>
                      <th className="px-4 py-3">Marque</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Client Email</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {productRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                          Aucune demande enregistrée.
                        </td>
                      </tr>
                    ) : (
                      productRequests.map(r => (
                        <tr key={r.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-bold text-white">{r.product_name}</td>
                          <td className="px-4 py-3 text-red-400 font-semibold">{r.brand || '—'}</td>
                          <td className="px-4 py-3 font-mono text-zinc-300">{r.budget || '—'}</td>
                          <td className="px-4 py-3 text-zinc-200">{r.email}</td>
                          <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{r.notes || '—'}</td>
                          <td className="px-4 py-3 text-zinc-500">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUOTE REQUESTS */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Demandes de Devis Studio & Pro</h3>
              <p className="text-xs text-zinc-400">Demandes de devis personnalisés avec coordonnées complètes</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Société</th>
                      <th className="px-4 py-3">Qté</th>
                      <th className="px-4 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {quoteRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                          Aucune demande de devis enregistrée.
                        </td>
                      </tr>
                    ) : (
                      quoteRequests.map(q => (
                        <tr key={q.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-bold text-white">{q.product_name}</td>
                          <td className="px-4 py-3 font-semibold text-zinc-200">{q.name}</td>
                          <td className="px-4 py-3 text-red-400 font-mono">{q.phone}</td>
                          <td className="px-4 py-3 text-zinc-300">{q.email}</td>
                          <td className="px-4 py-3 text-zinc-400">{q.company || '—'}</td>
                          <td className="px-4 py-3 font-bold text-white">{q.quantity}</td>
                          <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{q.message || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Pipeline des Contacts & Prospect Leads</h3>
              <p className="text-xs text-zinc-400">Gestion de statut (Nouveau, Contacté, Conclu)</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Statut Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {contactLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          Aucun lead de contact enregistré.
                        </td>
                      </tr>
                    ) : (
                      contactLeads.map(l => (
                        <tr key={l.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-bold text-white">{l.name}</td>
                          <td className="px-4 py-3 text-zinc-300">{l.email}</td>
                          <td className="px-4 py-3 text-zinc-400 font-mono">{l.phone || '—'}</td>
                          <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{l.message || '—'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={l.status}
                              onChange={e => handleStatusChange(l.id, e.target.value as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer border ${
                                l.status === 'New'
                                  ? 'bg-red-950/60 border-red-600 text-red-300'
                                  : l.status === 'Contacted'
                                  ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                                  : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                              }`}
                            >
                              <option value="New">🔴 Nouveau</option>
                              <option value="Contacted">🟡 Contacté</option>
                              <option value="Closed">🟢 Conclu</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EMAIL CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Gestionnaire de Campagnes Resend</h3>
              <p className="text-xs text-zinc-400">Envoyez des emails ciblés par centres d'intérêt</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <form onSubmit={handleSendCampaign} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Sujet de l'email</label>
                    <input
                      type="text"
                      required
                      value={campaignSubject}
                      onChange={e => setCampaignSubject(e.target.value)}
                      placeholder="ex: 🔥 Arrivage 7Artisans 35mm T2.0 disponible à Casa!"
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-sm text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Segment Ciblé</label>
                      <select
                        value={campaignSegment}
                        onChange={e => setCampaignSegment(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white outline-none"
                      >
                        <option value="All">Tous les abonnés ({subscribers.length})</option>
                        <option value="Canon">Abonnés intéressés par Canon</option>
                        <option value="Sony">Abonnés intéressés par Sony</option>
                        <option value="Nikon">Abonnés intéressés par Nikon</option>
                        <option value="Cinema Lenses">Abonnés Lentilles Cinéma</option>
                        <option value="Lighting">Abonnés Éclairage Studio</option>
                        <option value="Drones">Abonnés Drones DJI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Type de Campagne</label>
                      <select
                        value={campaignType}
                        onChange={e => setCampaignType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white outline-none"
                      >
                        <option value="Promotions">Promotion / Solde</option>
                        <option value="New arrivals">Nouveaux arrivages</option>
                        <option value="Back in stock">Retour en Stock</option>
                        <option value="New products">Lancement Produit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Contenu de l'email (HTML ou Texte)</label>
                    <textarea
                      rows={6}
                      required
                      value={campaignBody}
                      onChange={e => setCampaignBody(e.target.value)}
                      placeholder="Bonjour, Nous avons le plaisir de vous informer que les nouveaux objectifs sont arrivés..."
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-xs text-white outline-none font-mono resize-none"
                    />
                  </div>

                  {campaignStatus && (
                    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200">
                      {campaignStatus}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center gap-2"
                    >
                      <span>🚀</span>
                      <span>{loading ? 'Envoi...' : 'Enregistrer & Envoyer'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Resend Config info */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>⚙️</span> Clé API Resend
                </h4>
                <p className="text-xs text-zinc-400">
                  Saisissez votre clé API Resend pour activer l'envoi d'emails automatiques.
                </p>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={e => setResendApiKey(e.target.value)}
                  placeholder="re_123456789..."
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white outline-none font-mono"
                />
                <p className="text-[11px] text-zinc-500">
                  Ou configurez <code className="text-red-400">VITE_RESEND_API_KEY</code> dans votre fichier <code className="text-zinc-400">.env.local</code> ou sur Vercel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
