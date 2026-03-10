import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

export default function Sectors() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSector, setExpandedSector] = useState(null);
    const [search, setSearch] = useState('');
    const [breadthFilter, setBreadthFilter] = useState('all');
    const [liquidityFilter, setLiquidityFilter] = useState('all');

    useEffect(() => {
        axios.get(`${API_BASE}/stocks/market-watch`).then(res => {
            setStocks(res.data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const sectorMap = {};
    stocks.forEach(s => {
        const sec = s.sector || 'Other';
        if (!sectorMap[sec]) sectorMap[sec] = { stocks: [], totalVol: 0, gainers: 0, losers: 0 };
        sectorMap[sec].stocks.push(s);
        sectorMap[sec].totalVol += s.volume || 0;
        if (s.change_pct > 0) sectorMap[sec].gainers++;
        if (s.change_pct < 0) sectorMap[sec].losers++;
    });

    const sectors = Object.entries(sectorMap).map(([name, data]) => ({
        name, count: data.stocks.length, totalVol: data.totalVol,
        gainers: data.gainers, losers: data.losers,
        avgChange: data.stocks.reduce((a, s) => a + (s.change_pct || 0), 0) / data.stocks.length,
        stocks: data.stocks.sort((a, b) => (b.volume || 0) - (a.volume || 0)),
    })).sort((a, b) => b.totalVol - a.totalVol);

    const filteredSectors = sectors.filter((sector) => {
        const matchSearch = !search || sector.name.toLowerCase().includes(search.toLowerCase());
        const matchBreadth = breadthFilter === 'all' ||
            (breadthFilter === 'advancing' && sector.avgChange > 0) ||
            (breadthFilter === 'declining' && sector.avgChange < 0) ||
            (breadthFilter === 'balanced' && Math.abs(sector.avgChange) <= 0.5);
        const matchLiquidity = liquidityFilter === 'all' ||
            (liquidityFilter === 'high' && sector.totalVol >= 10000000) ||
            (liquidityFilter === 'mid' && sector.totalVol >= 3000000 && sector.totalVol < 10000000) ||
            (liquidityFilter === 'low' && sector.totalVol < 3000000);
        return matchSearch && matchBreadth && matchLiquidity;
    });

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-hero">
                <div className="page-hero-grid">
                    <div>
                        <div className="eyebrow-row">
                            <span className="eyebrow-badge">Rotation monitor</span>
                            <span className="eyebrow-note">Breadth and liquidity</span>
                        </div>
                        <h2>Sector <span className="gradient-text">Analysis</span></h2>
                        <p>Explore {sectors.length} sectors across the PSX with an emphasis on capital flow, participation, and leadership shifts.</p>
                    </div>
                    <div className="page-hero-side">
                        <div className="page-stat">
                            <strong>{sectors.length || '--'}</strong>
                            <span>Tracked sectors</span>
                        </div>
                        <div className="page-stat">
                            <strong>{stocks.length || '--'}</strong>
                            <span>Total mapped stocks</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.5fr)_repeat(2,minmax(160px,1fr))_auto]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search sector..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={breadthFilter}
                            onChange={(e) => setBreadthFilter(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all"
                        >
                            <option value="all">All breadth</option>
                            <option value="advancing">Advancing</option>
                            <option value="declining">Declining</option>
                            <option value="balanced">Balanced</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={liquidityFilter}
                            onChange={(e) => setLiquidityFilter(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all"
                        >
                            <option value="all">All liquidity</option>
                            <option value="high">High liquidity</option>
                            <option value="mid">Mid liquidity</option>
                            <option value="low">Low liquidity</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => {
                            setSearch('');
                            setBreadthFilter('all');
                            setLiquidityFilter('all');
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.05] transition-all whitespace-nowrap"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="text-sm font-semibold">Reset</span>
                    </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-sm text-[#64748b]">
                    <div>Showing <span className="text-white font-bold">{filteredSectors.length}</span> of <span className="text-white font-bold">{sectors.length}</span> sectors</div>
                    <div className="hidden md:block">Filtered using move breadth and traded volume</div>
                </div>
            </motion.div>

            {loading ? (
                <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="glass p-6 h-24 animate-shimmer" />)}</div>
            ) : (
                <div className="space-y-3">
                    {filteredSectors.length === 0 ? (
                        <div className="glass p-8 text-center text-[#64748b]">No sectors match the selected filters.</div>
                    ) : filteredSectors.map((sector, i) => {
                        const isUp = sector.avgChange > 0;
                        const expanded = expandedSector === sector.name;
                        return (
                            <motion.div key={sector.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                                <div onClick={() => setExpandedSector(expanded ? null : sector.name)} className="glass glass-hover p-5 cursor-pointer">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUp ? 'bg-[#10b981]/10' : 'bg-[#f43f5e]/10'}`}>
                                                <BarChart3 className={`w-5 h-5 ${isUp ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{sector.name}</p>
                                                <p className="text-[10px] text-[#64748b]">{sector.count} stocks · Vol: {(sector.totalVol / 1e6).toFixed(1)}M</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs">
                                            <div><span className="text-[#10b981] font-bold">{sector.gainers}</span> <span className="text-[#64748b]">up</span></div>
                                            <div><span className="text-[#f43f5e] font-bold">{sector.losers}</span> <span className="text-[#64748b]">down</span></div>
                                            <span className={`signal-badge ${isUp ? 'signal-buy' : 'signal-sell'}`}>
                                                {isUp ? '+' : ''}{sector.avgChange.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {expanded && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 glass p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {sector.stocks.slice(0, 12).map(s => (
                                                <div key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer">
                                                    <span className="text-sm font-semibold text-white">{s.symbol}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-[#94a3b8]">Rs.{s.close?.toFixed(1)}</span>
                                                        <span className={`text-[10px] font-bold ${s.change_pct > 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>{s.change_pct > 0 ? '+' : ''}{s.change_pct?.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
