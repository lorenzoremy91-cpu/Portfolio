import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import CustomCursor from './components/CustomCursor.jsx'
import DebugPanel from './components/DebugPanel.jsx'
import Home from './pages/Home.jsx'
import CaseStudy from './pages/CaseStudy.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const { pathname } = useLocation()

  /*
    The black first-paint shield in index.html is normally cleared by the
    Preloader — but the Preloader only mounts on the home route. Landing
    directly on a case study (a shared link, a refresh, a search result)
    would otherwise leave the page under an opaque black layer forever.
    Any non-home route clears it itself.
  */
  useEffect(() => {
    if (pathname !== '/') document.getElementById('intro-shield')?.remove()
  }, [pathname])

  return (
    /*
      This root div must stay STATIC (no position/z/transform/filter): the
      Preloader's layers are its direct children (via Home) precisely so the
      logo's mix-blend-difference reaches the real page behind them, and both
      background welds hang fixed layers from this subtree.
    */
    <div className="min-h-dvh">
      <CustomCursor />
      {/* Renders only with ?debug in the URL — a phone-readable diagnostic. */}
      <DebugPanel />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projets/:slug" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
