import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Story from './components/Story.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import CustomCursor from './components/CustomCursor.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <CustomCursor />
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
