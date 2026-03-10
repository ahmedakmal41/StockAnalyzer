import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

export default function Sectors() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSector, setExpandedSector] = useState(null);

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

            {loading ? (
                <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="glass p-6 h-24 animate-shimmer" />)}</div>
            ) : (
                <div className="space-y-3">
                    {sectors.map((sector, i) => {
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
