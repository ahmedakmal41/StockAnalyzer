import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, ChevronRight, X } from 'lucide-react';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Screener from './pages/Screener';
import TopPicks from './pages/TopPicks';
import Sectors from './pages/Sectors';
import Learn from './pages/Learn';
import StockDetail from './pages/StockDetail';

const API_BASE = "https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net";

/* ============================================= */
/*  ANIMATED BACKGROUND PARTICLES                */
/* ============================================= */
const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full animate-float"
        style={{
          width: `${Math.random() * 300 + 100}px`,
          height: `${Math.random() * 300 + 100}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 2 === 0
            ? 'radial-gradient(circle, rgba(0,230,138,0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79,140,255,0.03) 0%, transparent 70%)',
          animationDelay: `${i * 2}s`,
          animationDuration: `${12 + i * 3}s`,
        }}
      />
    ))}
  </div>
);

/* ============================================= */
/*  SEARCH MODAL                                  */
/* ============================================= */
const SearchModal = ({ open, onClose, stocks, onSelect }) => {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 100); } }, [open]);

  const filtered = stocks.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl glass overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-transparent">
              <Search className="w-5 h-5 text-[#10b981]" />
              <input
                ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search any PSX symbol..."
                className="flex-1 bg-transparent text-white text-base font-medium outline-none placeholder:text-[#64748b]"
              />
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[#64748b] hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[450px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-[#64748b] text-sm">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No stocks found</p>
                </div>
              ) : (
                filtered.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => { onSelect(s); onClose(); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.05] transition-all group border-b border-white/[0.03] last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#3b82f6]/20 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[#10b981] group-hover:from-[#10b981] group-hover:to-[#3b82f6] group-hover:text-white transition-all shadow-lg">
                        {s.slice(0, 2)}
                      </div>
                      <span className="font-bold text-base text-white group-hover:text-[#10b981] transition-colors">{s}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#64748b] group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================= */
/*  GLOBAL STATS BAR                             */
/* ============================================= */
const GlobalStatsBar = ({ summary }) => {
  if (!summary) return (
    <div className="h-10 bg-gradient-to-r from-[#0a0b0d] via-[#0f1114] to-[#0a0b0d] border-b border-white/[0.05] flex items-center justify-center">
      <div className="w-1/2 h-2 bg-white/5 rounded-full animate-pulse" />
    </div>
  );

  return (
    <div className="h-10 bg-gradient-to-r from-[#0a0b0d] via-[#0f1114] to-[#0a0b0d] border-b border-white/[0.08] flex items-center px-6 lg:px-10 gap-8 overflow-x-auto no-scrollbar whitespace-nowrap z-[60] relative shadow-lg">
      <div className="flex items-center gap-2 cursor-default group">
        <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">Symbols:</span>
        <span className="text-[11px] text-[#10b981] font-mono font-extrabold tracking-tight group-hover:text-[#34d399] transition-colors">480+</span>
      </div>
      <div className="flex items-center gap-2 cursor-default group">
        <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">Market Sentiment:</span>
        <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md transition-all ${summary.market_sentiment === 'Bullish' ? 'text-[#34d399] bg-[#10b981]/15 border border-[#10b981]/30' :
          summary.market_sentiment === 'Bearish' ? 'text-[#fb7185] bg-[#f43f5e]/15 border border-[#f43f5e]/30' :
            'text-[#60a5fa] bg-[#3b82f6]/15 border border-[#3b82f6]/30'
          }`}>
          {summary.market_sentiment}
        </span>
      </div>
      <div className="flex items-center gap-2 cursor-default group">
        <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">24h Vol:</span>
        <span className="text-[11px] text-[#f8fafc] font-mono font-extrabold group-hover:text-[#10b981] transition-colors">{(summary.total_volume / 1e6).toFixed(1)}M</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">Gainers:</span>
          <span className="text-[11px] text-[#34d399] font-mono font-extrabold">{summary.gainers}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">Losers:</span>
          <span className="text-[11px] text-[#fb7185] font-mono font-extrabold">{summary.losers}</span>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2 cursor-default ml-auto">
        <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em]">Status:</span>
        <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-lg shadow-[#10b981]/50" />
        <span className="text-[11px] text-[#f8fafc] font-extrabold tracking-wide">Market Open</span>
      </div>
    </div>
  );
};


/* ============================================= */
/*  APP SHELL with ROUTER                         */
/* ============================================= */
const AppShell = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then(res => setStocks(res.data.stocks || [])).catch(() => { });
    axios.get(`${API_BASE}/stocks/market-summary`).then(res => setSummary(res.data)).catch(() => { });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleKey = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Screener', path: '/screener' },
    { label: 'Top Picks', path: '/top-picks' },
    { label: 'Sectors', path: '/sectors' },
    { label: 'Learn', path: '/learn' },
  ];

  return (
    <div className="min-h-screen w-full bg-grid bg-radial-glow relative">
      <FloatingParticles />
      <GlobalStatsBar summary={summary} />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        stocks={stocks}
        onSelect={(s) => navigate(`/stock/${s}`)}
      />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0b0d]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/40' : 'bg-transparent'}`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8 px-6 lg:px-12 py-5">
          {/* Logo - Fixed Width */}
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#3b82f6] rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center shadow-xl shadow-[#10b981]/30 group-hover:scale-105 transition-transform">
                <Activity className="text-white w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">PSX <span className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">Pro</span></h1>
              <p className="text-[8px] font-bold text-[#64748b] uppercase tracking-[0.25em] mt-0.5">Intelligence</p>
            </div>
          </NavLink>

          {/* Navigation - Centered with proper spacing */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/[0.12]' 
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Actions - Fixed Width */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#94a3b8] text-xs font-semibold hover:border-white/[0.15] hover:text-white hover:bg-white/[0.05] transition-all duration-300 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline">Search</span>
            </button>
            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white text-[12px] font-bold shadow-lg shadow-[#10b981]/20 hover:shadow-xl hover:shadow-[#10b981]/30 transition-all duration-500 whitespace-nowrap relative overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
            <div className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.15] transition-all">
              <Activity className="w-5 h-5 text-[#94a3b8]" />
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden overflow-x-auto border-t border-white/[0.08] bg-[#0f1114]/50 backdrop-blur-xl">
          <div className="flex px-4 py-3 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${isActive ? 'text-white bg-gradient-to-br from-white/10 to-white/5' : 'text-[#64748b] hover:text-white hover:bg-white/5'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Page Content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/top-picks" element={<TopPicks />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-[#0a0b0d]/50 py-12">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-white">PSX Pro</span>
              <p className="text-[10px] text-[#64748b] font-semibold">Intelligence Analytics Platform</p>
            </div>
          </div>
          <p className="text-[11px] text-[#64748b] text-center md:text-right max-w-md leading-relaxed">
            Data provided for informational purposes only. Not financial advice. Invest at your own risk.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
