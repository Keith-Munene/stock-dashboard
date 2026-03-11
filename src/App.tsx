import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { StockProvider } from './context/StockContext'
import Dashboard from './pages/Dashboard'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <StockProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0e1428',
              color: '#e8eaf6',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StockProvider>
    </BrowserRouter>
  )
}
