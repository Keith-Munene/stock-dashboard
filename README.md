# 📈 MarketLens — Real-Time Stock Dashboard

<div align="center">

<img width="1535" height="863" alt="image" src="https://github.com/user-attachments/assets/00d9ecba-4282-456d-aadd-7d3d790f5b6f" />


**A production-grade financial dashboard featuring real-time price simulation, interactive D3.js candlestick charts, portfolio tracking, and live price alerts.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Screenshots](#-screenshots)

</div>

---

## 🎯 Project Overview

MarketLens is a full-featured stock market dashboard built to demonstrate advanced frontend engineering skills. It simulates a real-world trading interface with live price feeds, interactive charting, and portfolio management — all without a backend or paid API.

> **Why this project stands out:** Instead of calling a simple REST API and displaying static numbers, this app implements **Geometric Brownian Motion** — the actual mathematical model used in the Black-Scholes options pricing formula — to generate realistic, statistically valid price movements. Every price tick follows real financial mathematics.

---

## ✨ Features

### 📊 Interactive D3.js Charts
- **Dual chart modes** — toggle between smooth line chart and OHLC candlestick view
- **Animated line drawing** — SVG path animation on load using D3 transitions
- **Crosshair tooltip** — live OHLC data on mouse hover with D3 bisector
- **Time range selector** — 1W / 1M / 3M views with dynamic data filtering
- **Fully responsive** — ResizeObserver API re-renders chart on container resize
- **Gradient area fill** — dynamic color based on positive/negative trend

### 💹 Live Price Feed
- Simulated WebSocket-style price updates every 1.5 seconds per ticker
- **Price flash animations** — cells pulse green/red on every price change
- Live/Pause toggle to control all active feeds simultaneously
- Staggered update intervals per stock to simulate real market behavior

### 📁 Portfolio Tracker
- Add positions with ticker, share count, and average cost basis
- **Weighted average cost** calculation when adding to existing positions
- Live unrealized P&L with percentage gain/loss per holding
- **SVG allocation bar** — proportional breakdown of portfolio by value
- Total portfolio value updating in real time

### 👀 Watchlist
- Search and add any of 12 available tickers
- Live price and percentage change per row
- One-click removal
- Click any row to load that stock's chart

### 🔔 Price Alerts
- Set above/below threshold alerts on any ticker
- Alerts auto-trigger when the live feed crosses the target price
- **Toast notifications** fire when an alert is hit
- Triggered alerts are archived separately from active ones

### 📰 News Feed
- Financial headlines with **sentiment badges** (Bullish / Bearish / Neutral)
- Filter news to watchlist stocks only
- Source and timestamp on every article

---

## 🛠 Tech Stack

| Category | Technology | Why |
|---|---|---|
| Framework | React 18 | Concurrent features, modern hooks |
| Language | TypeScript 5 | Full type safety, discriminated unions |
| Charting | D3.js v7 | Full control over SVG rendering |
| Build Tool | Vite 5 | 10x faster than CRA, native ESM |
| State | useReducer + Context | Redux pattern without the boilerplate |
| Routing | React Router v6 | Industry standard |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Notifications | React Hot Toast | Lightweight toast system |

---

## 🏗 Architecture

### State Management — Discriminated Union Pattern
Rather than using `useState` for each piece of state or adding Redux as a dependency, the app uses React's built-in `useReducer` with a **discriminated union** action type. This gives compile-time guarantees that every action has the correct payload shape:

```typescript
// TypeScript knows EXACTLY what payload each action carries
type StockAction =
  | { type: 'PRICE_UPDATE'; payload: { ticker: string; price: number; change: number; changePercent: number } }
  | { type: 'SELECT_TICKER'; payload: string }
  | { type: 'ADD_HOLDING'; payload: { ticker: string; shares: number; avgCost: number } }
  | { type: 'TOGGLE_LIVE' }
  // ...
```

### D3 + React Integration
The primary challenge of D3 in React is that both libraries want to control the DOM. The solution used here is the **ref handoff pattern** — React owns the component tree, but passes a typed `SVGSVGElement` ref to D3 which manages its own subtree:

```typescript
const svgRef = useRef<SVGSVGElement>(null)

useEffect(() => {
  // D3 takes full ownership of everything inside the SVG ref
  d3.select(svgRef.current).selectAll('*').remove()
  // ... D3 rendering logic
}, [filteredData, dimensions, chartType])
```

### Price Simulation — Geometric Brownian Motion
Stock prices are generated using the same stochastic model underlying the Black-Scholes options pricing formula:

```
S(t) = S(0) × exp((μ - σ²/2)×t + σ×W(t))
```

Where `W(t)` is a Wiener process approximated using the **Box-Muller transform** to generate normally distributed random variables. Each stock has a unique volatility (`σ`) value that produces realistic-feeling price behavior:

```typescript
// Box-Muller transform for normal distribution
const u1 = Math.random()
const u2 = Math.random()
const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
const dailyReturn = drift + volatility * randNormal
price = price * Math.exp(dailyReturn)
```

### Responsive Charts with ResizeObserver
Instead of fixed pixel dimensions, the chart uses the browser's `ResizeObserver` API to watch the container element and re-trigger D3 rendering whenever the width changes:

```typescript
useEffect(() => {
  const observer = new ResizeObserver((entries) => {
    const { width } = entries[0].contentRect
    setDimensions({ width: Math.max(width, 300), height: 380 })
  })
  observer.observe(containerRef.current!)
  return () => observer.disconnect()
}, [])
```

---

## 📁 Project Structure

```
stock-dashboard/
│
├── index.html                         ← Vite entry (root level)
├── vite.config.ts                     ← Vite bundler config
├── tsconfig.json                      ← TypeScript compiler settings
├── package.json
│
└── src/
    ├── main.tsx                       ← React DOM mount
    ├── App.tsx                        ← Router + providers
    ├── index.css                      ← Global styles
    │
    ├── types/
    │   └── index.ts                   ← All interfaces & union types
    │
    ├── data/
    │   └── mockData.ts                ← GBM simulation + static data
    │
    ├── context/
    │   └── StockContext.tsx           ← Global state + live feeds
    │
    ├── pages/
    │   └── Dashboard.tsx              ← 3-column layout
    │
    └── components/
        ├── chart/
        │   └── StockChart.tsx         ← D3.js chart (line + candlestick)
        ├── watchlist/
        │   └── Watchlist.tsx          ← Live price list
        ├── portfolio/
        │   └── Portfolio.tsx          ← Holdings + P&L tracker
        ├── news/
        │   └── NewsFeed.tsx           ← Sentiment-tagged news
        └── ui/
            └── PriceAlerts.tsx        ← Alert system + toasts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/stock-dashboard.git

# 2. Navigate into the project
cd stock-dashboard

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser. No API key needed — all data is simulated.

### Build for Production

```bash
npm run build    # TypeScript check + Vite bundle
npm run preview  # Preview the production build locally
```

---

## 🔌 Upgrading to Real Data

When ready to use live market data, the best free APIs are:

| API | Free Tier | Integration Point |
|---|---|---|
| [Finnhub](https://finnhub.io) | 60 calls/min, WebSocket | Replace `createLiveFeed()` in `mockData.ts` |
| [Polygon.io](https://polygon.io) | 5 calls/min (delayed) | Replace `generatePriceHistory()` |
| [Alpha Vantage](https://alphavantage.co) | 25 calls/day | Historical OHLC data |

**Finnhub WebSocket swap** (drop-in replacement for the mock feed):

```typescript
// In StockContext.tsx — replace createLiveFeed() with:
const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`)
socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'subscribe', symbol: ticker }))
}
socket.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'trade') {
    dispatch({
      type: 'PRICE_UPDATE',
      payload: { ticker, price: data.data[0].p, change: 0, changePercent: 0 }
    })
  }
}
```

---

## 🧠 Key Concepts Demonstrated

| Concept | Where |
|---|---|
| TypeScript discriminated unions | `src/types/index.ts`, `StockContext.tsx` |
| D3 + React ref handoff pattern | `StockChart.tsx` |
| useReducer for complex state | `StockContext.tsx` |
| ResizeObserver API | `StockChart.tsx` |
| Geometric Brownian Motion | `mockData.ts` |
| SVG path animation | `StockChart.tsx` — line draw effect |
| D3 time scales + bisector | `StockChart.tsx` — crosshair tooltip |
| useRef for mutable values | `Watchlist.tsx` — price flash, `StockContext.tsx` — cleanup map |
| Derived state from context | `StockContext.tsx` — portfolio P&L |

---

## 📄 License

MIT — free to use, fork, and build on.

---

<div align="center">
Built with React, TypeScript, and D3.js
</div>
