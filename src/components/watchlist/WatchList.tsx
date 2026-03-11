/**
 * components/watchlist/Watchlist.tsx
 * TypeScript: useRef<number> for timeout ID, typed event handlers
 */

import React, { useState, useEffect, useRef } from 'react'
import { Search, Plus, X, TrendingUp, TrendingDown } from 'lucide-react'
import { useStock } from '../../context/StockContext'
import { STOCKS } from '../../data/mockData'

// ── Price flash cell with typed props ──
interface PriceCellProps {
  price: number
  ticker: string
}

function PriceCell({ price }: PriceCellProps) {
  const prevRef = useRef<number>(price)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (prevRef.current !== price) {
      const dir: 'up' | 'down' = price > prevRef.current ? 'up' : 'down'
      setFlash(dir)
      prevRef.current = price
      const t = window.setTimeout(() => setFlash(null), 600)
      return () => clearTimeout(t)
    }
  }, [price])

  return (
    <span style={{
      fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 600,
      color: flash === 'up' ? '#00d17a' : flash === 'down' ? '#ff4d6d' : '#e8eaf6',
      background: flash === 'up' ? 'rgba(0,209,122,0.15)' : flash === 'down' ? 'rgba(255,77,109,0.15)' : 'transparent',
      padding: '2px 6px', borderRadius: '4px', transition: 'background 0.3s, color 0.3s',
    }}>
      ${price?.toFixed(2)}
    </span>
  )
}

export default function Watchlist() {
  const { prices, watchlist, selectedTicker, dispatch, allTickers } = useStock()
  const [search, setSearch] = useState<string>('')
  const [showAdd, setShowAdd] = useState<boolean>(false)

  const searchResults = allTickers.filter(t =>
    !watchlist.includes(t) &&
    (t.includes(search.toUpperCase()) ||
      STOCKS[t]?.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e8eaf6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Watchlist
        </h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: showAdd ? 'rgba(99,179,237,0.2)' : 'rgba(255,255,255,0.06)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: showAdd ? '#63b3ed' : '#6b7db3',
        }}>
          <Plus size={14} />
        </button>
      </div>

      {showAdd && (
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7db3' }} />
          <input
            autoFocus
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search ticker or company..."
            style={{
              width: '100%', padding: '8px 10px 8px 30px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', color: '#e8eaf6', fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }}
          />
          {search && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#0e1428', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', zIndex: 50, maxHeight: '200px', overflowY: 'auto',
            }}>
              {searchResults.slice(0, 8).map(ticker => (
                <button key={ticker} onClick={() => {
                  dispatch({ type: 'ADD_TO_WATCHLIST', payload: ticker })
                  setSearch('')
                  setShowAdd(false)
                }} style={{
                  width: '100%', padding: '10px 14px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8eaf6', fontFamily: 'DM Mono, monospace' }}>{ticker}</div>
                    <div style={{ fontSize: '11px', color: '#6b7db3', fontFamily: 'DM Sans, sans-serif' }}>{STOCKS[ticker]?.name}</div>
                  </div>
                  <Plus size={13} color="#6b7db3" />
                </button>
              ))}
              {searchResults.length === 0 && (
                <div style={{ padding: '12px', fontSize: '13px', color: '#6b7db3', textAlign: 'center', fontFamily: 'DM Sans' }}>No results</div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', flex: 1 }}>
        {watchlist.map(ticker => {
          const stock = prices[ticker]
          if (!stock) return null
          const isSelected = ticker === selectedTicker
          const isUp = stock.changePercent >= 0

          return (
            <div
              key={ticker}
              onClick={() => dispatch({ type: 'SELECT_TICKER', payload: ticker })}
              style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px',
                borderRadius: '10px', cursor: 'pointer',
                background: isSelected ? 'rgba(99,179,237,0.08)' : 'transparent',
                border: isSelected ? '1px solid rgba(99,179,237,0.15)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8eaf6', fontFamily: 'DM Mono, monospace' }}>{ticker}</span>
                  {isUp ? <TrendingUp size={11} color="#00d17a" /> : <TrendingDown size={11} color="#ff4d6d" />}
                </div>
                <div style={{ fontSize: '11px', color: '#4a5578', fontFamily: 'DM Sans', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stock.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <PriceCell price={stock.price} ticker={ticker} />
                <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: isUp ? '#00d17a' : '#ff4d6d', marginTop: '2px' }}>
                  {isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                </div>
              </div>
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: ticker })
                }}
                style={{ marginLeft: '8px', width: '20px', height: '20px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'transparent', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff4d6d' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'transparent' }}
              >
                <X size={11} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}