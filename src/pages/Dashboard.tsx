/**
 * pages/Dashboard.tsx — Main Layout
 * TypeScript: typed tab state, typed StatPill props
 */

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Power, BarChart2, Newspaper, Briefcase } from 'lucide-react'
import { useStock } from '../context/StockContext'
import StockChart from '../components/chart/StockChart'
import Watchlist from '../components/watchlist/Watchlist'
import Portfolio from '../components/portfolio/Portfolio'
import NewsFeed from '../components/news/NewsFeed'
import PriceAlerts from '../components/ui/PriceAlerts'

type RightTab = 'portfolio' | 'news'

interface StatPillProps {
  label: string
  value: string
  color?: string
}

function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '120px' }}>
      <div style={{ fontSize: '10px', color: '#4a5578', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: color ?? '#e8eaf6' }}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { prices, selectedTicker, liveEnabled, dispatch } = useStock()
  const [rightTab, setRightTab] = useState<RightTab>('portfolio')
  const stock = prices[selectedTicker]

  if (!stock) return null
  const isUp = stock.changePercent >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#090d1e' }}>

      {/* ── Top Bar ── */}
      <header style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(9,13,30,0.9)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="#63b3ed" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#e8eaf6', letterSpacing: '-0.02em' }}>
            MARKET<span style={{ color: '#63b3ed' }}>LENS</span>
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: liveEnabled ? '#00d17a' : '#ff4d6d', boxShadow: liveEnabled ? '0 0 6px #00d17a' : 'none', animation: liveEnabled ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '12px', color: '#6b7db3', fontFamily: 'DM Sans' }}>{liveEnabled ? 'Live' : 'Paused'}</span>
        </div>
        <button onClick={() => dispatch({ type: 'TOGGLE_LIVE' })} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: liveEnabled ? 'rgba(0,209,122,0.1)' : 'rgba(255,77,109,0.1)', color: liveEnabled ? '#00d17a' : '#ff4d6d', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 500 }}>
          <Power size={13} />
          {liveEnabled ? 'Pause' : 'Resume'}
        </button>
      </header>

      {/* ── Three-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', flex: 1, overflow: 'hidden' }}>

        {/* Left — Watchlist + Alerts */}
        <aside style={{ borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <Watchlist />
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
            <PriceAlerts />
          </div>
        </aside>

        {/* Centre — Chart + stock header */}
        <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#e8eaf6', letterSpacing: '-0.02em' }}>{selectedTicker}</h1>
                  <span style={{ fontSize: '13px', color: '#6b7db3', fontFamily: 'DM Sans' }}>{stock.name}</span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(99,179,237,0.1)', color: '#63b3ed', fontFamily: 'DM Sans', fontWeight: 500 }}>{stock.sector}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: '#e8eaf6', letterSpacing: '-0.02em' }}>
                    ${stock.price?.toFixed(2)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isUp ? <TrendingUp size={16} color="#00d17a" /> : <TrendingDown size={16} color="#ff4d6d" />}
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '15px', fontWeight: 600, color: isUp ? '#00d17a' : '#ff4d6d' }}>
                      {isUp ? '+' : ''}{stock.change?.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <StatPill label="Day High" value={`$${stock.high?.toFixed(2)}`} color="#00d17a" />
                <StatPill label="Day Low"  value={`$${stock.low?.toFixed(2)}`}  color="#ff4d6d" />
                <StatPill label="Volume"   value={`${(stock.volume / 1e6).toFixed(1)}M`} />
                <StatPill label="Prev Close" value={`$${stock.prevClose?.toFixed(2)}`} />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden' }}>
            <StockChart
              history={stock.history}
              ticker={selectedTicker}
              currentPrice={stock.price}
              change={stock.changePercent}
            />
          </div>
        </main>

        {/* Right — Portfolio / News tabs */}
        <aside style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {([
              { id: 'portfolio' as RightTab, label: 'Portfolio', icon: <Briefcase size={13} /> },
              { id: 'news'      as RightTab, label: 'News',      icon: <Newspaper size={13} /> },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setRightTab(tab.id)} style={{
                flex: 1, padding: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer',
                background: 'transparent',
                borderBottom: rightTab === tab.id ? '2px solid #63b3ed' : '2px solid transparent',
                color: rightTab === tab.id ? '#63b3ed' : '#6b7db3',
                fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 600, transition: 'all 0.15s',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {rightTab === 'portfolio' ? <Portfolio /> : <NewsFeed />}
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}