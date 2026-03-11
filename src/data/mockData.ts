/**
 * data/mockData.ts — Typed Stock Data & Price Simulation
 *
 * TypeScript additions vs the JS version:
 * - Record<string, StockDefinition> — typed object map
 * - Explicit return types on functions
 * - Typed callback parameter in createLiveFeed
 */

import type { StockDefinition, OHLCData, NewsArticle, Holding } from '../types'

// ── Base stock definitions ──
export const STOCKS: Record<string, StockDefinition> = {
  AAPL:  { name: 'Apple Inc.',             sector: 'Technology',     basePrice: 189.30, volatility: 0.015 },
  TSLA:  { name: 'Tesla Inc.',             sector: 'Automotive',     basePrice: 248.50, volatility: 0.035 },
  MSFT:  { name: 'Microsoft Corp.',        sector: 'Technology',     basePrice: 374.00, volatility: 0.012 },
  GOOGL: { name: 'Alphabet Inc.',          sector: 'Technology',     basePrice: 140.50, volatility: 0.018 },
  AMZN:  { name: 'Amazon.com Inc.',        sector: 'E-Commerce',     basePrice: 178.25, volatility: 0.022 },
  NVDA:  { name: 'NVIDIA Corp.',           sector: 'Semiconductors', basePrice: 495.00, volatility: 0.040 },
  META:  { name: 'Meta Platforms',         sector: 'Social Media',   basePrice: 358.00, volatility: 0.025 },
  NFLX:  { name: 'Netflix Inc.',           sector: 'Streaming',      basePrice: 484.00, volatility: 0.028 },
  JPM:   { name: 'JPMorgan Chase',         sector: 'Finance',        basePrice: 196.00, volatility: 0.014 },
  DIS:   { name: 'Walt Disney Co.',        sector: 'Entertainment',  basePrice: 91.50,  volatility: 0.020 },
  AMD:   { name: 'Advanced Micro Devices', sector: 'Semiconductors', basePrice: 168.00, volatility: 0.038 },
  UBER:  { name: 'Uber Technologies',      sector: 'Transportation', basePrice: 62.00,  volatility: 0.030 },
}

/**
 * Geometric Brownian Motion — same math used in Black-Scholes options pricing.
 * Returns an array of OHLCData (Open, High, Low, Close, Volume) for each trading day.
 *
 * TypeScript: explicit return type OHLCData[] makes this self-documenting.
 */
export function generatePriceHistory(
  basePrice: number,
  volatility: number,
  days: number = 90,
  drift: number = 0.0003
): OHLCData[] {
  const history: OHLCData[] = []
  let price = basePrice * (0.75 + Math.random() * 0.25)
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Skip weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // Box-Muller transform for normal distribution
    const u1 = Math.random()
    const u2 = Math.random()
    const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const dailyReturn = drift + volatility * randNormal

    price = price * Math.exp(dailyReturn)

    const intraVolatility = price * volatility * 0.5
    const open = price * (1 + (Math.random() - 0.5) * 0.005)
    const high = Math.max(open, price) + Math.abs(randNormal) * intraVolatility * 0.3
    const low = Math.min(open, price) - Math.abs(randNormal) * intraVolatility * 0.3
    const volume = Math.floor((5_000_000 + Math.random() * 20_000_000) * (1 + Math.abs(dailyReturn) * 10))

    history.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume,
    })
  }

  return history
}

// LiveUpdate is what the price feed callback receives
interface LiveUpdate {
  ticker: string
  price: number
  change: number
  changePercent: number
  timestamp: string
  volume: number
}

/**
 * Simulates a WebSocket price feed.
 * Returns a cleanup function — call it to stop the feed.
 * TypeScript: () => void return type makes the cleanup contract explicit.
 */
export function createLiveFeed(
  ticker: string,
  currentPrice: number,
  volatility: number,
  callback: (update: LiveUpdate) => void,
  interval: number = 2000
): () => void {
  let price = currentPrice

  const tick = (): void => {
    const change = price * volatility * (Math.random() - 0.48) * 0.1
    price = Math.max(price + change, 1)
    const changePercent = ((price - currentPrice) / currentPrice) * 100

    callback({
      ticker,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat((price - currentPrice).toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(3)),
      timestamp: new Date().toISOString(),
      volume: Math.floor(Math.random() * 10_000),
    })
  }

  const id = setInterval(tick, interval)
  return () => clearInterval(id)
}

// ── Static mock data ──
export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 1, ticker: 'AAPL', sentiment: 'positive', source: 'MarketWatch', time: '2h ago', url: '#',
    headline: 'Apple Vision Pro Sales Exceed Analyst Expectations in Q4',
    summary: "Apple's mixed-reality headset has driven unexpected revenue growth, with analysts revising price targets upward following stronger-than-expected adoption rates.",
  },
  {
    id: 2, ticker: 'TSLA', sentiment: 'negative', source: 'Reuters', time: '3h ago', url: '#',
    headline: 'Tesla Cuts Model Y Prices Across Europe and Asia Markets',
    summary: 'The EV maker reduced prices in key international markets as competition from Chinese automakers intensifies. Analysts debate whether margin pressure outweighs volume gains.',
  },
  {
    id: 3, ticker: 'NVDA', sentiment: 'positive', source: 'Bloomberg', time: '5h ago', url: '#',
    headline: 'NVIDIA H100 Demand Surges as AI Infrastructure Buildout Accelerates',
    summary: 'Data center GPU orders continue to outpace supply as hyperscalers ramp AI training workloads. NVIDIA raises full-year guidance citing sustained enterprise demand.',
  },
  {
    id: 4, ticker: 'MSFT', sentiment: 'positive', source: 'CNBC', time: '6h ago', url: '#',
    headline: 'Microsoft Azure AI Services Revenue Grows 28% Year-Over-Year',
    summary: 'Cloud division performance drives beat on earnings expectations as enterprise AI adoption expands. Copilot integration shows strong engagement metrics.',
  },
  {
    id: 5, ticker: 'META', sentiment: 'negative', source: 'Financial Times', time: '8h ago', url: '#',
    headline: 'Meta Faces Antitrust Scrutiny Over WhatsApp Business Practices',
    summary: "European regulators open formal investigation into Meta's integration of WhatsApp with its advertising ecosystem, potentially affecting the company's monetization strategy.",
  },
  {
    id: 6, ticker: 'AMZN', sentiment: 'positive', source: 'TechCrunch', time: '10h ago', url: '#',
    headline: 'Amazon AWS Launches 12 New AI-Powered Developer Tools',
    summary: 'The cloud giant expands its generative AI product portfolio, targeting enterprise software development workflows with direct AWS infrastructure integration.',
  },
  {
    id: 7, ticker: 'GOOGL', sentiment: 'positive', source: 'Wall Street Journal', time: '12h ago', url: '#',
    headline: 'Google Search Ad Revenue Returns to Growth in Q3',
    summary: "Alphabet's core business shows resilience as digital advertising recovers. YouTube Shorts monetization also contributed to better-than-expected results.",
  },
  {
    id: 8, ticker: 'JPM', sentiment: 'negative', source: 'Reuters', time: '1d ago', url: '#',
    headline: 'JPMorgan CEO Warns of Elevated Recession Risk in 2025',
    summary: "Jamie Dimon cautions investors about persistent inflation and geopolitical uncertainty, recommending defensive positioning despite the bank's strong quarterly results.",
  },
]

export const DEFAULT_WATCHLIST: string[] = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']

export const DEFAULT_PORTFOLIO: Holding[] = [
  { ticker: 'AAPL', shares: 10, avgCost: 162.50 },
  { ticker: 'MSFT', shares: 5,  avgCost: 310.00 },
  { ticker: 'NVDA', shares: 3,  avgCost: 420.00 },
  { ticker: 'TSLA', shares: 8,  avgCost: 215.00 },
]