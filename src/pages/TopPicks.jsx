import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, ArrowUpRight, Target, Zap, Crown, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

export default function TopPicks() {
    const navigate = useNavigate();
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPicks();
    }, []);

    const fetchPicks = async () => {
        try {
            const res = await axios.get(`${API_BASE}/stocks/top-picks?limit=20`);
            setPicks(res.data.picks || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-hero">
                <div className="page-hero-grid">
                    <div>
                        <div className="eyebrow-row">
                            <span className="eyebrow-badge">AI curated</span>
                            <span className="eyebrow-note">Priority queue for opportunity review</span>
                        </div>
                        <h2>Top <span className="gradient-text">Picks</span></h2>
                        <p>
                            Stocks ranked by our proprietary Profit Index algorithm, blending momentum, price action, and volume analysis into a concise decision list.
                        </p>
                    </div>
                    <div className="page-hero-side">
                        <div className="page-stat">
                            <strong>{picks.length || '--'}</strong>
                            <span>Active picks</span>
                        </div>
                        <div className="page-stat">
                            <strong>7-point</strong>
                            <span>Scoring framework</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profit Index Explanation */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 flex flex-wrap gap-8">
                {[
                    { icon: TrendingUp, label: 'Momentum', desc: 'Price trend direction and strength', color: '#10b981' },
                    { icon: Target, label: 'Price Action', desc: 'Position within daily trading range', color: '#3b82f6' },
                    { icon: Zap, label: 'Volume', desc: 'Trading volume vs. average', color: '#8b5cf6' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                            <item.icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">{item.label}</p>
                            <p className="text-[10px] text-[#64748b]">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Picks Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass p-6 h-48 animate-shimmer" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {picks.map((stock, i) => {
                        const isUp = stock.change_pct > 0;
                        const score = stock.profit_score || 0;
                        const scoreColor = score >= 5 ? '#10b981' : score >= 3 ? '#3b82f6' : '#f59e0b';
                        return (
                            <motion.div
                                key={stock.symbol}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                onClick={() => navigate(`/stock/${stock.symbol}`)}
                                className="glass glass-hover p-6 cursor-pointer group relative overflow-hidden"
                            >
                                {/* Rank Badge */}
                                {i < 3 && (
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: i === 0 ? '#f59e0b20' : i === 1 ? '#94a3b820' : '#f9731620', color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316' }}>
                                        #{i + 1}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                                        {stock.symbol?.slice(0, 3)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">{stock.symbol}</p>
                                        <p className="text-[10px] text-[#64748b] truncate max-w-[150px]">{stock.name || stock.sector}</p>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider mb-1">Price</p>
                                        <p className="text-xl font-bold font-mono text-white">Rs. {stock.close?.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`signal-badge ${isUp ? 'signal-buy' : 'signal-sell'}`}>
                                            {isUp ? <ArrowUpRight className="w-3 h-3" /> : null}
                                            {isUp ? '+' : ''}{stock.change_pct?.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Score Bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Profit Index</span>
                                        <span className="text-xs font-bold font-mono" style={{ color: scoreColor }}>{score}/7</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(score / 7) * 100}%` }}
                                            transition={{ delay: i * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: scoreColor }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 mt-4 text-[10px] text-[#64748b] group-hover:text-[#10b981] transition-colors">
                                    View Analysis <ChevronRight className="w-3 h-3" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
