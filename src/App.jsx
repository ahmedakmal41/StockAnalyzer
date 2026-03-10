import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Screener from './pages/Screener';
import Sectors from './pages/Sectors';
import StockDetail from './pages/StockDetail';
import TopPicks from './pages/TopPicks';

const API_BASE = 'https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net';

const routeMeta = {
  '/': {
    eyebrow: 'Market command center',
    title: 'Decisions built for professional capital allocation.',
    description:
      'Unify market breadth, watchlists, sector rotation, and AI-assisted signals in one operational surface.',
  },
  '/screener': {
    eyebrow: 'Discovery engine',
    title: 'Screen the market with speed and institutional clarity.',
    description:
      'Move from broad opportunity scans to precise stock-level decisions with live filters and ranked tables.',
  },
  '/top-picks': {
    eyebrow: 'Signal prioritization',
    title: 'Focus attention on the highest-conviction setups first.',
    description:
      'Rank opportunities by momentum, price action, and flow so teams can act on the strongest names quickly.',
  },
  '/sectors': {
    eyebrow: 'Rotation intelligence',
    title: 'Track sector leadership and capital movement in real time.',
    description:
      'Compare participation, volatility, and liquidity trends across the exchange from a single view.',
  },
  '/learn': {
    eyebrow: 'Capability enablement',
    title: 'Equip every stakeholder with a common analytical language.',
    description:
      'Turn complex market concepts into structured guidance for global teams, analysts, and new operators.',
  },
};

const shellMetrics = [
  { label: 'Latency', value: '<120ms', hint: 'signal response' },
  { label: 'Coverage', value: '480+', hint: 'listed symbols' },
  { label: 'Workflows', value: '6', hint: 'decision surfaces' },
];

const floatingOrbs = [
  { size: 440, left: '-6%', top: '-8%', className: 'orb-a' },
  { size: 320, right: '8%', top: '14%', className: 'orb-b' },
  { size: 360, left: '18%', bottom: '8%', className: 'orb-c' },
];

const FloatingBackdrop = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute inset-0 bg-noise opacity-40" />
    {floatingOrbs.map((orb, index) => (
      <motion.div
        key={index}
        className={`ambient-orb ${orb.className}`}
        style={orb}
        animate={{ y: [0, -22, 0], x: [0, 16, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16 + index * 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const SearchModal = ({ open, onClose, stocks, onSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 90);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filtered = stocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-start justify-center bg-[#04111d]/70 px-4 pt-[12vh] backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="enterprise-panel w-full max-w-3xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/8 bg-white/4 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="icon-shell">
                  <Search className="h-4 w-4 text-[var(--color-accent-teal)]" />
                </div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a symbol, team watchlist, or company name"
                  className="flex-1 bg-transparent text-base font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                />
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/8 bg-white/4 p-2 text-[var(--color-text-muted)] transition hover:border-white/16 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--color-text-secondary)]">
                <span className="pill-badge">Press `/` to open</span>
                <span className="pill-badge">Enter to inspect</span>
                <span className="pill-badge">Global symbol coverage</span>
              </div>
            </div>

            <div className="max-h-[440px] overflow-y-auto p-3">
              {filtered.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/2 px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">
                  No matching symbols found.
                </div>
              ) : (
                filtered.map((stock, index) => (
                  <motion.button
                    key={stock}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      onSelect(stock);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="symbol-mark">{stock.slice(0, 2)}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{stock}</div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Open analysis workspace</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
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

const GlobalStatsBar = ({ summary }) => {
  if (!summary) {
    return (
      <div className="relative z-20 border-b border-white/6 bg-black/10 px-6 py-3 backdrop-blur-xl lg:px-12">
        <div className="mx-auto h-10 w-full max-w-[1600px] animate-pulse rounded-full bg-white/6" />
      </div>
    );
  }

  const sentimentTone =
    summary.market_sentiment === 'Bullish'
      ? 'is-positive'
      : summary.market_sentiment === 'Bearish'
        ? 'is-negative'
        : 'is-neutral';

  return (
    <div className="relative z-20 border-b border-white/6 bg-black/15 px-6 py-3 backdrop-blur-xl lg:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <div className="ticker-chip">
          <span>Universe</span>
          <strong>480+ symbols</strong>
        </div>
        <div className={`ticker-chip ${sentimentTone}`}>
          <span>Sentiment</span>
          <strong>{summary.market_sentiment}</strong>
        </div>
        <div className="ticker-chip">
          <span>Volume</span>
          <strong>{(summary.total_volume / 1e6).toFixed(1)}M</strong>
        </div>
        <div className="ticker-chip">
          <span>Advance / Decline</span>
          <strong>
            {summary.gainers} / {summary.losers}
          </strong>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] lg:flex">
          <span className="status-dot" />
          Live market link active
        </div>
      </div>
    </div>
  );
};

const ShellHero = ({ summary }) => {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || {
    eyebrow: 'Security workspace',
    title: 'Inspect a single name with complete market context.',
    description: 'Move from trend detection to detailed technical reasoning without leaving the workspace.',
  };

  return (
    <section className="relative z-10 px-6 pt-8 lg:px-12 lg:pt-10">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="hero-panel"
        >
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow-badge">{meta.eyebrow}</span>
              <span className="eyebrow-separator" />
              <span className="eyebrow-note">Global-ready operating model</span>
            </div>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
          </div>

          <div className="hero-actions">
            <div className="hero-callout">
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent-teal)]" />
              Trusted data surfaces for cross-border analyst workflows
            </div>
            <div className="metric-row">
              {shellMetrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <em>{metric.hint}</em>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="insight-rail"
        >
          <div className="rail-header">
            <div>
              <span className="eyebrow-badge">Operations snapshot</span>
              <h2>Executive market pulse</h2>
            </div>
            <Sparkles className="h-5 w-5 text-[var(--color-accent-gold)]" />
          </div>
          <div className="rail-grid">
            <div className="rail-stat">
              <span>Market stance</span>
              <strong>{summary?.market_sentiment || 'Syncing'}</strong>
            </div>
            <div className="rail-stat">
              <span>Gainers</span>
              <strong>{summary?.gainers ?? '--'}</strong>
            </div>
            <div className="rail-stat">
              <span>Losers</span>
              <strong>{summary?.losers ?? '--'}</strong>
            </div>
            <div className="rail-stat">
              <span>Regional posture</span>
              <strong>APAC-ready</strong>
            </div>
          </div>
          <div className="rail-foot">
            <Globe2 className="h-4 w-4 text-[var(--color-accent-cyan)]" />
            Designed for analyst teams, investment desks, and enterprise reporting layers.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AppShell = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then((response) => setStocks(response.data.stocks || [])).catch(() => {});
    axios.get(`${API_BASE}/stocks/market-summary`).then((response) => setSummary(response.data)).catch(() => {});

    const handleScroll = () => setScrolled(window.scrollY > 18);
    const handleKeydown = (event) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Screener', path: '/screener', icon: Search },
    { label: 'Top Picks', path: '/top-picks', icon: ArrowUpRight },
    { label: 'Sectors', path: '/sectors', icon: Activity },
    { label: 'Learn', path: '/learn', icon: Sparkles },
  ];

  return (
    <div className="app-shell">
      <FloatingBackdrop />
      <GlobalStatsBar summary={summary} />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        stocks={stocks}
        onSelect={(stock) => navigate(`/stock/${stock}`)}
      />

      <motion.nav
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 px-6 py-4 transition duration-300 lg:px-12 ${scrolled ? 'is-stuck' : ''}`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 rounded-[28px] border border-white/8 bg-black/18 px-4 py-3 backdrop-blur-2xl lg:px-6">
          <NavLink to="/" className="brand-lockup">
            <div className="brand-mark">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="brand-title">PSX Atlas</div>
              <div className="brand-subtitle">Enterprise market intelligence</div>
            </div>
          </NavLink>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="action-button muted hidden sm:flex">
              <Search className="h-4 w-4" />
              Search
              <span className="shortcut-key">/</span>
            </button>
            <button className="action-button primary hidden md:flex">
              <ShieldCheck className="h-4 w-4" />
              Enterprise Access
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-[1600px] gap-2 overflow-x-auto xl:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-pill compact ${isActive ? 'active' : ''}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </motion.nav>

      <ShellHero summary={summary} />

      <main className="relative z-10 px-6 pb-10 pt-8 lg:px-12">
        <div className="mx-auto max-w-[1600px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/top-picks" element={<TopPicks />} />
            <Route path="/sectors" element={<Sectors />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
          </Routes>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-12 pt-10 lg:px-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 rounded-[28px] border border-white/8 bg-black/14 px-6 py-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="brand-mark is-footer">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="brand-title">PSX Atlas</div>
              <div className="brand-subtitle">Built for regional exchanges, global operating standards, and enterprise rollout.</div>
            </div>
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            Informational use only. Validate investment decisions against internal policy, compliance controls, and live exchange data.
          </div>
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
