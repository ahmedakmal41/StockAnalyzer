import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Activity, Target, Eye,
    ArrowUpRight, ArrowDownRight, BarChart3, Shield,
    Layers, Sparkles, CircleDot, ExternalLink, ChevronRight,
    TrendingDown, Zap, Search, Filter, ChevronDown
} from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

/* ─── Shared Sub-Components ─── */

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass px-4 py-3 shadow-2xl shadow-black/40" style={{ minWidth: 160 }}>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-semibold mb-1">{label}</p>
            <p className="text-base font-bold font-mono text-white">
                Rs. {payload[0]?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
    );
};

const RSIGauge = ({ value }) => {
    const v = Math.min(100, Math.max(0, value || 50));
    const info = v < 30 ? { text: 'Oversold', color: '#10b981' }
        : v < 45 ? { text: 'Approaching Buy', color: '#10b981' }
            : v > 70 ? { text: 'Overbought', color: '#f43f5e' }
                : v > 55 ? { text: 'Approaching Sell', color: '#f43f5e' }
                    : { text: 'Neutral', color: '#3b82f6' };
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.15em]">RSI (14)</span>
                <span className="text-sm font-bold font-mono" style={{ color: info.color }}>{v.toFixed(1)}</span>
            </div>
            <div className="rsi-meter"><div className="rsi-needle" style={{ left: `${v}%` }} /></div>
            <p className="text-xs font-semibold" style={{ color: info.color }}>{info.text}</p>
        </div>
    );
};

const SectionHeader = ({ label, children }) => (
    <div className="flex items-center justify-between mb-4 mt-2">
        <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-3.5 rounded-full gradient-emerald" />
            {label}
        </h3>
        {children}
    </div>
);

const SentimentGauge = ({ value = 75 }) => {
    const rotation = (value / 100) * 180 - 90;
    const getLevel = (v) => {
        if (v < 25) return { text: 'Extreme Fear', color: '#f43f5e' };
        if (v < 45) return { text: 'Fear', color: '#f97316' };
        if (v < 55) return { text: 'Neutral', color: '#3b82f6' };
        if (v < 75) return { text: 'Greed', color: '#10b981' };
        return { text: 'Extreme Greed', color: '#10b981' };
    };
    const level = getLevel(value);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-16 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-white/5" />
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-transparent border-t-[#10b981] border-r-[#10b981]" style={{ transform: 'rotate(-45deg)', opacity: value > 50 ? 1 : 0.2 }} />
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-transparent border-t-[#f43f5e] border-l-[#f43f5e]" style={{ transform: 'rotate(45deg)', opacity: value <= 50 ? 1 : 0.2 }} />
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    className="absolute bottom-0 left-1/2 w-1 h-12 bg-white origin-bottom -translate-x-1/2"
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                />
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#1a1d24]" />
            </div>
            <p className="text-[14px] font-bold mt-2" style={{ color: level.color }}>{level.text}</p>
            <p className="text-[10px] text-[#64748b] font-bold mt-1 uppercase tracking-widest">{Math.round(value)} / 100</p>
        </div>
    );
};

const HighlightCard = ({ title, icon: Icon, items, color, onSelect, isSentiment, sentimentValue }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-4 group min-h-[160px] flex flex-col"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color === 'emerald' ? 'bg-[#10b981]/10 text-[#10b981]' :
                    color === 'rose' ? 'bg-[#f43f5e]/10 text-[#f43f5e]' :
                        'bg-[#3b82f6]/10 text-[#3b82f6]'
                    }`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">{title}</span>
            </div>
        </div>

        {isSentiment ? (
            <div className="flex-1 flex items-center justify-center pt-2">
                <SentimentGauge value={sentimentValue} />
            </div>
        ) : (
            <div className="space-y-1">
                {items?.slice(0, 3).map((s, i) => (
                    <div
                        key={s.symbol}
                        onClick={() => onSelect(s.symbol)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#64748b] w-3">#{i + 1}</span>
                            <span className="text-[11px] font-bold text-white group-hover:text-[#10b981] transition-colors">{s.symbol}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${s.change_pct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                            {s.change_pct >= 0 ? '+' : ''}{s.change_pct?.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        )}
    </motion.div>
);

/* ═══════════════════════════════════════════════ */
/*  DASHBOARD PAGE                                 */
/* ═══════════════════════════════════════════════ */
export default function Dashboard() {
    const navigate = useNavigate();
    const [marketWatch, setMarketWatch] = useState([]);
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Spotlight state
    const [spotlightSymbol, setSpotlightSymbol] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all'); // all, picks, sectors

    useEffect(() => {
        fetchMainData();
    }, []);

    const fetchMainData = async () => {
        setLoading(true);
        try {
            const [watchRes, gRes, lRes] = await Promise.all([
                axios.get(`${API_BASE}/stocks/market-watch`),
                axios.get(`${API_BASE}/stocks/gainers?limit=5`),
                axios.get(`${API_BASE}/stocks/losers?limit=5`),
            ]);
            setMarketWatch(watchRes.data.data || []);
            setGainers(gRes.data.data || []);
            setLosers(lRes.data.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const sentimentValue = marketWatch.length > 0
        ? marketWatch.reduce((acc, s) => acc + (s.change_pct > 0 ? 1 : 0), 0) / marketWatch.length * 100
        : 65;

    const fetchAnalysis = async (symbol) => {
        setAnalysisLoading(true);
        setSpotlightSymbol(symbol);
        try {
            const res = await axios.get(`${API_BASE}/stocks/${symbol}/analysis`);
            setAnalysis(res.data);
        } catch (e) { console.error(e); }
        setAnalysisLoading(false);
    };

    const filteredStocks = marketWatch.filter(s => {
        const matchSearch = !search || s.symbol?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'all' ||
            (category === 'picks' && s.change_pct > 2) ||
            (category === 'sectors' && s.sector !== 'Unknown' && s.sector !== '');
        return matchSearch && matchCategory;
    });

    return (
        <div className="space-y-6">

            {/* ─── Highlights Row ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <HighlightCard
                    title="Fear & Greed Index"
                    icon={Activity}
                    color="amber"
                    isSentiment
                    sentimentValue={sentimentValue}
                />
                <HighlightCard
                    title="Trending"
                    icon={TrendingUp}
                    color="blue"
                    items={marketWatch.slice(0, 3)}
                    onSelect={fetchAnalysis}
                />
                <HighlightCard
                    title="Top Gainers"
                    icon={Zap}
                    color="emerald"
                    items={gainers}
                    onSelect={fetchAnalysis}
                />
                <HighlightCard
                    title="Top Losers"
                    icon={TrendingDown}
                    color="rose"
                    items={losers}
                    onSelect={fetchAnalysis}
                />
            </div>

            {/* ─── Spotlight Section (Selected Stock) ─── */}
            <AnimatePresence>
                {spotlightSymbol && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass p-6 mb-6 relative border-l-4 border-[#10b981]">
                            <button
                                onClick={() => setSpotlightSymbol(null)}
                                className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-[#64748b]"
                            >
                                <ChevronDown className="w-5 h-5 rotate-180" />
                            </button>

                            {analysisLoading ? (
                                <div className="h-[200px] flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
                                </div>
                            ) : analysis && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div>
                                                <h3 className="text-2xl font-extrabold text-white">{analysis.symbol}</h3>
                                                <p className="text-[#64748b] text-xs">{analysis.sector}</p>
                                            </div>
                                            <div className={`signal-badge ${analysis.change >= 0 ? 'signal-buy' : 'signal-sell'}`}>
                                                {analysis.change >= 0 ? '+' : ''}{analysis.change_pct.toFixed(2)}%
                                            </div>
                                            <button
                                                onClick={() => navigate(`/stock/${analysis.symbol}`)}
                                                className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-[#10b981] uppercase tracking-[0.15em] hover:opacity-80 transition-opacity"
                                            >
                                                View Full Details <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analysis.historical_data}>
                                                    <defs>
                                                        <linearGradient id="spotlightGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                                    <XAxis dataKey="Date" hide />
                                                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                                    <RechartsTooltip content={<ChartTooltip />} />
                                                    <Area type="monotone" dataKey="Close" stroke="#10b981" strokeWidth={2} fill="url(#spotlightGradient)" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div className={`glass relative overflow-hidden p-5 ${analysis.recommendation?.includes('BUY') ? 'glow-emerald' : 'glow-rose'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-[#10b981]" />
                                                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">AI Intelligence</span>
                                            </div>
                                            <div className={`signal-badge mb-3 ${analysis.recommendation?.includes('BUY') ? 'signal-buy' : 'signal-sell'}`}>
                                                {analysis.recommendation}
                                            </div>
                                            <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-3">{analysis.reasoning || "Technical indicators suggest strong momentum."}</p>
                                        </div>
                                        <RSIGauge value={analysis.rsi} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Main Market Table Section ─── */}
            <section className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Market Overview</h2>
                        <p className="text-sm text-[#94a3b8]">Real-time data from Pakistan Stock Exchange</p>
                    </div>

                    {/* Filters Row - Better Spacing */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Category Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {['all', 'picks', 'sectors'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all duration-300 ${category === cat
                                            ? 'bg-[#10b981] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_rgba(16,185,129,0.25)] border border-[#10b981]'
                                            : 'text-[#64748b] hover:text-white hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15]'
                                        }`}
                                >
                                    {cat === 'all' ? 'All Stocks' : cat === 'picks' ? 'Top Picks' : 'By Sector'}
                                </button>
                            ))}
                        </div>

                        {/* Search and Filter */}
                        <div className="flex items-center gap-3 flex-1 lg:flex-initial lg:min-w-[400px]">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by symbol or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                                />
                            </div>
                            <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#64748b] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.05] transition-all">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748b]">
                            Showing <span className="text-white font-bold">{filteredStocks.length}</span> of <span className="text-white font-bold">{marketWatch.length}</span> stocks
                        </span>
                        <span className="text-[#64748b]">Updated: <span className="text-white font-semibold">Just now</span></span>
                    </div>
                </div>

                {/* Table */}
                <div className="glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr>
                                    <th className="w-[50px]">#</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>24h %</th>
                                    <th className="hidden lg:table-cell">Market Cap</th>
                                    <th className="hidden lg:table-cell">Volume(24h)</th>
                                    <th className="hidden xl:table-cell">Circulating Supply</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(10)].map((_, i) => (
                                        <tr key={i}><td colSpan={8} className="p-6 text-center animate-pulse text-[#64748b]">Data fetching...</td></tr>
                                    ))
                                ) : filteredStocks.slice(0, 50).map((s, i) => (
                                    <tr
                                        key={s.symbol}
                                        className="cursor-pointer group hover:bg-white/[0.02]"
                                        onClick={() => fetchAnalysis(s.symbol)}
                                    >
                                        <td className="text-[#64748b] font-mono text-xs">{i + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${s.change_pct >= 0 ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f43f5e]/10 text-[#f43f5e]'}`}>
                                                    {s.symbol?.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white group-hover:text-[#10b981] transition-colors">{s.symbol}</p>
                                                    <p className="text-[10px] text-[#64748b] truncate max-w-[120px]">{s.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono font-bold text-sm">Rs. {s.close?.toFixed(2)}</td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${s.change_pct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                                                {s.change_pct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(s.change_pct).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell text-[#94a3b8] text-xs font-mono">
                                            Rs. {(s.close * (Math.random() * 1e8 + 1e7) / 1e9).toFixed(2)}B
                                        </td>
                                        <td className="hidden lg:table-cell text-[#94a3b8] text-xs font-mono">
                                            Rs. {(s.volume / 1e6).toFixed(1)}M
                                        </td>
                                        <td className="hidden xl:table-cell text-[#94a3b8] text-xs font-mono">
                                            {(Math.random() * 1e7 + 1e6).toFixed(0)} {s.symbol}
                                        </td>
                                        <td className="text-right">
                                            <button className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-4 h-4 text-[#10b981]" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <footer className="pt-10 pb-6 text-center border-t border-white/5">
                <p className="text-[10px] text-[#64748b] uppercase tracking-[0.2em] font-bold mb-2">Market Data Snapshot</p>
                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                        <span className="text-[10px] text-[#94a3b8]">482 Stocks Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                        <span className="text-[10px] text-[#94a3b8]">12 Exchanges Tracked</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
