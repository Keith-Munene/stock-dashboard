/**
 * components/ui/PriceAlerts.tsx
 * TypeScript: AlertCondition union type, typed form state
 */

import React, { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, Plus, X } from 'lucide-react'
import { useStock } from '../../context/StockContext'
import { STOCKS } from '../../data/mockData'
import type { AlertCondition, PriceAlert } from '../../types'
import toast from 'react-hot-toast'

interface AlertForm {
  ticker: string
  condition: AlertCondition
  targetPrice: string
}

export default function PriceAlerts() {
  const { alerts, prices, dispatch, watchlist } = useStock()
  const [showForm, setShowForm] = useState<boolean>(false)
  const [form, setForm] = useState<AlertForm>({
    ticker: watchlist[0] ?? 'AAPL',
    condition: 'above',
    targetPrice: '',
  })
  const prevAlertsRef = useRef<PriceAlert[]>(alerts)

  // Show toast when alert triggers
  useEffect(() => {
    alerts.forEach(alert => {
      const wasTriggered = prevAlertsRef.current.find(a => a.id === alert.id)?.triggered
      if (alert.triggered && !wasTriggered) {
        toast.custom((t) => (
          <div style={{
            background: '#0e1428', border: '1px solid rgba(245,166,35,0.4)',
            borderRadius: '12px', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
          }}>
            <BellRing size={18} color="#f5a623" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8eaf6', fontFamily: 'Syne' }}>
                🔔 Price Alert: {alert.ticker}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7db3', fontFamily: 'DM Sans' }}>
                {alert.ticker} is now {alert.condition} ${alert.targetPrice}
              </div>
            </div>
          </div>
        ), { duration: 5000 })
      }
    })
    prevAlertsRef.current = alerts
  }, [alerts])

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const targetPrice = parseFloat(form.targetPrice)
    if (!form.ticker || isNaN(targetPrice) || targetPrice <= 0) {
      return toast.error('Please enter a valid price')
    }
    dispatch({ type: 'ADD_ALERT', payload: { ticker: form.ticker, condition: form.condition, targetPrice } })
    toast.success(`Alert set: ${form.ticker} ${form.condition} $${targetPrice}`)
    setForm(p => ({ ...p, targetPrice: '' }))
    setShowForm(false)
  }

  const activeAlerts = alerts.filter(a => !a.triggered)
  const triggeredAlerts = alerts.filter(a => a.triggered)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={14} color="#f5a623" />
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, color: '#e8eaf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Alerts
          </h3>
          {activeAlerts.length > 0 && (
            <span style={{ background: '#f5a623', color: '#0a0f1e', fontSize: '10px', fontWeight: 700, fontFamily: 'DM Sans', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeAlerts.length}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(245,166,35,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5a623' }}>
          <Plus size={12} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: 'rgba(245,166,35,0.05)', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid rgba(245,166,35,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7db3', fontFamily: 'DM Sans', marginBottom: '4px' }}>TICKER</div>
              <select value={form.ticker} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm(p => ({ ...p, ticker: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e8eaf6', fontSize: '12px', fontFamily: 'DM Mono, monospace', outline: 'none' }}>
                {Object.keys(STOCKS).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7db3', fontFamily: 'DM Sans', marginBottom: '4px' }}>WHEN</div>
              <select value={form.condition} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm(p => ({ ...p, condition: e.target.value as AlertCondition }))}
                style={{ width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e8eaf6', fontSize: '12px', fontFamily: 'DM Sans', outline: 'none' }}>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7db3', fontFamily: 'DM Sans', marginBottom: '4px' }}>PRICE</div>
              <input type="number" step="0.01" value={form.targetPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, targetPrice: e.target.value }))}
                placeholder={`$${prices[form.ticker]?.price?.toFixed(0) ?? '0'}`}
                style={{ width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e8eaf6', fontSize: '12px', fontFamily: 'DM Mono, monospace', outline: 'none' }} />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '7px', background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '6px', color: '#f5a623', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer' }}>
            Set Alert
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {activeAlerts.map(alert => (
          <div key={alert.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', background: 'rgba(245,166,35,0.04)', borderRadius: '8px', border: '1px solid rgba(245,166,35,0.1)' }}>
            <Bell size={11} color="#f5a623" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#e8eaf6', flex: 1 }}>
              {alert.ticker} {alert.condition} <span style={{ color: '#f5a623' }}>${alert.targetPrice}</span>
            </span>
            <span style={{ fontSize: '11px', color: '#6b7db3', fontFamily: 'DM Mono, monospace', marginRight: '8px' }}>
              ${prices[alert.ticker]?.price?.toFixed(2)}
            </span>
            <button onClick={() => dispatch({ type: 'REMOVE_ALERT', payload: alert.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5578', padding: '2px' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff4d6d' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4a5578' }}>
              <X size={11} />
            </button>
          </div>
        ))}

        {triggeredAlerts.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '10px', color: '#4a5578', fontFamily: 'DM Sans', marginBottom: '4px', textTransform: 'uppercase' }}>Triggered</div>
            {triggeredAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', background: 'rgba(0,209,122,0.04)', borderRadius: '8px', opacity: 0.7, border: '1px solid rgba(0,209,122,0.1)', marginBottom: '3px' }}>
                <BellRing size={11} color="#00d17a" style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#6b7db3', flex: 1 }}>
                  {alert.ticker} {alert.condition} ${alert.targetPrice} ✓
                </span>
                <button onClick={() => dispatch({ type: 'REMOVE_ALERT', payload: alert.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5578', padding: '2px' }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {alerts.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '12px 0', color: '#4a5578', fontSize: '12px', fontFamily: 'DM Sans' }}>
            No alerts set. Click + to add one.
          </div>
        )}
      </div>
    </div>
  )
}