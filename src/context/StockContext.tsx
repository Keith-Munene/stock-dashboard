/**
 * context/StockContext.tsx — Typed Global State
 *
 * TypeScript improvements over the JS version:
 * - StockState, StockAction, StockContextValue interfaces
 * - Discriminated union for actions — TypeScript knows exactly
 *   what payload each action carries, no casting needed
 * - useRef<Record<string, () => void>> — typed cleanup map
 * - All reducer cases are exhaustively checked by TypeScript
 */

import React, {
  createContext, useContext, useReducer,
  useEffect, useRef} from 'react';
import type { StockData, StockState, StockAction, StockContextValue } from '../types/index';
import {
  STOCKS, DEFAULT_WATCHLIST, DEFAULT_PORTFOLIO,
  generatePriceHistory, createLiveFeed
} from "../data/mockData";


// ─────────────────────────────────────────────
// Build initial prices by generating 90 days of
// price history for every stock using GBM
// ─────────────────────────────────────────────
function buildInitialPrices(): Record<string, StockData> {
  const prices: Record<string, StockData> = {}

  Object.entries(STOCKS).forEach(([ticker, info]) => {
    const history = generatePriceHistory(info.basePrice, info.volatility, 90)
    const latest = history[history.length - 1]
    const prev = history[history.length - 2]

    prices[ticker] = {
      ...info,
      ticker,
      price: latest.close,
      prevClose: prev?.close ?? latest.close,
      change: parseFloat((latest.close - (prev?.close ?? latest.close)).toFixed(2)),
      changePercent: parseFloat(
        (((latest.close - (prev?.close ?? latest.close)) / (prev?.close ?? latest.close)) * 100).toFixed(2)
      ),
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
      history,
      lastUpdate: new Date().toISOString(),
    }
  })

  return prices
}

const initialState: StockState = {
  prices: buildInitialPrices(),
  watchlist: DEFAULT_WATCHLIST,
  portfolio: DEFAULT_PORTFOLIO,
  selectedTicker: 'AAPL',
  alerts: [],
  liveEnabled: true,
}

// ─────────────────────────────────────────────
// Reducer — TypeScript's discriminated union means
// each case has fully typed payload, no guessing
// ─────────────────────────────────────────────
function reducer(state: StockState, action: StockAction): StockState {
  switch (action.type) {

    case 'PRICE_UPDATE': {
      const { ticker, price, change, changePercent } = action.payload
      return {
        ...state,
        prices: {
          ...state.prices,
          [ticker]: {
            ...state.prices[ticker],
            price,
            change,
            changePercent,
            lastUpdate: new Date().toISOString(),
          },
        },
      }
    }

    case 'SELECT_TICKER':
      return { ...state, selectedTicker: action.payload }

    case 'ADD_TO_WATCHLIST':
      if (state.watchlist.includes(action.payload)) return state
      return { ...state, watchlist: [...state.watchlist, action.payload] }

    case 'REMOVE_FROM_WATCHLIST':
      return { ...state, watchlist: state.watchlist.filter(t => t !== action.payload) }

    case 'ADD_HOLDING': {
      const { ticker, shares, avgCost } = action.payload
      const existing = state.portfolio.find(h => h.ticker === ticker)
      if (existing) {
        const totalShares = existing.shares + shares
        const newAvgCost = ((existing.shares * existing.avgCost) + (shares * avgCost)) / totalShares
        return {
          ...state,
          portfolio: state.portfolio.map(h =>
            h.ticker === ticker
              ? { ...h, shares: totalShares, avgCost: parseFloat(newAvgCost.toFixed(2)) }
              : h
          ),
        }
      }
      return { ...state, portfolio: [...state.portfolio, { ticker, shares, avgCost }] }
    }

    case 'REMOVE_HOLDING':
      return { ...state, portfolio: state.portfolio.filter(h => h.ticker !== action.payload) }

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, { ...action.payload, id: Date.now(), triggered: false }],
      }

    case 'REMOVE_ALERT':
      return { ...state, alerts: state.alerts.filter(a => a.id !== action.payload) }

    case 'TRIGGER_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.payload ? { ...a, triggered: true } : a),
      }

    case 'TOGGLE_LIVE':
      return { ...state, liveEnabled: !state.liveEnabled }

    // TypeScript exhaustiveness check: if we add a new action type and
    // forget to handle it here, the compiler will throw an error
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

// Create context with null default — we handle the null case in useStock()
const StockContext = createContext<StockContextValue | null>(null)

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Typed ref: maps ticker strings to their cleanup functions
  const feedCleanups = useRef<Record<string, () => void>>({})

  useEffect(() => {
    if (!state.liveEnabled) {
      Object.values(feedCleanups.current).forEach(cleanup => cleanup())
      feedCleanups.current = {}
      return
    }

    const tickersToTrack = new Set([
      ...state.watchlist,
      ...state.portfolio.map(h => h.ticker),
      state.selectedTicker,
    ])

    tickersToTrack.forEach(ticker => {
      if (feedCleanups.current[ticker]) return
      const stock = state.prices[ticker]
      if (!stock) return

      const cleanup = createLiveFeed(
        ticker,
        stock.price,
        stock.volatility,
        (update) => dispatch({ type: 'PRICE_UPDATE', payload: update }),
        1500 + Math.random() * 1000
      )
      feedCleanups.current[ticker] = cleanup
    })

    return () => {
      Object.values(feedCleanups.current).forEach(cleanup => cleanup())
      feedCleanups.current = {}
    }
  }, [state.liveEnabled, state.watchlist, state.portfolio, state.selectedTicker])

  // Check price alerts on every price update
  useEffect(() => {
    state.alerts.forEach(alert => {
      if (alert.triggered) return
      const currentPrice = state.prices[alert.ticker]?.price
      if (currentPrice === undefined) return
      const hit =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice)
      if (hit) dispatch({ type: 'TRIGGER_ALERT', payload: alert.id })
    })
  }, [state.prices, state.alerts])

  // Derived portfolio calculations
  const portfolioValue = state.portfolio.reduce((total, h) => {
    return total + (state.prices[h.ticker]?.price ?? 0) * h.shares
  }, 0)

  const portfolioCost = state.portfolio.reduce((total, h) => {
    return total + h.avgCost * h.shares
  }, 0)

  const portfolioGain = portfolioValue - portfolioCost
  const portfolioGainPct = portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0

  const value: StockContextValue = {
    ...state,
    dispatch,
    portfolioValue,
    portfolioCost,
    portfolioGain,
    portfolioGainPct,
    allTickers: Object.keys(STOCKS),
  }

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>
}

// Custom hook — throws a helpful error if used outside the provider
export function useStock(): StockContextValue {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock must be used within StockProvider')
  return ctx
}