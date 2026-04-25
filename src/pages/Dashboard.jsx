import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Bot,
    ChevronDown,
    Download,
    Filter,
    LineChart,
    PieChart,
    Search,
    Sparkles,
    Star,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net';

const indexTabs = ['All Stocks', 'KSE-100', 'KSE-30', 'KMI-30'];

const featureCards = [
    {
        title: 'Learn to Invest',
        copy: 'Step-by-step courses for beginners to advanced investors.',
        action: 'Start Learning',
        icon: BookOpen,
        path: '/learn',
    },
    {
        title: 'AI Stock Picks',
        copy: 'AI analyzes thousands of data points to find the best opportunities.',
        action: 'View Picks',
        icon: Sparkles,
        path: '/top-picks',
    },
    {
        title: 'Market Overview',
        copy: 'Real-time data and insights on Pakistan Stock Exchange.',
        action: 'Explore Market',
        icon: LineChart,
        path: '/screener',
    },
    {
        title: 'Track Portfolio',
        copy: 'Monitor your investments and performance in real time.',
        action: 'View Portfolio',
        icon: PieChart,
        path: '/portfolio',
    },
];

const formatNumber = (value) => {
    if (!Number.isFinite(value)) return '--';
    if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    return value.toLocaleString();
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [marketWatch, setMarketWatch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');
    const [marketStatus, setMarketStatus] = useState('open');
    const [activeTab, setActiveTab] = useState('All Stocks');

    useEffect(() => {
        const fetchMarketWatch = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE}/stocks/market-watch`);
                setMarketWatch(response.data.data || []);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        fetchMarketWatch();
    }, []);

    const sectors = useMemo(
        () => [...new Set(marketWatch.map((stock) => stock.sector).filter(Boolean))].sort(),
        [marketWatch],
    );

    const filteredStocks = useMemo(() => {
        return marketWatch
            .filter((stock) => {
                const matchesSearch = !search ||
                    stock.symbol?.toLowerCase().includes(search.toLowerCase()) ||
                    stock.name?.toLowerCase().includes(search.toLowerCase());
                const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter;
                return matchesSearch && matchesSector;
            })
            .sort((a, b) => (b.volume || 0) - (a.volume || 0));
    }, [marketWatch, search, sectorFilter]);

    return (
        <div className="dashboard-screen">
            <section className="ai-hero">
                <div className="ai-hero-copy">
                    <h1>Invest Smarter with <span>AI</span></h1>
                    <p>Learn, analyze and invest in Pakistan Stock Market with the power of AI.</p>
                    <div className="hero-actions-row">
                        <button onClick={() => navigate('/learn')} className="primary-cta">Start Learning</button>
                        <button onClick={() => navigate('/screener')} className="secondary-cta">Explore Market</button>
                    </div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="bot-head">
                        <Bot className="h-12 w-12" />
                    </div>
                    <div className="growth-bars">
                        {[38, 52, 68, 84, 108].map((height, index) => <i key={height} style={{ height, animationDelay: `${index * 80}ms` }} />)}
                    </div>
                    <svg viewBox="0 0 260 160" className="hero-trend">
                        <path d="M18 120 C48 94 68 108 88 75 C112 35 140 64 160 48 C190 24 204 32 238 12" />
                        <path d="M220 12H238V31" />
                    </svg>
                </div>
            </section>

            <section className="feature-grid">
                {featureCards.map((card, index) => (
                    <button
                        key={card.title}
                        onClick={() => navigate(card.path)}
                        className="feature-card"
                        style={{ animationDelay: `${index * 45}ms` }}
                    >
                        <div className="feature-icon"><card.icon className="h-5 w-5" /></div>
                        <div>
                            <h3>{card.title}</h3>
                            <p>{card.copy}</p>
                        </div>
                        <span>{card.action} <ArrowRight className="h-3.5 w-3.5" /></span>
                    </button>
                ))}
            </section>

            <section className="market-panel">
                <div className="market-panel-header">
                    <div>
                        <h2>Pakistan Stock Market - All Stocks</h2>
                        <p>Real-time data from Pakistan Stock Exchange (PSX)</p>
                    </div>
                    <div className="market-tools">
                        <div className="market-search">
                            <Search className="h-4 w-4" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search stocks..."
                            />
                        </div>
                        <button className="icon-button" aria-label="Filter stocks">
                            <Filter className="h-4 w-4" />
                        </button>
                        <button className="export-button">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="market-control-row">
                    <div className="market-tabs">
                        {indexTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab === tab ? 'is-active' : ''}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="market-selects">
                        <label>
                            <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                                <option value="all">All Sectors</option>
                                {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
                            </select>
                            <ChevronDown className="h-4 w-4" />
                        </label>
                        <label>
                            <select value={marketStatus} onChange={(event) => setMarketStatus(event.target.value)}>
                                <option value="open">Market Open</option>
                                <option value="watch">Watch Session</option>
                                <option value="closed">Market Closed</option>
                            </select>
                            <ChevronDown className="h-4 w-4" />
                        </label>
                    </div>
                </div>

                <div className="market-table-wrap">
                    <table className="market-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Company</th>
                                <th>Sector</th>
                                <th>Price (PKR)</th>
                                <th>Change</th>
                                <th>Change %</th>
                                <th>Volume</th>
                                <th>Market Cap</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={9} className="loading-cell">Loading market data...</td>
                                    </tr>
                                ))
                            ) : filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="loading-cell">No stocks match the selected filters.</td>
                                </tr>
                            ) : filteredStocks.slice(0, 12).map((stock) => {
                                const isUp = (stock.change_pct || 0) >= 0;
                                return (
                                    <tr key={stock.symbol} onClick={() => navigate(`/stock/${stock.symbol}`)}>
                                        <td>{stock.symbol}</td>
                                        <td>{stock.name || stock.symbol}</td>
                                        <td>{stock.sector || 'Unknown'}</td>
                                        <td>{stock.close?.toFixed(2) || '--'}</td>
                                        <td className={isUp ? 'positive' : 'negative'}>{isUp ? '+' : ''}{stock.change?.toFixed(2) || '0.00'}</td>
                                        <td className={isUp ? 'positive' : 'negative'}>{isUp ? '+' : ''}{stock.change_pct?.toFixed(2) || '0.00'}%</td>
                                        <td>{formatNumber(stock.volume || 0)}</td>
                                        <td>{formatNumber((stock.close || 0) * (stock.volume || 0))}</td>
                                        <td><Star className="h-4 w-4" /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
