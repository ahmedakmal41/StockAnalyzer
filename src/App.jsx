import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Gauge,
  GraduationCap,
  Home,
  LineChart,
  LogOut,
  Megaphone,
  Moon,
  Newspaper,
  Play,
  Search,
  Sparkles,
  Star,
  Sun,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Portfolio from './pages/Portfolio';
import Screener from './pages/Screener';
import Sectors from './pages/Sectors';
import StockDetail from './pages/StockDetail';
import TopPicks from './pages/TopPicks';
import Watchlist from './pages/Watchlist';
import { apiRequest, getToken, setToken } from './lib/localApi';

const API_BASE = 'https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net';

const sidebarSections = [
  {
    label: 'Dashboard',
    icon: Home,
    items: [{ label: 'Dashboard', path: '/' }],
  },
  {
    label: 'Watchlist',
    icon: Star,
    items: [{ label: 'Watchlist', path: '/watchlist' }],
  },
  {
    label: 'Market',
    icon: Activity,
    items: [
      { label: 'All Stocks', path: '/screener' },
      { label: 'KSE-100', path: '/screener' },
      { label: 'KSE-30', path: '/screener' },
      { label: 'KMI-30', path: '/screener' },
      { label: 'Watchlist', path: '/watchlist' },
      { label: 'Sectors', path: '/sectors' },
    ],
  },
  {
    label: 'Learn',
    icon: GraduationCap,
    badge: 'New',
    items: [
      { label: 'Courses', path: '/learn' },
      { label: 'Lessons', path: '/learn' },
      { label: 'AI Tutor', path: '/learn' },
      { label: 'Glossary', path: '/learn' },
    ],
  },
  {
    label: 'AI Tools',
    icon: Sparkles,
    items: [
      { label: 'Stock Screener', path: '/screener' },
      { label: 'AI Stock Picks', path: '/top-picks' },
      { label: 'Portfolio Analyzer', path: '/portfolio' },
      { label: 'Risk Calculator', path: '/portfolio' },
    ],
  },
  {
    label: 'Portfolio',
    icon: Briefcase,
    items: [
      { label: 'My Portfolio', path: '/portfolio' },
      { label: 'Transactions', path: '/portfolio' },
      { label: 'Performance', path: '/portfolio' },
    ],
  },
  {
    label: 'News & Insights',
    icon: Newspaper,
    items: [
      { label: 'Market News', path: '/' },
      { label: 'Announcements', path: '/' },
      { label: 'Research Reports', path: '/' },
    ],
  },
  {
    label: 'More',
    icon: CircleHelp,
    items: [
      { label: 'Settings', path: '/' },
      { label: 'Help Center', path: '/' },
      { label: 'About Us', path: '/' },
    ],
  },
];

const SearchModal = ({ open, onClose, stocks, onSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filtered = stocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-[#020812]/75 px-4 pt-[12vh] backdrop-blur-xl"
          onClick={onClose}
        >
          <div
            className="app-card w-full max-w-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-4">
              <Search className="h-5 w-5 text-[var(--ui-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stocks, companies or topics..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[var(--ui-muted)]"
              />
              <button className="icon-button" onClick={onClose} aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-[var(--ui-muted)]">No matching symbols found.</div>
              ) : (
                filtered.map((stock) => (
                  <button
                    key={stock}
                    onClick={() => {
                      onSelect(stock);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                  >
                    <span className="font-semibold">{stock}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--ui-muted)]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Brand = () => (
  <NavLink to="/" className="app-brand">
    <div className="brand-chart">
      <LineChart className="h-5 w-5" />
    </div>
    <div>
      <div className="app-brand-name">Invest<span>AI</span>PK</div>
      <div className="app-brand-tagline">Learn. Invest. Grow.</div>
    </div>
  </NavLink>
);

const Sidebar = ({ open, onClose }) => (
  <>
    <button className={`sidebar-backdrop ${open ? 'is-visible' : ''}`} onClick={onClose} aria-label="Close menu" />
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
      <Brand />
      <nav className="sidebar-nav">
        {sidebarSections.map((section) => (
          <div key={section.label} className="sidebar-section">
            <NavLink
              to={section.items[0].path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-section-button ${isActive && section.label === 'Dashboard' ? 'is-active' : ''}`}
            >
              <section.icon className="h-4 w-4" />
              <span>{section.label}</span>
              {section.badge ? <em>{section.badge}</em> : null}
              {section.items.length > 1 ? <ChevronDown className="ml-auto h-4 w-4" /> : null}
            </NavLink>
            {section.items.length > 1 ? (
              <div className="sidebar-subnav">
                {section.items.map((item) => (
                  <NavLink key={`${section.label}-${item.label}`} to={item.path} onClick={onClose}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="theme-toggle">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4 text-[#d7bb87]" />
        <span>Dark Mode</span>
      </div>
    </aside>
  </>
);

const AuthModal = ({ open, onClose, onAuthenticated }) => {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await apiRequest(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setToken(data.token);
      onAuthenticated(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <form className="auth-card" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button auth-close" onClick={onClose} aria-label="Close account form">
          <X className="h-4 w-4" />
        </button>
        <div className="auth-icon"><UserPlus className="h-5 w-5" /></div>
        <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
        <p>Save favorite stocks, build a portfolio, and track profit signals locally.</p>
        {mode === 'signup' ? (
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" />
          </label>
        ) : null}
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" type="email" />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" type="password" />
        </label>
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="primary-cta auth-submit" type="submit">{mode === 'signup' ? 'Sign Up' : 'Sign In'}</button>
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setError('');
            setMode(mode === 'signup' ? 'login' : 'signup');
          }}
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </form>
    </div>
  );
};

const TopBar = ({ summary, onSearch, onMenu, user, onAuthClick, onLogout }) => (
  <header className="app-topbar">
    <button className="icon-button lg:hidden" onClick={onMenu} aria-label="Open menu">
      <Gauge className="h-4 w-4" />
    </button>
    <button className="top-search" onClick={onSearch}>
      <span>Search stocks, companies or topics...</span>
      <Search className="h-4 w-4" />
    </button>
    <div className="index-chip">
      <div>
        <strong>KSE-100</strong>
        <span>Market Open · 10:35 AM PKT</span>
      </div>
      <div>
        <strong>{summary?.kse100?.toLocaleString?.() || '70,123.45'}</strong>
        <span className="positive">+512.35 (0.74%)</span>
      </div>
    </div>
    <button className="icon-button" aria-label="Notifications">
      <Bell className="h-4 w-4" />
    </button>
    <button className="profile-button" onClick={user ? undefined : onAuthClick} aria-label="Profile">
      <User className="h-4 w-4" />
      <span>{user?.name?.slice(0, 2).toUpperCase() || 'UP'}</span>
      <strong>{user?.name || 'Sign Up'}</strong>
    </button>
    {user ? (
      <button className="icon-button" onClick={onLogout} aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </button>
    ) : (
      <button className="icon-button" onClick={onAuthClick} aria-label="Sign up">
        <ChevronDown className="h-4 w-4" />
      </button>
    )}
  </header>
);

const MiniChart = () => (
  <svg viewBox="0 0 280 88" className="mini-chart" role="img" aria-label="Market trend">
    <path d="M2 68 C26 52 32 45 47 48 C65 50 71 23 88 32 C105 40 112 65 132 60 C150 56 153 31 171 35 C188 39 197 22 213 20 C231 19 232 41 249 36 C263 33 268 24 278 23" />
    <circle cx="213" cy="20" r="3" />
  </svg>
);

const RightRail = ({ summary }) => {
  const gainers = summary?.gainers ?? 0;
  const losers = summary?.losers ?? 0;
  const sentiment = gainers >= losers ? 'positive momentum' : 'mixed participation';

  return (
    <aside className="right-rail">
      <section className="app-card rail-card">
        <div className="rail-card-header">
          <h3>Market Overview</h3>
          <button>View All <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        {[
          ['KSE-100', '70,123.45', '+512.35 (0.74%)'],
          ['KSE-30', '21,456.78', '+156.23 (0.73%)'],
          ['KMI-30', '110,234.67', '+812.45 (0.74%)'],
          ['All Shares', '45,678.90', '+245.67 (0.54%)'],
        ].map(([name, value, change]) => (
          <div key={name} className="market-line">
            <span>{name}</span>
            <strong>{value}</strong>
            <em>{change}</em>
          </div>
        ))}
        <MiniChart />
        <div className="range-tabs">
          {['1D', '1W', '1M', '3M', '1Y', 'YTD'].map((range) => <button key={range}>{range}</button>)}
        </div>
      </section>

      <section className="app-card rail-card">
        <div className="rail-card-header">
          <h3>AI Market Insight</h3>
          <span className="ai-orb">AI</span>
        </div>
        <p className="rail-copy">The market is showing {sentiment} with buying interest across liquid PSX names.</p>
        <div className="sector-chips">
          <span>Banks +1.24%</span>
          <span>Fertilizer +1.08%</span>
          <span>Oil & Gas +0.85%</span>
        </div>
        <button className="link-button">View Full Insight <ArrowUpRight className="h-3.5 w-3.5" /></button>
      </section>

      <section className="app-card rail-card">
        <div className="rail-card-header">
          <h3>Continue Learning</h3>
          <button>View All <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        {[
          [BookOpen, 'Stock Market Basics', '5 Lessons', '60%'],
          [LineChart, 'Technical Analysis', '8 Lessons', '35%'],
          [Building2, 'Fundamental Analysis', '6 Lessons', '20%'],
        ].map(([Icon, title, meta, progress]) => (
          <div key={title} className="learning-row">
            <div className="learning-icon">{React.createElement(Icon, { className: 'h-4 w-4' })}</div>
            <div>
              <strong>{title}</strong>
              <span>{meta}</span>
              <i style={{ width: progress }} />
            </div>
            <button aria-label={`Continue ${title}`}><Play className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </section>

      <section className="app-card rail-card">
        <div className="rail-card-header">
          <h3>Announcements</h3>
          <button>View All <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="announcement">
          <Megaphone className="h-5 w-5" />
          <div>
            <strong>PSX Holiday Notice</strong>
            <p>Market will remain closed on the announced exchange holiday.</p>
          </div>
        </div>
      </section>
    </aside>
  );
};

const AppShell = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/stocks`).then((response) => setStocks(response.data.stocks || [])).catch(() => {});
    axios.get(`${API_BASE}/stocks/market-summary`).then((response) => setSummary(response.data)).catch(() => {});
    if (getToken()) {
      apiRequest('/api/me').then((data) => setUser(data.user)).catch(() => setToken(null));
    }

    const handleKeydown = (event) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="workspace-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="workspace-body">
        <TopBar
          summary={summary}
          onSearch={() => setSearchOpen(true)}
          onMenu={() => setSidebarOpen(true)}
          user={user}
          onAuthClick={() => setAuthOpen(true)}
          onLogout={() => {
            setToken(null);
            setUser(null);
          }}
        />
        <div className="workspace-grid">
          <main className="workspace-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/screener" element={<Screener />} />
              <Route path="/portfolio" element={<Portfolio authUser={user} />} />
              <Route path="/watchlist" element={<Watchlist authUser={user} />} />
              <Route path="/top-picks" element={<TopPicks />} />
              <Route path="/sectors" element={<Sectors />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/stock/:symbol" element={<StockDetail />} />
            </Routes>
          </main>
          <RightRail summary={summary} />
        </div>
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        stocks={stocks}
        onSelect={(stock) => navigate(`/stock/${stock}`)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={setUser} />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
