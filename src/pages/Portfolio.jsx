import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Briefcase, Plus, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { apiRequest, getToken } from '../lib/localApi';

const API_BASE = 'https://stockanalyzerr-a6gxg3g3gwhebbex.eastus-01.azurewebsites.net';

const signalFor = (gainPct) => {
    if (gainPct >= 8) return { label: 'Take Profit Zone', tone: 'positive' };
    if (gainPct >= 2) return { label: 'Hold Winner', tone: 'positive' };
    if (gainPct <= -6) return { label: 'Review Risk', tone: 'negative' };
    return { label: 'Hold', tone: 'neutral' };
};

export default function Portfolio({ authUser }) {
    const [holdings, setHoldings] = useState([]);
    const [marketWatch, setMarketWatch] = useState([]);
    const [form, setForm] = useState({ symbol: '', shares: '', avgPrice: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const isSignedIn = Boolean(authUser || getToken());

    const loadHoldings = async () => {
        if (!getToken()) {
            setHoldings([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [holdingsData, marketData] = await Promise.all([
                apiRequest('/api/holdings'),
                axios.get(`${API_BASE}/stocks/market-watch`),
            ]);
            setHoldings(holdingsData.items || []);
            setMarketWatch(marketData.data.data || []);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadHoldings();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [authUser?.id]);

    const enrichedHoldings = useMemo(() => {
        return holdings.map((holding) => {
            const market = marketWatch.find((stock) => stock.symbol === holding.symbol);
            const currentPrice = market?.close || holding.avg_price;
            const totalValue = holding.shares * currentPrice;
            const totalCost = holding.shares * holding.avg_price;
            const gain = totalValue - totalCost;
            const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0;
            return { ...holding, market, currentPrice, totalValue, totalCost, gain, gainPct, signal: signalFor(gainPct) };
        });
    }, [holdings, marketWatch]);

    const metrics = enrichedHoldings.reduce((acc, holding) => ({
        totalValue: acc.totalValue + holding.totalValue,
        totalInvested: acc.totalInvested + holding.totalCost,
        totalGain: acc.totalGain + holding.gain,
    }), { totalValue: 0, totalInvested: 0, totalGain: 0 });

    const submitHolding = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await apiRequest('/api/holdings', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            setForm({ symbol: '', shares: '', avgPrice: '' });
            await loadHoldings();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteHolding = async (symbol) => {
        await apiRequest(`/api/holdings/${symbol}`, { method: 'DELETE' });
        await loadHoldings();
    };

    if (!isSignedIn) {
        return (
            <div className="portfolio-empty app-card">
                <Briefcase className="h-10 w-10" />
                <h2>Sign up to use Portfolio</h2>
                <p>Create an account from the top-right sign up button, then add holdings, favorite stocks, and track profit signals.</p>
            </div>
        );
    }

    return (
        <div className="portfolio-screen">
            <section className="portfolio-header">
                <div>
                    <h2>Portfolio</h2>
                    <p>Track positions, live value, profit/loss, and simple risk signals.</p>
                </div>
                <form className="holding-form" onSubmit={submitHolding}>
                    <input value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value.toUpperCase() })} placeholder="Symbol" />
                    <input value={form.shares} onChange={(event) => setForm({ ...form, shares: event.target.value })} placeholder="Shares" type="number" min="0" step="1" />
                    <input value={form.avgPrice} onChange={(event) => setForm({ ...form, avgPrice: event.target.value })} placeholder="Avg price" type="number" min="0" step="0.01" />
                    <button className="primary-cta" type="submit"><Plus className="h-4 w-4" /> Add Holding</button>
                </form>
            </section>

            {error ? <div className="auth-error">{error}</div> : null}

            <section className="portfolio-stats">
                {[
                    ['Total Value', metrics.totalValue],
                    ['Invested', metrics.totalInvested],
                    ['Gain / Loss', metrics.totalGain],
                    ['Holdings', enrichedHoldings.length],
                ].map(([label, value]) => (
                    <div key={label} className="app-card portfolio-stat">
                        <span>{label}</span>
                        <strong>{typeof value === 'number' && label !== 'Holdings' ? `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : value}</strong>
                    </div>
                ))}
            </section>

            <section className="market-panel">
                <div className="market-panel-header">
                    <div>
                        <h2>Your Holdings</h2>
                        <p>{loading ? 'Loading positions...' : `${enrichedHoldings.length} active positions`}</p>
                    </div>
                </div>
                <div className="market-table-wrap">
                    <table className="market-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Shares</th>
                                <th>Avg Price</th>
                                <th>Current</th>
                                <th>Total Value</th>
                                <th>Gain/Loss</th>
                                <th>Signal</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedHoldings.length === 0 ? (
                                <tr><td colSpan={8} className="loading-cell">No holdings yet. Add your first position above.</td></tr>
                            ) : enrichedHoldings.map((holding) => {
                                const isProfit = holding.gain >= 0;
                                return (
                                    <tr key={holding.symbol}>
                                        <td><strong>{holding.symbol}</strong></td>
                                        <td>{holding.shares.toLocaleString()}</td>
                                        <td>Rs. {holding.avg_price.toFixed(2)}</td>
                                        <td>Rs. {holding.currentPrice.toFixed(2)}</td>
                                        <td>Rs. {holding.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                        <td className={isProfit ? 'positive' : 'negative'}>
                                            {isProfit ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                                            {' '}Rs. {holding.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({holding.gainPct.toFixed(2)}%)
                                        </td>
                                        <td><span className={`portfolio-signal ${holding.signal.tone}`}>{holding.signal.label}</span></td>
                                        <td>
                                            <button className="icon-button" onClick={() => deleteHolding(holding.symbol)} aria-label={`Remove ${holding.symbol}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="portfolio-helper app-card">
                <Star className="h-5 w-5" />
                <span>Favorite stocks live on the Watchlist page. Portfolio signals are calculated from your average price and live market-watch prices.</span>
            </section>
        </div>
    );
}
