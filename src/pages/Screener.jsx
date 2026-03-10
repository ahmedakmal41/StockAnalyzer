import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

export default function Screener() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('change_pct');
    const [sortDir, setSortDir] = useState('desc');
    const [sectorFilter, setSectorFilter] = useState('all');
    const [moveFilter, setMoveFilter] = useState('all');
    const [priceBand, setPriceBand] = useState('all');
    const [volumeBand, setVolumeBand] = useState('all');

    useEffect(() => {
        fetchMarketWatch();
    }, []);

    const fetchMarketWatch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/stocks/market-watch`);
            setStocks(res.data.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const sectors = [...new Set(stocks.map(s => s.sector))].filter(Boolean).sort();

    const matchesPriceBand = (price) => {
        if (priceBand === 'all') return true;
        if (priceBand === 'under50') return (price || 0) < 50;
        if (priceBand === '50to200') return (price || 0) >= 50 && (price || 0) <= 200;
        return (price || 0) > 200;
    };

    const matchesVolumeBand = (volume) => {
        if (volumeBand === 'all') return true;
        if (volumeBand === 'high') return (volume || 0) >= 2000000;
        if (volumeBand === 'mid') return (volume || 0) >= 500000 && (volume || 0) < 2000000;
        return (volume || 0) < 500000;
    };

    const filteredStocks = stocks
        .filter(s => {
            const matchSearch = !search || s.symbol?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase());
            const matchSector = sectorFilter === 'all' || s.sector === sectorFilter;
            const matchMove = moveFilter === 'all' ||
                (moveFilter === 'gainers' && (s.change_pct || 0) > 0) ||
                (moveFilter === 'losers' && (s.change_pct || 0) < 0) ||
                (moveFilter === 'volatile' && Math.abs(s.change_pct || 0) >= 3);
            return matchSearch && matchSector && matchMove && matchesPriceBand(s.close) && matchesVolumeBand(s.volume);
        })
        .sort((a, b) => {
            const aVal = a[sortKey] || 0;
            const bVal = b[sortKey] || 0;
            return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ field }) => (
        <span className={`ml-1 text-[8px] ${sortKey === field ? 'text-[#10b981]' : 'text-[#64748b]'}`}>
            {sortKey === field ? (sortDir === 'desc' ? '▼' : '▲') : '⇅'}
        </span>
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-hero">
                <div className="page-hero-grid">
                    <div>
                        <div className="eyebrow-row">
                            <span className="eyebrow-badge">Precision screening</span>
                            <span className="eyebrow-note">Live market interrogation</span>
                        </div>
                        <h2>Stock <span className="gradient-text">Screener</span></h2>
                        <p>
                            Filter and analyze all {stocks.length} stocks listed on the Pakistan Stock Exchange with a workflow designed for rapid institutional review.
                        </p>
                    </div>
                    <div className="page-hero-side">
                        <div className="page-stat">
                            <strong>{filteredStocks.length}</strong>
                            <span>Visible matches</span>
                        </div>
                        <div className="page-stat">
                            <strong>{sectors.length || '--'}</strong>
                            <span>Sector filters</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters Bar - Improved Spacing */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 space-y-4"
            >
                <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(140px,1fr))_auto]">
                    {/* Search Input - Full Width on Mobile */}
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

                    {/* Sector Filter */}
                    <div className="relative lg:w-64">
                        <select
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all cursor-pointer"
                        >
                            <option value="all">All Sectors</option>
                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={moveFilter}
                            onChange={(e) => setMoveFilter(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all cursor-pointer"
                        >
                            <option value="all">All moves</option>
                            <option value="gainers">Gainers</option>
                            <option value="losers">Losers</option>
                            <option value="volatile">3%+ movers</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={priceBand}
                            onChange={(e) => setPriceBand(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all cursor-pointer"
                        >
                            <option value="all">All prices</option>
                            <option value="under50">Under Rs. 50</option>
                            <option value="50to200">Rs. 50-200</option>
                            <option value="over200">Above Rs. 200</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={volumeBand}
                            onChange={(e) => setVolumeBand(e.target.value)}
                            className="appearance-none w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#10b981] focus:bg-white/[0.05] transition-all cursor-pointer"
                        >
                            <option value="all">All volume</option>
                            <option value="high">High volume</option>
                            <option value="mid">Mid volume</option>
                            <option value="low">Low volume</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => {
                            setSearch('');
                            setSectorFilter('all');
                            setMoveFilter('all');
                            setPriceBand('all');
                            setVolumeBand('all');
                            setSortKey('change_pct');
                            setSortDir('desc');
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.05] transition-all whitespace-nowrap"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="text-sm font-semibold">Reset</span>
                    </button>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                    <div className="text-sm text-[#64748b]">
                        Showing <span className="text-white font-bold">{filteredStocks.length}</span> of <span className="text-white font-bold">{stocks.length}</span> stocks
                    </div>
                    <div className="text-xs text-[#64748b]">
                        Updated: <span className="text-white font-semibold">Just now</span>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            {loading ? (
                <div className="glass p-6 space-y-3">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/[0.02] rounded-lg animate-shimmer" />
                    ))}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="sticky left-0 bg-[#1a1d24] z-10">Symbol</th>
                                    <th className="hidden md:table-cell">Name</th>
                                    <th className="cursor-pointer select-none" onClick={() => toggleSort('close')}>Close <SortIcon field="close" /></th>
                                    <th className="cursor-pointer select-none" onClick={() => toggleSort('change')}>Change <SortIcon field="change" /></th>
                                    <th className="cursor-pointer select-none" onClick={() => toggleSort('change_pct')}>Change % <SortIcon field="change_pct" /></th>
                                    <th className="hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort('volume')}>Volume <SortIcon field="volume" /></th>
                                    <th className="hidden lg:table-cell">High</th>
                                    <th className="hidden lg:table-cell">Low</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-[#64748b] py-8">No PSX listings match the current screen.</td>
                                    </tr>
                                ) : filteredStocks.slice(0, 100).map((stock, i) => {
                                    const isUp = stock.change_pct > 0;
                                    const isDown = stock.change_pct < 0;
                                    return (
                                        <motion.tr
                                            key={stock.symbol}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                            className="cursor-pointer"
                                            onClick={() => navigate(`/stock/${stock.symbol}`)}
                                        >
                                            <td className="sticky left-0 bg-[#14161b] z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold ${isUp ? 'bg-[#10b981]/10 text-[#10b981]' : isDown ? 'bg-[#f43f5e]/10 text-[#f43f5e]' : 'bg-white/5 text-[#94a3b8]'}`}>
                                                        {stock.symbol?.slice(0, 2)}
                                                    </div>
                                                    <span className="font-semibold text-white">{stock.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell text-[#94a3b8] text-xs max-w-[200px] truncate">{stock.name}</td>
                                            <td className="font-mono font-semibold">Rs. {stock.close?.toFixed(2)}</td>
                                            <td className={`font-mono font-semibold ${isUp ? 'text-[#10b981]' : isDown ? 'text-[#f43f5e]' : 'text-[#94a3b8]'}`}>
                                                <span className="inline-flex items-center gap-1">
                                                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : isDown ? <ArrowDownRight className="w-3 h-3" /> : null}
                                                    {stock.change?.toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`signal-badge text-[10px] ${isUp ? 'signal-buy' : isDown ? 'signal-sell' : 'signal-hold'}`}>
                                                    {isUp ? '+' : ''}{stock.change_pct?.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell font-mono text-[#94a3b8]">{(stock.volume || 0).toLocaleString()}</td>
                                            <td className="hidden lg:table-cell font-mono text-[#94a3b8]">{stock.high?.toFixed(2)}</td>
                                            <td className="hidden lg:table-cell font-mono text-[#94a3b8]">{stock.low?.toFixed(2)}</td>
                                            <td>
                                                <button className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-lg hover:bg-[#10b981]/20 transition-colors">
                                                    Analyze
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
