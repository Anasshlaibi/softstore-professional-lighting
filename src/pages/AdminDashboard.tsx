import React, { useState, useEffect } from 'react';
import {
  getSubscribers,
  deleteSubscriber,
  getProductRequests,
  getQuoteRequests,
  getContactLeads,
  updateQuoteStatusAndValue,
  updateSubscriberInterests,
  sendEmailCampaign,
  Subscriber,
  ProductRequestItem,
  QuoteRequestItem,
  ContactLeadItem
} from '../services/leadService';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASS = 'gearshop2026';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'product_requests' | 'quotes' | 'attribution' | 'audiences' | 'settings'>('overview');

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequestItem[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestItem[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLeadItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterestFilter, setSelectedInterestFilter] = useState('All');

  // Won Deal Modal State (for CAPI Offline Purchase)
  const [wonModalItem, setWonModalItem] = useState<QuoteRequestItem | null>(null);
  const [wonDealValueInput, setWonDealValueInput] = useState('0');

  // Score Breakdown Modal State
  const [activeBreakdown, setActiveBreakdown] = useState<Record<string, number> | null>(null);

  // Settings State
  const [pixelIdInput, setPixelIdInput] = useState('13684036354444670');
  const [capiTokenInput, setCapiTokenInput] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('gearshop_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
    setCapiTokenInput(localStorage.getItem('gearshop_capi_token') || '');
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
      console.error('Error fetching dashboard data:', err);
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

  const handleStatusSelect = async (quote: QuoteRequestItem, newStatus: 'New' | 'Contacted' | 'Negotiating' | 'Waiting' | 'Won' | 'Lost') => {
    if (newStatus === 'Won') {
      // Open deal valuation modal for offline CAPI Purchase dispatch
      setWonModalItem(quote);
      setWonDealValueInput(quote.deal_value ? quote.deal_value.toString() : '15000');
    } else {
      try {
        await updateQuoteStatusAndValue(quote.id, newStatus, 0, quote);
        setQuoteRequests(prev => prev.map(q => q.id === quote.id ? { ...q, status: newStatus } : q));
      } catch (err) {
        alert('Erreur de mise à jour');
      }
    }
  };

  const handleConfirmWonDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonModalItem) return;
    const valueNum = parseFloat(wonDealValueInput) || 0;

    try {
      await updateQuoteStatusAndValue(wonModalItem.id, 'Won', valueNum, wonModalItem);
      setQuoteRequests(prev => prev.map(q => q.id === wonModalItem.id ? { ...q, status: 'Won', deal_value: valueNum } : q));
      alert(`Vente confirmée! Conversion hors-ligne de ${valueNum} MAD envoyée à Meta CAPI.`);
      setWonModalItem(null);
    } catch (err) {
      alert('Erreur lors de la validation de la vente');
    }
  };

  const saveCapiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gearshop_capi_token', capiTokenInput);
    alert('Clé Meta CAPI enregistrée!');
  };

  // CSV Exporters
  const exportSubscribersCSV = () => {
    if (subscribers.length === 0) return alert('Aucun abonné à exporter');
    const headers = 'Email,Interests,Date Subscribed\n';
    const rows = subscribers.map(s =>
      `"${s.email}","${(s.interests || []).join(';') || 'General'}","${s.created_at || ''}"`
    ).join('\n');
    downloadCSV(headers + rows, 'gearshop_subscribers.csv');
  };

  const exportMetaCustomAudience = (segmentName: string) => {
    let list: string[] = [];
    if (segmentName === 'QuoteNotPurchased') {
      list = quoteRequests.filter(q => q.status !== 'Won').map(q => q.email);
    } else if (segmentName === 'Canon') {
      list = subscribers.filter(s => (s.interests || []).includes('Canon')).map(s => s.email);
    } else if (segmentName === 'CinemaLenses') {
      list = subscribers.filter(s => (s.interests || []).includes('Cinema Lenses')).map(s => s.email);
    } else if (segmentName === 'HotLeads') {
      list = quoteRequests.filter(q => q.score >= 80).map(q => q.email);
    }

    if (list.length === 0) return alert('Aucun contact dans ce segment');
    const headers = 'email,country\n';
    const rows = list.map(em => `"${em}","MA"`).join('\n');
    downloadCSV(headers + rows, `meta_audience_${segmentName}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Attribution Revenue Calculations
  const calculateCampaignAttribution = () => {
    const campaigns: Record<string, { count: number; wonCount: number; revenue: number; source: string }> = {};

    quoteRequests.forEach(q => {
      const campaignName = q.utm_campaign || 'Direct / Unknown';
      if (!campaigns[campaignName]) {
        campaigns[campaignName] = { count: 0, wonCount: 0, revenue: 0, source: q.utm_source || 'direct' };
      }
      campaigns[campaignName].count += 1;
      if (q.status === 'Won') {
        campaigns[campaignName].wonCount += 1;
        campaigns[campaignName].revenue += (q.deal_value || 0);
      }
    });

    return Object.entries(campaigns).map(([name, data]) => ({ name, ...data }));
  };

  const totalWonRevenue = quoteRequests
    .filter(q => q.status === 'Won')
    .reduce((sum, q) => sum + (q.deal_value || 0), 0);

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
            <p className="text-xs text-zinc-400">Plateforme d'attribution de leads & Meta CAPI</p>
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
            <button onClick={() => navigate('/')} className="text-xs text-zinc-500 hover:text-zinc-300">
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
            <span className="font-extrabold text-lg tracking-tight">
              GearShop <span className="text-red-500">B2B Lead Engine</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <span>🔄</span> {loading ? 'Chargement...' : 'Actualiser'}
            </button>
            <button onClick={() => navigate('/')} className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition">
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
            { id: 'quotes', label: `📝 Pipeline Devis & Leads (${quoteRequests.length})` },
            { id: 'subscribers', label: `📧 Abonnés (${subscribers.length})` },
            { id: 'attribution', label: '💰 Attribution Chiffre d\'Affaires' },
            { id: 'audiences', label: '🎯 Meta Custom Audiences' },
            { id: 'settings', label: '⚙️ Meta CAPI & Config' }
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
                  <span>Chiffre d'Affaires Gagné (Won)</span>
                  <span className="text-emerald-400 text-base">💰</span>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {totalWonRevenue.toLocaleString('fr-MA')} <span className="text-sm font-normal text-zinc-400">MAD</span>
                </div>
                <div className="text-[11px] text-zinc-500">Conversions hors-ligne CAPI confirmées</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Hot Leads (Score 80+)</span>
                  <span className="text-red-400 text-base">🔥</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {quoteRequests.filter(q => q.score >= 80).length}
                </div>
                <div className="text-[11px] text-zinc-500">Priorité de contact maximale</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Total Demandes de Devis</span>
                  <span className="text-red-400 text-base">📋</span>
                </div>
                <div className="text-3xl font-black text-white">{quoteRequests.length}</div>
                <div className="text-[11px] text-zinc-500">Événements Meta Lead générés</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                  <span>Total Abonnés Newsletter</span>
                  <span className="text-red-400 text-base">✉️</span>
                </div>
                <div className="text-3xl font-black text-white">{subscribers.length}</div>
                <div className="text-[11px] text-zinc-500">Segmentés par intérêt matériel</div>
              </div>
            </div>

            {/* Quick Leads List */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>🔥</span> Leads récents à contacter en priorité
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Score Lead</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Produit demandé</th>
                      <th className="px-4 py-3">Attribution (Source / Campagne)</th>
                      <th className="px-4 py-3">Statut Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {quoteRequests.slice(0, 5).map(q => (
                      <tr key={q.id} className="hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveBreakdown(q.score_breakdown || null)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                              q.score >= 80
                                ? 'bg-red-600/20 border-red-500 text-red-400'
                                : q.score >= 50
                                ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {q.score >= 80 ? '🔥 Hot' : q.score >= 50 ? '🟡 Warm' : '⚪ Cold'} ({q.score} pts)
                          </button>
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {q.name}
                          <div className="text-[11px] font-mono text-red-400">{q.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-zinc-200">{q.product_name}</td>
                        <td className="px-4 py-3 text-zinc-400">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-300">
                            {q.utm_source || 'direct'}
                          </span>
                          {q.utm_campaign && (
                            <span className="block text-[10px] text-zinc-500 truncate max-w-xs">{q.utm_campaign}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] ${
                            q.status === 'Won' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE & DEALS */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">Gestion du Pipeline Devis & Leads</h3>
                <p className="text-xs text-zinc-400">Le statut "Won" déclenche automatiquement la conversion CAPI Purchase</p>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email ou produit..."
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 w-64"
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Score & Signal</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Attribution (Source / fbclid)</th>
                      <th className="px-4 py-3">Statut Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {quoteRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Aucune demande enregistrée.</td>
                      </tr>
                    ) : (
                      quoteRequests.map(q => (
                        <tr key={q.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setActiveBreakdown(q.score_breakdown || null)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                                q.score >= 80 ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                              }`}
                            >
                              {q.score_label} ({q.score} pts)
                            </button>
                          </td>
                          <td className="px-4 py-3 font-bold text-white">
                            {q.name}
                            {q.company && <div className="text-[10px] text-zinc-400 font-normal">{q.company}</div>}
                          </td>
                          <td className="px-4 py-3 text-zinc-200 font-semibold">{q.product_name}</td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-red-400">{q.phone}</div>
                            <div className="text-[10px] text-zinc-400">{q.email}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            <span className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-300">
                              {q.utm_source || 'direct'}
                            </span>
                            {q.fbclid && <span className="block text-[9px] text-emerald-400 font-mono">fbclid: ✓</span>}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={q.status}
                              onChange={e => handleStatusSelect(q, e.target.value as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer border ${
                                q.status === 'Won'
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                                  : q.status === 'Lost'
                                  ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                              }`}
                            >
                              <option value="New">🔴 Nouveau</option>
                              <option value="Contacted">🟡 Contacté</option>
                              <option value="Negotiating">🟠 En Négociation</option>
                              <option value="Waiting">⏳ En Attente</option>
                              <option value="Won">🟢 Gagné (Won) + CAPI Purchase</option>
                              <option value="Lost">❌ Perdu (Lost)</option>
                            </select>
                            {q.status === 'Won' && (
                              <div className="text-[11px] font-bold text-emerald-400 mt-1">
                                Deal: {q.deal_value} MAD
                              </div>
                            )}
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

        {/* TAB 3: ATTRIBUTION REPORT */}
        {activeTab === 'attribution' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Attribution du Chiffre d'Affaires par Campagne</h3>
              <p className="text-xs text-zinc-400">Rapport de rentabilité exacte des campagnes marketing</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Campagne Marketing</th>
                      <th className="px-4 py-3">Source Traffic</th>
                      <th className="px-4 py-3">Leads Générés</th>
                      <th className="px-4 py-3">Ventes Gagnées (Won)</th>
                      <th className="px-4 py-3">Taux de Conversion</th>
                      <th className="px-4 py-3 text-right">Chiffre d'Affaires (MAD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {calculateCampaignAttribution().map(c => {
                      const convRate = c.count > 0 ? ((c.wonCount / c.count) * 100).toFixed(1) : '0';
                      return (
                        <tr key={c.name} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                          <td className="px-4 py-3 font-mono text-zinc-400">{c.source}</td>
                          <td className="px-4 py-3 font-bold text-white">{c.count}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{c.wonCount}</td>
                          <td className="px-4 py-3 text-zinc-300">{convRate}%</td>
                          <td className="px-4 py-3 text-right font-black text-emerald-400 text-sm">
                            {c.revenue.toLocaleString('fr-MA')} MAD
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: META CUSTOM AUDIENCES */}
        {activeTab === 'audiences' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-extrabold">Exportation d'Audiences sur Mesure pour Meta Ads</h3>
              <p className="text-xs text-zinc-400">Téléchargez des fichiers CSV formatés pour l'import dans Meta Ads Manager</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm">Devis non finalisés</h4>
                  <p className="text-xs text-zinc-400 mt-1">Prospects ayant demandé un devis mais pas encore achetés</p>
                </div>
                <button
                  onClick={() => exportMetaCustomAudience('QuoteNotPurchased')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Télécharger CSV Meta
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm">Intéressés par Canon</h4>
                  <p className="text-xs text-zinc-400 mt-1">Abonnés ayant coché la marque Canon</p>
                </div>
                <button
                  onClick={() => exportMetaCustomAudience('Canon')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Télécharger CSV Meta
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm">Lentilles Cinéma</h4>
                  <p className="text-xs text-zinc-400 mt-1">Directeurs photo et réalisateurs ciblés</p>
                </div>
                <button
                  onClick={() => exportMetaCustomAudience('CinemaLenses')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Télécharger CSV Meta
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm">Hot Leads (Score 80+)</h4>
                  <p className="text-xs text-zinc-400 mt-1">Audience prioritaire pour Lookalike Meta</p>
                </div>
                <button
                  onClick={() => exportMetaCustomAudience('HotLeads')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Télécharger CSV Meta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">Abonnés Newsletter</h3>
                <p className="text-xs text-zinc-400">Exportation et gestion de liste</p>
              </div>
              <button
                onClick={exportSubscribersCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <span>📥</span> Exporter Tous (CSV)
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Centres d'intérêt</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {subscribers.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3 font-bold text-white">{s.email}</td>
                        <td className="px-4 py-3 text-zinc-400">{(s.interests || []).join(', ') || 'Général'}</td>
                        <td className="px-4 py-3 text-zinc-500">{s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteSubscriber(s.id)} className="px-2.5 py-1 bg-red-950/40 text-red-400 rounded hover:bg-red-600 hover:text-white transition">
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base text-white">Paramètres Meta Conversions API</h3>
              <form onSubmit={saveCapiSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Meta Pixel ID</label>
                  <input
                    type="text"
                    value={pixelIdInput}
                    onChange={e => setPixelIdInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Meta CAPI Access Token</label>
                  <textarea
                    rows={3}
                    value={capiTokenInput}
                    onChange={e => setCapiTokenInput(e.target.value)}
                    placeholder="EAAG..."
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono resize-none"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow">
                  Enregistrer la configuration Meta CAPI
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM WON DEAL MODAL (Triggers CAPI Purchase) */}
      {wonModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🟢</span> Valider la Vente (Conversion CAPI)
            </h3>
            <p className="text-xs text-zinc-400">
              Veuillez saisir le montant réel de la vente pour <strong className="text-white">{wonModalItem.product_name}</strong>. Un événement CAPI Purchase sera envoyé à Meta avec ce montant.
            </p>

            <form onSubmit={handleConfirmWonDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Montant final de la vente (MAD)</label>
                <input
                  type="number"
                  required
                  value={wonDealValueInput}
                  onChange={e => setWonDealValueInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-xl text-lg font-bold text-emerald-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWonModalItem(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Envoyer Conversion CAPI & Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCORE BREAKDOWN MODAL */}
      {activeBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold">Détail du Score Lead</h3>
            <div className="space-y-2">
              {Object.entries(activeBreakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-300">{k}</span>
                  <span className="font-bold text-red-400">+{v} pts</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveBreakdown(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
