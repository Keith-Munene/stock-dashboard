/**
 * components/portfolio/Portfolio.tsx
 * TypeScript: typed form state interface, typed SVG props
 */

import React, { useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useStock } from '../../context/StockContext'
import { STOCKS } from '../../data/mockData'
import toast from 'react-hot-toast'

// ── Typed form state ──
interface HoldingForm {
  ticker: string
  shares: string
  avgCost: string
}

// ── Allocation bar props ──
interface AllocationBarProps {
  portfolio: Array<{ ticker: string; shares: number }>
  prices: Record<string, { price: number }>
}

function AllocationBar({ portfolio, prices }: AllocationBarProps) {
  const total = portfolio.reduce((s, h) => s + (prices[h.ticker]?.price ?? 0) * h.shares, 0)
  if (total === 0) return null

  const colors = ['#63b3ed', '#00d17a', '#f5a623', '#c084fc', '#ff4d6d', '#38bdf8']
  let offset = 0

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', color: '#6b7db3', fontFamily: 'DM Sans', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Allocation
      </div>
      <svg width="100%" height="8" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        {portfolio.map((h, i) => {
          const value = (prices[h.ticker]?.price ?? 0) * h.shares
          const pct = value / total
          const x = offset * 100
          offset += pct
          return <rect key={h.ticker} x={`${x}%`} y="0" width={`${pct * 100}%`} height="8" fill={colors[i % colors.length]} />
        })}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {portfolio.map((h, i) => {
          const value = (prices[h.ticker]?.price ?? 0) * h.shares
          const pct = ((value / total) * 100).toFixed(1)
          return (
            <div key={h.ticker} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[i % colors.length] }} />
              <span style={{ fontSize: '11px', color: '#6b7db3', fontFamily: 'DM Sans' }}>{h.ticker} {pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const { prices, portfolio, portfolioValue, portfolioGain, portfolioGainPct, dispatch } = useStock()
  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [form, setForm] = useState<HoldingForm>({ ticker: 'AAPL', shares: '', avgCost: '' })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const shares = parseFloat(form.shares)
    const avgCost = parseFloat(form.avgCost)
    if (!form.ticker || isNaN(shares) || shares <= 0 || isNaN(avgCost) || avgCost <= 0) {
      return toast.error('Please fill in all fields correctly')
    }
    if (!STOCKS[form.ticker.toUpperCase()]) {
      return toast.error('Unknown ticker symbol')
    }
    dispatch({ type: 'ADD_HOLDING', payload: { ticker: form.ticker.toUpperCase(), shares, avgCost } })
    toast.success(`Added ${shares} shares of ${form.ticker.toUpperCase()}`)
    setForm({ ticker: 'AAPL', shares: '', avgCost: '' })
    setShowAdd(false)
  }

  const isGain = portfolioGain >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e8eaf6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Portfolio
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

      {/* Total value card */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '11px', color: '#6b7db3', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Value</div>
        <div style={{ fontSize: '26px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#e8eaf6', marginBottom: '4px' }}>
          ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isGain ? <TrendingUp size={13} color="#00d17a" /> : <TrendingDown size={13} color="#ff4d6d" />}
          <span style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: isGain ? '#00d17a' : '#ff4d6d' }}>
            {isGain ? '+' : ''}${Math.abs(portfolioGain).toFixed(2)} ({isGain ? '+' : ''}{portfolioGainPct.toFixed(2)}%)
          </span>
          <span style={{ fontSize: '11px', color: '#4a5578', fontFamily: 'DM Sans' }}>unrealized</span>
        </div>
      </div>

      {portfolio.length > 0 && <AllocationBar portfolio={portfolio} prices={prices} />}

      {showAdd && (
        <form onSubmit={handleAdd} style={{ background: 'rgba(99,179,237,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid rgba(99,179,237,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[
              { label: 'Ticker', key: 'ticker' as keyof HoldingForm, placeholder: 'AAPL' },
              { label: 'Shares', key: 'shares' as keyof HoldingForm, placeholder: '10' },
              { label: 'Avg Cost', key: 'avgCost' as keyof HoldingForm, placeholder: '150.00' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: '10px', color: '#6b7db3', fontFamily: 'DM Sans', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
                <input
                  value={form[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '7px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e8eaf6', fontSize: '12px', fontFamily: 'DM Mono, monospace', outline: 'none' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ flex: 1, padding: '8px', background: '#63b3ed', border: 'none', borderRadius: '8px', color: '#0a0f1e', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer' }}>
              Add Position
            </button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#6b7db3', fontSize: '12px', fontFamily: 'DM Sans', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
        {portfolio.map(holding => {
          const stock = prices[holding.ticker]
          if (!stock) return null
          const currentValue = stock.price * holding.shares
          const costBasis = holding.avgCost * holding.shares
          const gain = currentValue - costBasis
          const gainPct = (gain / costBasis) * 100
          const isUp = gain >= 0

          return (
            <div key={holding.ticker} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8eaf6', fontFamily: 'DM Mono, monospace' }}>{holding.ticker}</span>
                    <span style={{ fontSize: '11px', color: '#4a5578', fontFamily: 'DM Sans' }}>{holding.shares} shares</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#4a5578', fontFamily: 'DM Sans', marginTop: '2px' }}>
                    Avg ${holding.avgCost.toFixed(2)} · Now ${stock.price.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => { dispatch({ type: 'REMOVE_HOLDING', payload: holding.ticker }); toast.success(`Removed ${holding.ticker}`) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5578', padding: '2px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff4d6d' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4a5578' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: '#e8eaf6' }}>
                  ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: isUp ? '#00d17a' : '#ff4d6d', background: isUp ? 'rgba(0,209,122,0.08)' : 'rgba(255,77,109,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                  {isUp ? '+' : ''}${gain.toFixed(2)} ({isUp ? '+' : ''}{gainPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          )
        })}
        {portfolio.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5578', fontSize: '13px', fontFamily: 'DM Sans' }}>
            <DollarSign size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
            No holdings yet. Add your first position.
          </div>
        )}
      </div>
    </div>
  )
}