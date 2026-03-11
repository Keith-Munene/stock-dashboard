/**
 * main.tsx — Vite Entry Point
 *
 * Key difference from CRA:
 * - File is main.tsx (not index.js)
 * - Referenced directly in index.html via <script type="module" src="/src/main.tsx">
 * - No react-scripts, Vite handles the bundling
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)