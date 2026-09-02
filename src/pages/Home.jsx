import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Story from '../components/Story.jsx'
import Projects from '../components/Projects.jsx'
import Contact from '../components/Contact.jsx'
import Preloader from '../components/Preloader.jsx'

/*
  The one-page experience, unchanged. It is now a ROUTE rather than the whole
  app, which matters for one reason: the pinned hero, both background welds
  and the scrubbed videos only ever mount here. A case study page is a plain
  document — no pin, no weld, no scrub — so nothing of that machinery has to
  survive a route change.

  Lenis deliberately stays inside Hero (home only). On a case study there is
  no 24fps scrubbed video, and the roughness Lenis was brought in to smooth
  was precisely the wheel steps reaching that decoder — native scroll on a
  plain content page is already silk, and keeping Lenis out of the router
  leaves the hard-won intro-lock relay untouched.
*/
export default function Home() {
  const { hash } = useLocation()

  /*
    Arriving from a case study as /#work: the router changes the URL but
    never scrolls, and the target section does not exist until this route
    has painted. One frame of delay is enough for the layout to settle;
    Lenis gets the jump when it owns the scroll so its internal target
    cannot lerp us back.
  */
  useEffect(() => {
    if (!hash) return undefined
    /*
      Re-asserted, not fired once: this page's height keeps moving after the
      first paint — the pin spacer is measured, then the project covers load
      and ScrollTrigger refreshes. A single jump landed ~400px short.
      Three attempts over ~600ms cost nothing and settle on the real
      position; each one recomputes the target's offset from scratch.
    */
    const jump = () => {
      const target = document.querySelector(hash)
      if (!target) return
      const top = Math.round(target.getBoundingClientRect().top + window.scrollY)
      if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true })
      else window.scrollTo({ top, behavior: 'instant' })
    }
    const raf = requestAnimationFrame(jump)
    const t1 = setTimeout(jump, 250)
    const t2 = setTimeout(jump, 600)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [hash])

  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
