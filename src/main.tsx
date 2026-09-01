import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/base.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline support is a bonus; sandboxed contexts can throw on access alone, so
// the whole thing is guarded rather than only the returned promise.
// VITE_SW=off drops this block at build time, for single-file builds that ship
// without an sw.js beside them.
window.addEventListener('load', () => {
  if (import.meta.env.VITE_SW === 'off') return
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
    }
  } catch {
    /* the app works without it */
  }
})
