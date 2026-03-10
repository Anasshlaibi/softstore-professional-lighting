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

interface ActivityEvent {
  id: string;
  type: 'view' | 'cart' | 'order';
  text: string;
  time: string;
  city: string;
}

interface Click {
    x_percent: number;
    y_percent: number;
    element_tag: string;
}

interface DashboardProps {
    onClose: () => void;
    realLiveCount: number;
    products: Product[];
}

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

const Dashboard: React.FC<DashboardProps> = ({ onClose, realLiveCount, products }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'live' | 'heatmaps' | 'inventory' | 'admin'>('analytics');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. ACTIVITY FEED
  useEffect(() => {
    const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir'];
    const actions = [
      { type: 'view', text: 'a consulté YM 350 Studio' },
      { type: 'view', text: 'regarde les Softboxes ZSYB' },
      { type: 'cart', text: 'a ajouté au panier : YB-300R' },
      { type: 'view', text: 'explore la catégorie Éclairage' },
      { type: 'view', text: 'est sur la page de paiement' },
    ];

    const generateActivity = () => {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const newEvent: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: action.type as any,
        text: action.text,
        city: city,
        time: 'À l\'instant'
      };
      setActivities(prev => [newEvent, ...prev].slice(0, 10));
    };

    const interval = setInterval(generateActivity, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. FETCH ORDERS & CLICKS
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

      // Clicks
      const { data: cData } = await adminSupabase.from('clicks_gearshop').select('*').limit(500);
      if (cData) setClicks(cData);
    };

    fetchData();
  }, [activeTab]);

  // 3. ANALYTICS CALCULATIONS
  const metrics = useMemo(() => {
  const completed = orders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = completed.length ? Math.round(revenue / completed.length) : 0;

  // City Distribution
  const citiesMap: Record<string, number> = {};
  completed.forEach(o => {
      citiesMap[o.city] = (citiesMap[o.city] || 0) + o.total;
  });
  const cityData = Object.entries(citiesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

  // Category Distribution
  const catMap: Record<string, number> = {};
  completed.forEach(o => {
      o.items.forEach(item => {
          const cat = item.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + (item.price * item.qty);
      });
  });
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Top Products
  const prodMap: Record<string, { name: string, qty: number, revenue: number }> = {};
  completed.forEach(o => {
      o.items.forEach(item => {
          if (!prodMap[item.name]) prodMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
          prodMap[item.name].qty += item.qty;
          prodMap[item.name].revenue += (item.price * item.qty);
      });
  });
  const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  // Click Analysis (New)
  const elementMap: Record<string, number> = {};
  clicks.forEach(c => {
      const tag = c.element_tag || 'Other';
      elementMap[tag] = (elementMap[tag] || 0) + 1;
  });
  const topElements = Object.entries(elementMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

  // Chart Data (Mocking daily trend from real orders if possible, or keeping refined mock)
  const chartData = [
      { name: 'Mon', val: revenue * 0.1 },
      { name: 'Tue', val: revenue * 0.15 },
      { name: 'Wed', val: revenue * 0.12 },
      { name: 'Thu', val: revenue * 0.2 },
      { name: 'Fri', val: revenue * 0.25 },
      { name: 'Sat', val: revenue * 0.18 },
      { name: 'Sun', val: revenue * 0.3 }
  ];

  return { 
      revenue, 
      avgOrder, 
      chartData, 
      cityData, 
      categoryData,
      topProducts,
      topElements,
      pending: orders.filter(o => o.status === 'pending').length,
      conversion: realLiveCount > 0 ? ((orders.length / (realLiveCount * 10)) * 100).toFixed(1) : 0 // Mocked conversion logic
  };
  }, [orders, realLiveCount, clicks]);

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
                
                {/* Decision Support Alerts */}
                {(metrics.pending > 0 || products.filter(p => !p.inStock).length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metrics.pending > 0 && (
                            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white animate-pulse"><AlertTriangle size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-yellow-700">Needs Attention</p>
                                    <p className="text-[12px] font-bold text-yellow-900">{metrics.pending} Pending orders waiting for confirmation.</p>
                                </div>
                                <button onClick={() => setActiveTab('orders')} className="ml-auto text-[9px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-yellow-200 hover:bg-yellow-500 hover:text-white transition-all">Review</button>
                            </div>
                        )}
                        {products.filter(p => !p.inStock).length > 0 && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white"><Package size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-red-700">Stock Alert</p>
                                    <p className="text-[12px] font-bold text-red-900">{products.filter(p => !p.inStock).length} Items are currently sold out.</p>
                                </div>
                                <button onClick={() => setActiveTab('inventory')} className="ml-auto text-[9px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-500 hover:text-white transition-all">Restock</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Revenue', val: `${metrics.revenue} DH`, trend: '+14%', icon: <TrendingUp size={20} /> },
                    { label: 'AOV', val: `${metrics.avgOrder} DH`, trend: '+2%', icon: <CreditCard size={20} /> },
                    { label: 'Orders', val: orders.length, trend: '+8%', icon: <ShoppingCart size={20} /> },
                    { label: 'Conversion', val: `${metrics.conversion}%`, trend: '+1%', icon: <Activity size={20} /> },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-4">
                         <div className="p-2.5 bg-gray-50 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-colors">{s.icon}</div>
                         <div className="text-[9px] font-black text-green-500 italic flex items-center gap-1"><ArrowUpRight size={10} /> {s.trend}</div>
                      </div>
                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.25em] mb-1">{s.label}</p>
                      <p className="text-2xl font-black tracking-tighter italic">{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Trend */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-sm font-black uppercase italic">Revenue Trend</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Weekly Growth Performance</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full"/> Sales</div>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.chartData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: 'none', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="val" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col">
                        <h4 className="text-sm font-black uppercase italic mb-8">Categories</h4>
                        <div className="flex-grow h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.categoryData.length > 0 ? metrics.categoryData : [{ name: 'None', value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(metrics.categoryData.length > 0 ? metrics.categoryData : [{ name: 'None', value: 1 }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {metrics.categoryData.slice(0, 4).map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[9px] font-black uppercase truncate">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* City Performance */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100">
                        <h4 className="text-sm font-black uppercase italic mb-8">Sales by City</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.cityData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} width={80} />
                                    <Tooltip cursor={{ fill: '#f8f8f8' }} />
                                    <Bar dataKey="value" fill="#000" radius={[0, 10, 10, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-black uppercase italic">Top Products</h4>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">By Revenue</span>
                        </div>
                        <div className="space-y-6">
                            {metrics.topProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] font-black group-hover:bg-black group-hover:text-white transition-all">0{i+1}</div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic line-clamp-1">{p.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{p.qty} Units Sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-black italic">{p.revenue} DH</p>
                                        <p className="text-[8px] text-green-500 font-black uppercase tracking-tighter flex items-center justify-end"><ArrowUpRight size={8} /> Hot</p>
                                    </div>
                                </div>
                            ))}
                            {metrics.topProducts.length === 0 && (
                                <div className="py-12 text-center text-gray-300 font-black uppercase italic tracking-widest text-[10px]">No sales data yet</div>
                            )}
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
