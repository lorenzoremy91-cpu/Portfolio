import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Story from './components/Story.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import DebugPanel from './components/DebugPanel.jsx'
import Preloader from './components/Preloader.jsx'

export default function App() {
  return (
    /*
      This root div must stay STATIC (no position/z/transform/filter): the
      Preloader's layers are its direct children precisely so the logo's
      mix-blend-difference reaches the real page behind them, and both
      background welds hang fixed layers from this subtree.
    */
    <div className="min-h-dvh">
      <Preloader />
      <CustomCursor />
      {/* Renders only with ?debug in the URL — a phone-readable diagnostic. */}
      <DebugPanel />
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Projects />
        <Contact />
      </main>
    </div>
  )
}
