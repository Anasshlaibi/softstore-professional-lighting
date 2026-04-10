import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search,
  MessageCircle,
  Trash2,
  TrendingUp,
  CreditCard,
  Activity,
  ShoppingCart,
  Map as MapIcon,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Monitor,
  Share2,
  ListTodo,
  Zap,
  Globe,
  Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { cn } from '../src/utils/cn';
import { adminSupabase } from '../src/utils/supabase';
import { Product } from '../App';

// --- TYPES ---
interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  items: { name: string; qty: number; price: number; category?: string }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

interface Session {
    id: string;
    session_id: string;
    city: string;
    source: string;
    created_at: string;
}

interface Click {
    x_percent: number;
    y_percent: number;
    element_tag: string;
    session_id?: string;
}

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

const Dashboard: React.FC<DashboardProps> = ({ onClose, realLiveCount, products }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'live' | 'heatmaps' | 'inventory' | 'admin'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [visitorHistory, setVisitorHistory] = useState<{ time: string, count: number }[]>([]);

  // 1. LIVE VISITOR HISTORY (Sparkline)
  useEffect(() => {
      const now = new Date();
      const newPoint = { 
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          count: realLiveCount 
      };
      setVisitorHistory(prev => [...prev, newPoint].slice(-60)); // Keep last 60 mins
  }, [realLiveCount]);

  // 2. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      // Orders
      const { data: oData } = await adminSupabase.from('orders gearshop').select('*').order('created_at', { ascending: false });
      if (oData) setOrders(oData.map(o => ({
        id: o.id,
        customerName: o.customer_name,
        phone: o.phone,
        city: o.city,
        items: o.items || [],
        total: o.total,
        status: o.status,
        date: o.created_at
      })));

      // Sessions
      const { data: sData } = await adminSupabase.from('sessions_gearshop').select('*').order('created_at', { ascending: false });
      if (sData) setSessions(sData);

      // Clicks
      const { data: cData } = await adminSupabase.from('clicks_gearshop').select('*').limit(1000);
      if (cData) setClicks(cData);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [activeTab]);

  // 3. ANALYTICS CALCULATIONS
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const today = new Date(now.setHours(0,0,0,0));

    const last30DaysOrders = orders.filter(o => new Date(o.date) >= thirtyDaysAgo);
    const completed = last30DaysOrders.filter(o => o.status === 'completed');
    const revenue = completed.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = completed.length ? Math.round(revenue / completed.length) : 0;
    
    const todaySessions = sessions.filter(s => new Date(s.created_at) >= today);
    const uniqueSessions30d = new Set(sessions.filter(s => new Date(s.created_at) >= thirtyDaysAgo).map(s => s.session_id)).size;
    const conversion = uniqueSessions30d > 0 ? ((completed.length / uniqueSessions30d) * 100).toFixed(1) : '0';

    // 30 Days Revenue Chart Data
    const dailyRevenue: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyRevenue[d.toLocaleDateString([], { day: '2-digit', month: 'short' })] = 0;
    }
    completed.forEach(o => {
        const day = new Date(o.date).toLocaleDateString([], { day: '2-digit', month: 'short' });
        if (dailyRevenue[day] !== undefined) dailyRevenue[day] += o.total;
    });
    const chartData = Object.entries(dailyRevenue).map(([name, val]) => ({ name, val }));

    // City Bar Chart
    const cityMap: Record<string, number> = {};
    completed.forEach(o => cityMap[o.city] = (cityMap[o.city] || 0) + o.total);
    const cityData = Object.entries(cityMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    // Channel Pie Chart
    const sourceMap: Record<string, number> = {};
    sessions.filter(s => new Date(s.created_at) >= thirtyDaysAgo).forEach(s => {
        sourceMap[s.source] = (sourceMap[s.source] || 0) + 1;
    });
    const channelData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

    // Best Sellers
    const prodMap: Record<string, { name: string, qty: number, revenue: number, cities: Record<string, number> }> = {};
    completed.forEach(o => {
        o.items.forEach(item => {
            if (!prodMap[item.name]) prodMap[item.name] = { name: item.name, qty: 0, revenue: 0, cities: {} };
            prodMap[item.name].qty += item.qty;
            prodMap[item.name].revenue += (item.price * item.qty);
            prodMap[item.name].cities[o.city] = (prodMap[item.name].cities[o.city] || 0) + 1;
        });
    });
    const bestSellers = Object.values(prodMap).map(p => {
        const topCity = Object.entries(p.cities).sort((a,b) => b[1] - a[1])[0]?.[0] || '-';
        const productInfo = products.find(pr => pr.name === p.name);
        return { ...p, topCity, inStock: productInfo?.inStock ?? true };
    }).sort((a, b) => b.revenue - a.revenue);

    // Heatmap Insights
    const elementMap: Record<string, number> = {};
    clicks.forEach(c => {
        const tag = c.element_tag || 'Other';
        elementMap[tag] = (elementMap[tag] || 0) + 1;
    });
    const topElements = Object.entries(elementMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    return { 
        revenue, 
        avgOrder, 
        chartData, 
        cityData, 
        channelData,
        bestSellers,
        topElements,
        totalOrders: completed.length,
        conversion,
        todaySessions: todaySessions.length,
        peakConcurrent: Math.max(...visitorHistory.map(h => h.count), realLiveCount),
        pending: orders.filter(o => o.status === 'pending').length
    };
  }, [orders, sessions, realLiveCount, visitorHistory, products, clicks]);

  const filteredOrders = useMemo(() => {
  return orders.filter(o => 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm)
  );
  }, [orders, searchTerm]);
  const updateStatus = async (id: string, status: Order['status']) => {
    await adminSupabase.from('orders gearshop').update({ status }).eq('id', id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm('Supprimer cette commande ?')) {
      await adminSupabase.from('orders gearshop').delete().eq('id', id);
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row overflow-hidden font-sans text-black antialiased text-[13px]">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-black text-white p-8 flex flex-col shrink-0 z-20">
        <div className="flex items-center gap-3 mb-16 px-2">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <span className="font-black text-lg block leading-none tracking-tighter italic">GEARSHOP</span>
            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em]">Analytics Hub</span>
          </div>
        </div>

        <nav className="space-y-1 flex-grow">
          {[
            { id: 'analytics', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'orders', label: 'Commandes', icon: <ShoppingCart size={18} />, count: metrics.pending },
            { id: 'inventory', label: 'Inventaire', icon: <Package size={18} /> },
            { id: 'heatmaps', label: 'Engagement', icon: <MapIcon size={18} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold transition-all duration-300", activeTab === item.id ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-white hover:bg-white/5")}
            >
              <div className="flex items-center gap-3">{item.icon}{item.label}</div>
              {item.count !== undefined && item.count > 0 && <span className="bg-white text-black text-[9px] px-1.5 py-0.5 rounded-full font-black italic">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live</span>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /><span className="text-[8px] font-black text-green-500 uppercase">Real-time</span></div>
            </div>
            <div className="text-4xl font-black tracking-tighter italic mb-1">{realLiveCount}</div>
          </div>
          <button onClick={onClose} className="w-full flex items-center gap-2 py-2 text-gray-500 hover:text-white text-[9px] font-black transition-colors uppercase tracking-[0.2em]"><ExternalLink size={12} /> Exit</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow overflow-y-auto bg-[#fafafa]">
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Command Center</h1>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-3">Monitoring GearShop Casablanca</p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
               {[{ label: 'Main', id: 'analytics' }, { label: 'Sales', id: 'orders' }, { label: 'Heatmaps', id: 'heatmaps' }, { label: 'Admin', id: 'admin' }].map(t => (
                 <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={cn("px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg", activeTab === t.id ? "bg-black text-white shadow-md" : "text-gray-400 hover:text-black")}>{t.label}</button>
               ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                
                {/* 1. Live Visitors & Sessions Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Visitors</span>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-[10px] font-black text-green-500 uppercase">Live</span></div>
                            </div>
                            <div className="flex items-end gap-4 mb-6">
                                <div className="text-6xl font-black tracking-tighter italic leading-none">{realLiveCount}</div>
                                <div className="pb-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Peak Today</p>
                                    <p className="text-lg font-black italic leading-none">{metrics.peakConcurrent}</p>
                                </div>
                            </div>
                            <div className="h-16 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={visitorHistory}>
                                        <Area type="monotone" dataKey="count" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-6">Traffic Today</span>
                            <div className="text-5xl font-black tracking-tighter italic mb-2">{metrics.todaySessions}</div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Unique Sessions Today</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"><Globe size={14} /> Global Reach</div>
                            <div className="text-[10px] font-black text-blue-500 italic">+12% vs Yesterday</div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-6">Conversion Rate</span>
                            <div className="text-5xl font-black tracking-tighter italic mb-2">{metrics.conversion}%</div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order / Session Ratio</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50">
                             <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(parseFloat(metrics.conversion) * 5, 100)}%` }}
                                    className="h-full bg-black rounded-full"
                                />
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. Revenue & Orders KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue (30d)', val: `${metrics.revenue} DH`, trend: '+14%', icon: <TrendingUp size={20} /> },
                    { label: 'Total Orders (30d)', val: metrics.totalOrders, trend: '+8%', icon: <ShoppingCart size={20} /> },
                    { label: 'Avg Order Value', val: `${metrics.avgOrder} DH`, trend: '+2%', icon: <CreditCard size={20} /> },
                    { label: 'Pending Orders', val: metrics.pending, trend: 'Action Required', icon: <Clock size={20} />, color: metrics.pending > 0 ? 'text-orange-500' : '' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-4">
                         <div className={cn("p-2.5 bg-gray-50 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-colors", s.color)}>{s.icon}</div>
                         <div className="text-[9px] font-black text-gray-400 italic">{s.trend}</div>
                      </div>
                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.25em] mb-1">{s.label}</p>
                      <p className="text-2xl font-black tracking-tighter italic">{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* 3. Main Revenue Chart */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Revenue Performance</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Last 30 Days Real Data</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic leading-none">Total: {metrics.revenue} DH</div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.chartData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000" stopOpacity={0.08}/>
                                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} tickFormatter={(val) => `${val} DH`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="val" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#revenueGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Best Sellers & Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Best Sellers Table */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Best Sellers</h4>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ranked by Revenue</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Product</th>
                                        <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Sold</th>
                                        <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Revenue</th>
                                        <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Top City</th>
                                        <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    {metrics.bestSellers.map((p, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-300">0{i+1}</span>
                                                    <span className="text-[11px] font-black uppercase italic group-hover:text-black transition-colors truncate max-w-[150px]">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 font-bold text-gray-500">{p.qty}</td>
                                            <td className="py-5 font-black italic">{p.revenue} DH</td>
                                            <td className="py-5 text-[10px] font-bold uppercase text-gray-400">{p.topCity}</td>
                                            <td className="py-5">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter",
                                                    p.inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {p.inStock ? 'In Stock' : 'Out'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {metrics.bestSellers.length === 0 && (
                                        <tr><td colSpan={5} className="py-12 text-center text-gray-300 font-black uppercase italic">No sales data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stock Alert Widget */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Stock Alerts</h4>
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={18} /></div>
                        </div>
                        <div className="flex-grow space-y-4">
                            {products.filter(p => !p.inStock).map((p, i) => (
                                <div key={i} className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50 flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase italic text-red-700 truncate max-w-[140px]">{p.name}</span>
                                    <span className="text-[9px] font-black uppercase text-red-500 bg-white px-2 py-1 rounded shadow-sm">Out of Stock</span>
                                </div>
                            ))}
                            {products.filter(p => !p.inStock).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
                                    <Package size={40} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase">All items in stock</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setActiveTab('inventory')} className="mt-8 w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform">Manage Inventory</button>
                    </div>
                </div>

                {/* 5. Cities & Channels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* City Performance */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-xl font-black uppercase italic tracking-tighter mb-12">Top Cities</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.cityData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} width={90} />
                                    <Tooltip cursor={{ fill: '#fafafa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#000" radius={[0, 10, 10, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Channels Pie */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h4 className="text-xl font-black uppercase italic tracking-tighter mb-12">Traffic Channels</h4>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.channelData.length > 0 ? metrics.channelData : [{ name: 'Direct', value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {(metrics.channelData.length > 0 ? metrics.channelData : [{ name: 'Direct', value: 1 }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by customer, city or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-100">{metrics.pending} Pending</div>
                        <div className="px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">{filteredOrders.length} Total</div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2 md:p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 font-black text-gray-300 uppercase text-[9px] tracking-[0.2em]">Customer</th>
                                    <th className="px-6 py-4 font-black text-gray-300 uppercase text-[9px] tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-4 font-black text-gray-300 uppercase text-[9px] tracking-[0.2em]">Gear</th>
                                    <th className="px-6 py-4 font-black text-gray-300 uppercase text-[9px] tracking-[0.2em]">Amount</th>
                                    <th className="px-6 py-4 font-black text-gray-300 uppercase text-[9px] tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {filteredOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-6 py-6">
                                            <div className="text-[12px] font-black uppercase italic leading-tight">{o.customerName}</div>
                                            <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{o.phone} • {o.city}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                o.status === 'completed' ? "bg-green-50 text-green-600 border-green-100" : 
                                                o.status === 'cancelled' ? "bg-red-50 text-red-600 border-red-100" : 
                                                "bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse"
                                            )}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {o.items.map((item, idx) => (
                                                    <span key={idx} className="bg-gray-100 text-[8px] font-black px-2 py-0.5 rounded text-gray-500 uppercase">
                                                        {item.qty}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-[14px] font-black tracking-tighter italic">{o.total} DH</div>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a 
                                                    href={`https://wa.me/212${o.phone.startsWith('0') ? o.phone.substring(1) : o.phone}`} 
                                                    target="_blank" 
                                                    className="p-2.5 bg-gray-50 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="WhatsApp Customer"
                                                >
                                                    <MessageCircle size={14} />
                                                </a>
                                                {o.status !== 'completed' && (
                                                    <button 
                                                        onClick={() => updateStatus(o.id, 'completed')} 
                                                        className="p-2.5 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteOrder(o.id)} 
                                                    className="p-2.5 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div className="py-20 text-center">
                                <Search className="mx-auto text-gray-200 mb-4" size={48} />
                                <p className="text-gray-400 font-black uppercase italic tracking-widest text-xs">No orders found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'heatmaps' && (
              <motion.div key="heatmaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
                
                {/* Visual Map Area */}
                <div className="flex-grow bg-black p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col items-center justify-center border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    <div className="relative z-10 text-center mb-10 w-full">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic">Real-Time Interaction Map</h3>
                        </div>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">Live visualization of {clicks.length} user sessions</p>
                    </div>

                    <div className="w-full max-w-4xl aspect-video bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        {/* SITE WIREFRAME BACKDROP (The Skeleton) */}
                        <div className="absolute inset-0 opacity-[0.15] p-8 flex flex-col gap-6 pointer-events-none">
                            {/* Header Skeleton */}
                            <div className="h-8 w-full border border-white/40 rounded-lg flex items-center justify-between px-4">
                                <div className="w-12 h-3 bg-white/40 rounded" />
                                <div className="flex gap-2"><div className="w-8 h-2 bg-white/20 rounded" /><div className="w-8 h-2 bg-white/20 rounded" /></div>
                            </div>
                            {/* Hero Skeleton */}
                            <div className="h-40 w-full border border-white/40 rounded-2xl flex flex-col items-center justify-center gap-3">
                                <div className="w-3/4 h-6 bg-white/40 rounded" />
                                <div className="w-1/2 h-3 bg-white/20 rounded" />
                            </div>
                            {/* Grid Skeleton */}
                            <div className="grid grid-cols-3 gap-4 flex-grow">
                                {[1,2,3].map(i => <div key={i} className="border border-white/20 rounded-xl" />)}
                            </div>
                        </div>

                        {/* RENDER HEATMAP DOTS */}
                        {clicks.map((click, i) => (
                            <div 
                                key={i}
                                className="absolute w-6 h-6 bg-yellow-400/10 rounded-full blur-xl pointer-events-none"
                                style={{ left: `${click.x_percent}%`, top: `${click.y_percent}%` }}
                            />
                        ))}
                        
                        {/* CORE HOTSPOTS (Thermal Colors) */}
                        {clicks.slice(0, 50).map((click, i) => (
                            <div 
                                key={`hot-${i}`}
                                className="absolute w-2 h-2 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
                                style={{ 
                                    left: `${click.x_percent}%`, 
                                    top: `${click.y_percent}%`,
                                    backgroundColor: i < 10 ? '#ef4444' : i < 25 ? '#f97316' : '#eab308'
                                }}
                            />
                        ))}
                        
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-[8px] font-black uppercase">Critical</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full" /><span className="text-[8px] font-black uppercase">Active</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full" /><span className="text-[8px] font-black uppercase">Cold</span></div>
                        </div>
                    </div>
                </div>

                {/* INSIGHTS PANEL */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-black uppercase italic mb-8">Element Popularity</h4>
                        <div className="space-y-6">
                            {metrics.topElements.map((el, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase italic truncate max-w-[120px]">{el.name}</span>
                                        <span className="text-[10px] font-black text-gray-400">{el.count} clicks</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(el.count / (metrics.topElements[0]?.count || 1)) * 100}%` }}
                                            className="h-full bg-black rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black p-8 rounded-[2.5rem] text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-lg text-yellow-500"><Zap size={16} fill="currentColor" /></div>
                            <h4 className="text-xs font-black uppercase italic">Quick Insights</h4>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-400 leading-relaxed font-bold"><span className="text-white">High Intent:</span> 60% of interactions occur in the Hero area.</p>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-400 leading-relaxed font-bold"><span className="text-white">Conversion:</span> Clicks on Product Cards increased by 12% today.</p>
                            </li>
                        </ul>
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 min-h-[600px]">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-12">Stock Real-time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((item) => (
                        <div key={item.id} className={cn("p-6 rounded-[2rem] border transition-all", item.inStock ? "bg-gray-50 border-gray-100" : "bg-red-50/30 border-red-100")}>
                            <div className="text-[8px] font-black text-gray-400 uppercase mb-1">{item.category}</div>
                            <div className="text-sm font-black uppercase italic mb-6 line-clamp-1">{item.name}</div>
                            <div className="flex justify-between items-end">
                                <div className="text-[18px] font-black tracking-tighter">{item.inStock ? 'Available' : 'Sold Out'}</div>
                                <div className="text-xs font-black italic">{item.price} DH</div>
                            </div>
                        </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
