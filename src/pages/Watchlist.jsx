import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, Eye, Plus, Search, Star, Trash2, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getToken } from '../lib/localApi';

const API_BASE = 'https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net';

const signalFor = (changePct) => {
    if (changePct >= 3) return 'Strong Momentum';
    if (changePct > 0) return 'Positive';
    if (changePct <= -3) return 'Risk Alert';
    return 'Watch';
};

export default function Watchlist({ authUser }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [marketWatch, setMarketWatch] = useState([]);
    const [symbol, setSymbol] = useState('');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const isSignedIn = Boolean(authUser || getToken());

    const loadWatchlist = async () => {
        if (!getToken()) {
            setItems([]);
            return;
        }
        try {
            const [watchlistData, marketData] = await Promise.all([
                apiRequest('/api/watchlist'),
                axios.get(`${API_BASE}/stocks/market-watch`),
            ]);
            setItems(watchlistData.items || []);
            setMarketWatch(marketData.data.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadWatchlist();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [authUser?.id]);

    const stocks = useMemo(() => {
        return items.map((item) => {
            const market = marketWatch.find((stock) => stock.symbol === item.symbol);
            return {
                ...item,
                name: market?.name || item.symbol,
                price: market?.close || 0,
                change: market?.change || 0,
                changePct: market?.change_pct || 0,
                volume: market?.volume || 0,
                signal: signalFor(market?.change_pct || 0),
            };
        }).filter((stock) => (
            !search ||
            stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
            stock.name.toLowerCase().includes(search.toLowerCase())
        ));
    }, [items, marketWatch, search]);

    const addStock = async (event) => {
        event.preventDefault();
        setError('');
        const normalized = symbol.trim().toUpperCase();
        if (!normalized) return;
        try {
            await apiRequest('/api/watchlist', {
                method: 'POST',
                body: JSON.stringify({ symbol: normalized }),
            });
            setItems((current) => (
                current.some((item) => item.symbol === normalized)
                    ? current
                    : [{ id: normalized, symbol: normalized, created_at: new Date().toISOString() }, ...current]
            ));
            setSymbol('');
            await loadWatchlist();
        } catch (err) {
            setError(err.message);
        }
    };

    const removeStock = async (stockSymbol) => {
        await apiRequest(`/api/watchlist/${stockSymbol}`, { method: 'DELETE' });
        await loadWatchlist();
    };

    if (!isSignedIn) {
        return (
            <div className="portfolio-empty app-card">
                <Star className="h-10 w-10" />
                <h2>Watchlist</h2>
                <p>Favorite stocks are now saved to your account. Sign up from the top-right profile button, then come back here to add symbols and track live signals.</p>
                <div className="portfolio-empty-hint">
                    <UserPlus className="h-4 w-4" />
                    <span>Use the Sign Up button in the top-right header.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-screen">
            <section className="portfolio-header">
                <div>
                    <h2>Watchlist</h2>
                    <p>Save favorite stocks and monitor price action with live PSX market data.</p>
                </div>
                <form className="holding-form" onSubmit={addStock}>
                    <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="Symbol e.g. OGDC" />
                    <button className="primary-cta" type="submit"><Plus className="h-4 w-4" /> Add Stock</button>
                </form>
            </section>

            {error ? <div className="auth-error">{error}</div> : null}

            <section className="app-card watchlist-search">
                <Search className="h-4 w-4" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stocks in watchlist..." />
            </section>

            <section className="market-panel">
                <div className="market-panel-header">
                    <div>
                        <h2>Favorite Stocks</h2>
                        <p>{stocks.length} saved symbols</p>
                    </div>
                </div>
                <div className="market-table-wrap">
                    <table className="market-table">
                        <thead>
                            <tr>
                                <th />
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Change</th>
                                <th>Volume</th>
                                <th>Signal</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 ? (
                                <tr><td colSpan={8} className="loading-cell">No favorite stocks yet.</td></tr>
                            ) : stocks.map((stock) => {
                                const isUp = stock.changePct >= 0;
                                return (
                                    <tr key={stock.symbol} onClick={() => navigate(`/stock/${stock.symbol}`)}>
                                        <td><Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" /></td>
                                        <td><strong>{stock.symbol}</strong></td>
                                        <td>{stock.name}</td>
                                        <td>Rs. {stock.price.toFixed(2)}</td>
                                        <td className={isUp ? 'positive' : 'negative'}>
                                            {isUp ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                                            {' '}{isUp ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePct.toFixed(2)}%)
                                        </td>
                                        <td>{stock.volume.toLocaleString()}</td>
                                        <td><span className={`portfolio-signal ${isUp ? 'positive' : 'negative'}`}>{stock.signal}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="icon-button" onClick={(event) => { event.stopPropagation(); }} aria-label={`Set alert for ${stock.symbol}`}>
                                                    <Bell className="h-4 w-4" />
                                                </button>
                                                <button className="icon-button" onClick={(event) => { event.stopPropagation(); navigate(`/stock/${stock.symbol}`); }} aria-label={`View ${stock.symbol}`}>
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="icon-button" onClick={(event) => { event.stopPropagation(); removeStock(stock.symbol); }} aria-label={`Remove ${stock.symbol}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
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
