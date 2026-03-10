import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, BarChart3, Shield, Activity, Target, Zap, ChevronDown, ChevronRight } from 'lucide-react';

const lessons = [
    {
        category: 'Fundamentals',
        icon: BookOpen,
        color: '#3b82f6',
        items: [
            { title: 'What is the Pakistan Stock Exchange?', content: 'The Pakistan Stock Exchange (PSX) is the sole stock exchange of Pakistan, formed in 2016 by merging the Karachi, Lahore, and Islamabad stock exchanges. It lists over 500 companies across multiple sectors including banking, energy, cement, and technology. The benchmark index is the KSE-100, which tracks the top 100 companies by market capitalization.' },
            { title: 'How to Open a Brokerage Account', content: 'To trade on PSX, you need a CDC (Central Depository Company) account and a brokerage account. Choose a SECP-registered broker, submit your CNIC, bank details, and proof of income. Most brokers now offer online account opening. Once approved, you can fund your account and start trading within 2-3 business days.' },
            { title: 'Understanding Market Orders vs Limit Orders', content: 'A market order buys/sells at the current market price immediately. A limit order lets you set a specific price — the trade only executes when the stock reaches that price. Limit orders give you more control but may not execute if the price doesn\'t reach your target. For PSX, limit orders are recommended for less liquid stocks.' },
            { title: 'Reading Financial Statements', content: 'Key financial statements include the Income Statement (revenue, expenses, profit), Balance Sheet (assets, liabilities, equity), and Cash Flow Statement. Look for growing revenue, healthy profit margins, manageable debt levels, and positive operating cash flow. PSX-listed companies publish quarterly and annual reports on their investor relations pages.' },
        ]
    },
    {
        category: 'Technical Analysis',
        icon: Activity,
        color: '#10b981',
        items: [
            { title: 'RSI (Relative Strength Index)', content: 'RSI measures momentum on a scale of 0-100. Values below 30 indicate oversold conditions (potential buy), while values above 70 indicate overbought conditions (potential sell). RSI is calculated using 14 periods of price changes. Our platform calculates RSI automatically for every stock. Use RSI alongside other indicators for best results.' },
            { title: 'Moving Averages (SMA & EMA)', content: 'Simple Moving Average (SMA) calculates the average closing price over a period (e.g., 20 days). When price crosses above SMA, it signals bullish momentum. A "golden cross" occurs when the 50-day SMA crosses above the 200-day SMA — a strong buy signal. Our platform tracks SMA-20 and SMA-50 for all stocks.' },
            { title: 'MACD (Moving Average Convergence Divergence)', content: 'MACD shows the relationship between two moving averages. The MACD line is the difference between 12-period and 26-period EMA. The signal line is the 9-period EMA of MACD. When MACD crosses above the signal line, it\'s bullish. The histogram shows the strength of the trend. Positive histogram = upward momentum.' },
            { title: 'Support and Resistance Levels', content: 'Support is a price level where buying pressure prevents further decline. Resistance is where selling pressure prevents further rise. These levels are identified by looking at historical price points where the stock repeatedly bounced or reversed. Breakouts above resistance or below support often signal strong moves.' },
        ]
    },
    {
        category: 'Risk Management',
        icon: Shield,
        color: '#f43f5e',
        items: [
            { title: 'Position Sizing', content: 'Never risk more than 1-2% of your total portfolio on a single trade. If your portfolio is Rs. 1,000,000, your maximum risk per trade should be Rs. 10,000-20,000. Calculate position size by dividing your risk amount by the distance to your stop-loss. This protects you from catastrophic losses on any single trade.' },
            { title: 'Stop-Loss Orders', content: 'A stop-loss automatically sells your position when the price drops to a specified level. Place stop-losses at technical support levels or at a fixed percentage (e.g., 5-7% below entry). For PSX stocks, consider the daily average range when setting stops — too tight and you\'ll get stopped out by normal volatility.' },
            { title: 'Portfolio Diversification', content: 'Don\'t put all eggs in one basket. Spread investments across different sectors (banking, energy, cement, tech, etc.). A well-diversified PSX portfolio might include 8-12 stocks across 4-5 sectors. Consider adding defensive stocks (utilities, consumer staples) alongside growth stocks for balance.' },
            { title: 'Understanding Market Sentiment', content: 'Market sentiment drives short-term price movements. Track the advance-decline ratio (gainers vs losers), trading volume trends, and foreign investor activity. Our Market Summary dashboard shows real-time sentiment indicators. Bull markets tend to have broad participation, while bear markets see concentrated selling.' },
        ]
    },
    {
        category: 'Strategy',
        icon: Target,
        color: '#8b5cf6',
        items: [
            { title: 'Value Investing on PSX', content: 'Look for stocks trading below their intrinsic value. Key metrics: P/E ratio below sector average, P/B ratio below 1.5, consistent dividend payments, and strong balance sheets. Pakistani blue-chips in banking and cement sectors often present value opportunities during market corrections.' },
            { title: 'Momentum Trading', content: 'Follow the trend. Buy stocks making new highs with increasing volume. Use our Top Picks page to find stocks with strong momentum scores. Enter on breakouts above resistance with a stop below the breakout level. Best momentum opportunities on PSX come during bull cycles in high-beta sectors like tech and banking.' },
            { title: 'Dividend Investing', content: 'PSX has many high-dividend-yield stocks, especially in banking, oil & gas, and fertilizer sectors. Look for companies with consistent dividend history, sustainable payout ratios (below 70%), and growing earnings. Dividend income is taxed at 15% for filers in Pakistan. Reinvesting dividends compounds returns significantly over time.' },
        ]
    },
];

export default function Learn() {
    const [openCategory, setOpenCategory] = useState('Fundamentals');
    const [openLesson, setOpenLesson] = useState(null);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-[#3b82f6]" />
                    <span className="text-[11px] font-semibold text-[#3b82f6] uppercase tracking-[0.15em]">Learning Center</span>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-3">
                    Learn to <span className="gradient-text">Invest</span>
                </h2>
                <p className="text-[#64748b] text-[15px] max-w-xl">
                    Master stock market investing on the Pakistan Stock Exchange with our comprehensive guides covering fundamentals, technical analysis, risk management, and proven strategies.
                </p>
            </motion.div>

            {/* Category Tabs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2">
                {lessons.map(cat => (
                    <button
                        key={cat.category}
                        onClick={() => { setOpenCategory(cat.category); setOpenLesson(null); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${openCategory === cat.category
                                ? 'bg-white/10 text-white border border-white/10'
                                : 'bg-white/[0.02] text-[#94a3b8] border border-transparent hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <cat.icon className="w-4 h-4" style={{ color: openCategory === cat.category ? cat.color : undefined }} />
                        {cat.category}
                    </button>
                ))}
            </motion.div>

            {/* Lessons */}
            {lessons.filter(c => c.category === openCategory).map(cat => (
                <div key={cat.category} className="space-y-3">
                    {cat.items.map((lesson, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass overflow-hidden"
                        >
                            <div
                                onClick={() => setOpenLesson(openLesson === `${cat.category}-${i}` ? null : `${cat.category}-${i}`)}
                                className="p-5 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${cat.color}15`, color: cat.color }}>
                                        {i + 1}
                                    </div>
                                    <span className="font-semibold text-white text-sm">{lesson.title}</span>
                                </div>
                                {openLesson === `${cat.category}-${i}` ? (
                                    <ChevronDown className="w-4 h-4 text-[#64748b]" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-[#64748b]" />
                                )}
                            </div>
                            {openLesson === `${cat.category}-${i}` && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 pt-0">
                                    <div className="pl-11">
                                        <p className="text-sm text-[#94a3b8] leading-relaxed">{lesson.content}</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ))}
        </div>
    );
}
