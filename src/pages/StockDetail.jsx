import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Activity, Target, Shield, Layers, Sparkles, CircleDot, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass px-4 py-3 shadow-2xl shadow-black/40" style={{ minWidth: 160 }}>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-semibold mb-1">{label}</p>
            <p className="text-base font-bold font-mono text-white">Rs. {payload[0]?.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
    );
};

export default function StockDetail() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_BASE}/stocks/${symbol}/analysis`)
            .then(res => { setAnalysis(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [symbol]);

    if (loading) return (
        <div className="space-y-6">
            <div className="glass p-6 h-20 animate-shimmer" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="glass p-5 h-28 animate-shimmer" />)}
            </div>
            <div className="glass p-6 h-[400px] animate-shimmer" />
        </div>
    );

    if (!analysis) return (
        <div className="glass p-12 text-center">
            <p className="text-[#f43f5e] text-lg font-semibold mb-2">Analysis Unavailable</p>
            <p className="text-[#64748b] text-sm mb-4">Could not fetch data for {symbol}</p>
            <button onClick={() => navigate(-1)} className="text-sm text-[#10b981]">← Go Back</button>
        </div>
    );

    const isUp = analysis.change >= 0;
    const isBuy = analysis.recommendation?.includes('BUY');
    const isSell = analysis.recommendation?.includes('SELL');
    const smaPos = analysis.latest_price > (analysis.sma_20 || 0) ? 'above' : 'below';

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-hero">
                <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-[#64748b] hover:text-white mb-3 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <div className="eyebrow-row">
                        <span className="eyebrow-badge">Security workspace</span>
                        <span className="eyebrow-note">Single-name deep dive</span>
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-extrabold text-white">{analysis.symbol}</h2>
                        <span className={`signal-badge ${isUp ? 'signal-buy' : 'signal-sell'}`}>
                            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isUp ? '+' : ''}{analysis.change_pct?.toFixed(2)}%
                        </span>
                    </div>
                    <p className="text-[#64748b] text-sm">Sector: {analysis.sector} · PSX</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-extrabold font-mono text-white">Rs. {analysis.latest_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-sm font-semibold ${isUp ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>{isUp ? '+' : ''}{analysis.change?.toFixed(2)} PKR</p>
                </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Open', value: `Rs. ${analysis.open?.toFixed(2)}`, icon: Target, color: 'emerald' },
                    { label: 'High / Low', value: `${analysis.high?.toFixed(2)} / ${analysis.low?.toFixed(2)}`, icon: Activity, color: 'blue' },
                    { label: 'Volume', value: (analysis.volume || 0).toLocaleString(), icon: BarChart3, color: 'purple' },
                    { label: 'LDCP', value: `Rs. ${analysis.ldcp?.toFixed(2)}`, icon: Layers, color: 'amber' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color === 'emerald' ? 'bg-[#10b981]/10' : s.color === 'blue' ? 'bg-[#3b82f6]/10' : s.color === 'purple' ? 'bg-[#8b5cf6]/10' : 'bg-[#f59e0b]/10'}`}>
                            <s.icon className={`w-4 h-4 ${s.color === 'emerald' ? 'text-[#10b981]' : s.color === 'blue' ? 'text-[#3b82f6]' : s.color === 'purple' ? 'text-[#8b5cf6]' : 'text-[#f59e0b]'}`} />
                        </div>
                        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{s.label}</p>
                        <p className="text-lg font-bold font-mono text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chart + Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Price History (60 days)</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analysis.historical_data}>
                                <defs>
                                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.25} />
                                        <stop offset="100%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="Date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                                <RechartsTooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="Close" stroke={isUp ? '#10b981' : '#f43f5e'} strokeWidth={2.5} fillOpacity={1} fill="url(#pg)" dot={false} activeDot={{ r: 5, fill: isUp ? '#10b981' : '#f43f5e', stroke: '#0a0b0d', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    {/* AI Signal */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className={`glass p-6 relative overflow-hidden ${isBuy ? 'glow-emerald' : isSell ? 'glow-rose' : 'glow-blue'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className={`w-4 h-4 ${isBuy ? 'text-[#10b981]' : isSell ? 'text-[#f43f5e]' : 'text-[#3b82f6]'}`} />
                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">AI Recommendation</span>
                        </div>
                        <div className={`signal-badge mb-3 ${isBuy ? 'signal-buy' : isSell ? 'signal-sell' : 'signal-hold'}`}>
                            <CircleDot className="w-3 h-3" /> {analysis.recommendation}
                        </div>
                        <p className="text-xs text-[#94a3b8]">Confidence: <span className="text-white font-bold">{analysis.confidence_score}%</span></p>
                    </motion.div>

                    {/* Technical Details */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5">
                        <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] mb-4">Technical Indicators</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'RSI (14)', value: analysis.rsi?.toFixed(2), color: analysis.rsi < 30 ? '#10b981' : analysis.rsi > 70 ? '#f43f5e' : '#3b82f6' },
                                { label: 'SMA 20', value: analysis.sma_20?.toFixed(2), color: '#8b5cf6' },
                                { label: 'SMA 50', value: analysis.sma_50?.toFixed(2), color: '#06b6d4' },
                                { label: 'MACD', value: analysis.macd?.toFixed(4), color: analysis.macd_histogram > 0 ? '#10b981' : '#f43f5e' },
                            ].map((ind, j) => (
                                <div key={j} className="flex items-center justify-between">
                                    <span className="text-xs text-[#94a3b8]">{ind.label}</span>
                                    <span className="text-sm font-mono font-bold" style={{ color: ind.color }}>{ind.value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Reasons */}
                    {analysis.reasons?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-5">
                            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] mb-3">Analysis Reasoning</h4>
                            <div className="space-y-2">
                                {analysis.reasons.map((r, j) => (
                                    <p key={j} className="text-xs text-[#94a3b8] flex items-start gap-2">
                                        <span className="text-[#10b981] mt-0.5">•</span> {r}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
