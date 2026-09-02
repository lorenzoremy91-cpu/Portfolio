import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Version stamp: open the console on any device and compare with the local
// build to detect a stale deploy immediately.
window.__BUILD_ID__ = __BUILD_ID__
console.info('Césure build:', __BUILD_ID__)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
