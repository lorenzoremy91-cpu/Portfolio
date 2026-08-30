import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const LINKS = [
  { href: '#studio', label: 'À propos' },
  { href: '#work', label: 'Projets' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const overlayRef = useRef(null)
  const veilRef = useRef(null)
  const introTlRef = useRef(null)
  const closingRef = useRef(false)

  /*
    Section navigation with a veil transition: a cream layer fades in, the
    jump happens instantly while covered, then the veil lifts — no abrupt
    cut and no janky high-speed scroll through the pinned hero. Reduced
    motion gets a plain instant jump.
  */
  const navigateTo = (href) => {
    const target = document.querySelector(href)
    if (!target) return
    const jump = () =>
      window.scrollTo({
        top: Math.round(target.getBoundingClientRect().top + window.scrollY),
        behavior: 'instant',
      })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !veilRef.current) {
      jump()
      return
    }
    /*
      Directional wipe, echoing the curtain language: the veil slides up
      from the bottom edge, covers the viewport (jump happens under it),
      then keeps travelling upward to reveal the destination — one
      continuous rising motion with a gold leading edge.
    */
    const veil = veilRef.current
    gsap
      .timeline()
      .set(veil, { display: 'block', opacity: 1, yPercent: 100 })
      .to(veil, { yPercent: 0, duration: 0.42, ease: 'power3.in' })
      .add(jump)
      .to(veil, { yPercent: -100, duration: 0.55, ease: 'power3.out' }, '+=0.08')
      .set(veil, { display: 'none' })
  }

  const { contextSafe } = useGSAP(
    () => {
      if (!open || !overlayRef.current) return
      closingRef.current = false
      introTlRef.current = gsap
        .timeline()
        .from(overlayRef.current, {
          autoAlpha: 0,
          duration: 0.35,
          ease: 'power2.out',
        })
        .from(
          '[data-menu-link]',
          { y: 48, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'power4.out' },
          '-=0.1',
        )
        .from('[data-menu-meta]', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
    },
    { dependencies: [open], scope: overlayRef },
  )

  /*
    Exit mirrors the entrance in reverse: meta drops first, links cascade
    away last-to-first, then the panel fades — and only on completion does
    the overlay unmount (setOpen(false)). `after` runs ~60ms later, once
    React has released the body scroll lock, so a deferred smooth-scroll
    actually moves.
  */
  const closeMenu = contextSafe((after) => {
    if (closingRef.current || !overlayRef.current) return
    closingRef.current = true
    introTlRef.current?.kill()
    gsap
      .timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          closingRef.current = false
          setOpen(false)
          if (after) setTimeout(after, 60)
        },
      })
      .to('[data-menu-meta]', { y: 16, autoAlpha: 0, duration: 0.4 })
      .to(
        '[data-menu-link]',
        { y: 40, autoAlpha: 0, duration: 0.55, stagger: { each: 0.09, from: 'end' } },
        '-=0.2',
      )
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.45 }, '-=0.15')
  })

  // Lock page scroll while the menu is open; Escape plays the exit.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && closeMenu()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleNav = (e, href) => {
    e.preventDefault()
    closeMenu(() => navigateTo(href))
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-nav">
      {/* Navigation veil — a rising wipe that covers the instant jump
          between sections; gold hairline on its leading (top) edge */}
      <div
        ref={veilRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90] hidden border-t-2 border-accent bg-cream will-change-transform"
      />
      {/* On small screens the fixed bar gets a translucent blur backdrop so
          scrolled content never collides visually with the menu; md+ keeps
          the fully transparent desktop bar. */}
      <nav className="flex h-full items-center justify-between px-6 max-md:bg-cream/75 max-md:backdrop-blur-md md:px-10">
        <a href="/" className="font-display text-lg font-medium tracking-tight">
          Césure<span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-8 text-sm md:flex">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault()
                  navigateTo(href)
                }}
                className="relative py-1 transition-colors duration-300 hover:text-accent after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-[width] after:duration-300 hover:after:w-full"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="text-sm uppercase tracking-widest transition-colors hover:text-accent md:hidden"
        >
          Menu
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex flex-col bg-cream px-6 pb-10 md:hidden"
        >
          <div className="flex h-nav items-center justify-between">
            <a href="/" className="font-display text-lg font-medium tracking-tight">
              Césure<span className="text-accent">.</span>
            </a>
            <button
              type="button"
              onClick={() => closeMenu()}
              className="text-sm uppercase tracking-widest transition-colors hover:text-accent"
            >
              Fermer
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center">
            {LINKS.map(({ href, label }, i) => (
              <a
                key={href}
                href={href}
                data-menu-link
                onClick={(e) => handleNav(e, href)}
                className="group flex items-baseline gap-4 border-b border-ink/10 py-5 first:border-t"
              >
                <span className="text-xs text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-4xl font-semibold leading-none tracking-[-0.01em] transition-colors group-hover:text-accent">
                  {label}
                </span>
              </a>
            ))}
          </nav>

          <div
            data-menu-meta
            className="flex items-center justify-between text-xs uppercase tracking-widest text-ink/60"
          >
            <span>
              Paris <span className="text-accent">—</span> {new Date().getFullYear()}
            </span>
            <a href="mailto:hello@cesure.studio" className="transition-colors hover:text-accent">
              hello@cesure.studio
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
