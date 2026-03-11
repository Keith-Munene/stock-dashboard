/**
 * components/news/NewsFeed.tsx
 * TypeScript: Sentiment type union, typed filter state
 */

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MOCK_NEWS } from '../../data/mockData'
import { useStock } from '../../context/StockContext'
import type { Sentiment } from '../../types'

// Map each sentiment to its display config
const SENTIMENT_CONFIG: Record<Sentiment, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  positive: { color: '#00d17a', bg: 'rgba(0,209,122,0.08)',   icon: <TrendingUp size={11} />,   label: 'Bullish' },
  negative: { color: '#ff4d6d', bg: 'rgba(255,77,109,0.08)',  icon: <TrendingDown size={11} />, label: 'Bearish' },
  neutral:  { color: '#6b7db3', bg: 'rgba(107,125,179,0.08)', icon: <Minus size={11} />,        label: 'Neutral' },
}

type FilterMode = 'all' | 'watchlist'

export default function NewsFeed() {
  const { watchlist } = useStock()
  const [filter, setFilter] = useState<FilterMode>('all')

  const news = filter === 'watchlist'
    ? MOCK_NEWS.filter(n => watchlist.includes(n.ticker))
    : MOCK_NEWS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e8eaf6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Market News
        </h2>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px' }}>
          {(['all', 'watchlist'] as FilterMode[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600, fontFamily: 'DM Sans',
              background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filter === f ? '#e8eaf6' : '#6b7db3',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto', flex: 1 }}>
        {news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4a5578', fontSize: '13px', fontFamily: 'DM Sans' }}>
            No news for your watchlist stocks.
          </div>
        ) : news.map(item => {
          const sentiment = SENTIMENT_CONFIG[item.sentiment]
          return (
            <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#63b3ed', background: 'rgba(99,179,237,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.ticker}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, fontFamily: 'DM Sans', color: sentiment.color, background: sentiment.bg, padding: '2px 6px', borderRadius: '4px' }}>
                  {sentiment.icon} {sentiment.label}
                </span>
                <span style={{ fontSize: '11px', color: '#4a5578', fontFamily: 'DM Sans', marginLeft: 'auto' }}>
                  {item.source} · {item.time}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8ceea', fontFamily: 'Syne, sans-serif', lineHeight: 1.4, marginBottom: '6px' }}>
                {item.headline}
              </div>
              <div style={{ fontSize: '12px', color: '#4a5578', fontFamily: 'DM Sans', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.summary}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}