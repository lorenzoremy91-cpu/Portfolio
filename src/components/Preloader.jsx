import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/*
  Cinematic intro — four phases, one GSAP master timeline.

    1. Black screen, scroll locked, the powder-bloom video plays fullscreen
       and dissipates with a long crossfade before its final frame.
    2. The STUDIO CÉSURE lockup fades in, pure white on absolute black.
    3. The black screen is CUT IN TWO — the site's own gesture, a césure:
       top half rises, bottom half falls (power3.inOut), revealing the hero.
       The logo never moves; mix-blend-difference re-derives it live, white
       over the black panels, near-black over the cream page. Scroll unlocks
       only when the opening completes.
    4. Lives in Hero.jsx (the CTA float is scroll business, not intro
       business): see the [data-cta-float] timeline there.

  ARCHITECTURE NOTES — the load-bearing decisions:

  • The three layers (video, panels, logo) are SIBLING fixed elements
    rendered from a fragment, never nested in a wrapper. A positioned
    wrapper with z-index would become an isolated stacking context, and
    mix-blend-difference only sees the backdrop INSIDE its context — the
    logo would stay white over the revealed page. As direct children of the
    static App root they blend against the real page. Do not wrap them.

  • The scroll lock never touches body position or the DOM's geometry:
    overflow:hidden on <html> (clamps the scroll range to 0 — which also
    neutralises normalizeScroll, since GSAP then has nowhere to scroll to)
    plus non-passive wheel/touchmove/keydown guards. heroH, the pin, and
    every ScrollTrigger measure exactly what they measured before.

  • The hero's own letter reveal waits for this sequence via the
    window.__CESURE_INTRO_DONE__ flag + 'cesure:intro-done' event (flag
    first, so mount order can never deadlock the relay).

  • Every failure path — autoplay refused (iOS Low Power), video 404, slow
    network — degrades by SKIPPING AHEAD, never by trapping the user on
    black: the video gets a hard time budget, and play() rejection jumps
    straight to the logo phase.

  • ?nointro in the URL skips the whole sequence (same escape-hatch
    convention as ?nonormalize / ?debug).
*/

const SCROLL_KEYS = new Set([
  ' ',
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
])

const removeShield = () => {
  document.getElementById('intro-shield')?.remove()
}

const finishFlag = () => {
  window.__CESURE_INTRO_DONE__ = true
  window.dispatchEvent(new Event('cesure:intro-done'))
}

export default function Preloader() {
  // Two refs on purpose: the WRAPPER is what fades (GSAP), the VIDEO is
  // what plays — calling .play() on the div is a crash, not a no-op.
  const videoWrapRef = useRef(null)
  const videoRef = useRef(null)
  const topRef = useRef(null)
  const bottomRef = useRef(null)
  const logoRef = useRef(null)
  const [done, setDone] = useState(false)

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const skip = reduced || location.search.includes('nointro')
    if (skip) {
      removeShield()
      finishFlag()
      setDone(true)
      return undefined
    }

    // ---- scroll lock (geometry-neutral, see notes above) ----
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    /*
      iOS rubber-banding during the locked intro drags the fixed layers
      with it and exposes the <html> ground — which is CREAM (the Safari
      safe-area fix). That is the "white flash": a flick during the intro
      showed cream at the edges. The ground goes black for the duration
      and overscroll glow is disabled; both restored at unlock.
    */
    const prevHtmlBg = document.documentElement.style.backgroundColor
    const prevOverscroll = document.documentElement.style.overscrollBehavior
    document.documentElement.style.backgroundColor = '#000'
    document.documentElement.style.overscrollBehavior = 'none'
    const block = (e) => e.preventDefault()
    const blockKeys = (e) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', block, { passive: false })
    window.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('keydown', blockKeys)
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      document.documentElement.style.overflow = prevOverflow
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.documentElement.style.overscrollBehavior = prevOverscroll
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('keydown', blockKeys)
    }

    /*
      ZERO-OFFSET RELAY — the white lockup is not "roughly centered", it is
      laid ON the hero's real <h1>: same top, same left, same width (same
      classes inside, so the same metrics), measured from the live DOM. And
      the césure opens THROUGH the text: the two panels split at the H1's
      vertical center, not at 50vh — so the seam is born in the middle of
      the words and the reveal grows outward from them. Re-measured when
      the webfonts finish loading (Fraunces metrics differ from the
      fallback serif), but never once the opening has begun.
    */
    let opening = false
    const place = () => {
      if (opening) return
      const h1 = document.querySelector('main h1')
      if (!h1 || !logoRef.current) return
      const r = h1.getBoundingClientRect()
      const cY = Math.round(r.top + r.height / 2)
      gsap.set(logoRef.current, {
        top: r.top,
        left: r.left,
        width: r.width,
        xPercent: 0,
        yPercent: 0,
      })
      /*
        The panels OVERLAP by 1px on each side of the cut: two boxes that
        merely touch leave a sub-pixel antialiasing seam — a faint light
        hairline across the middle of the wordmark, visible on the very
        first frame. The overlap is black-on-black (invisible) and gone
        within the opening's first frames.
      */
      if (topRef.current) gsap.set(topRef.current, { height: cY + 1 })
      if (bottomRef.current)
        gsap.set(bottomRef.current, {
          top: cY - 1,
          height: window.innerHeight - cY + 1,
        })
    }
    place()
    document.fonts?.ready?.then(place)

    // React has painted our own black layers — the HTML shield can go.
    removeShield()

    /*
      Phases 2 → 3, built paused; started once the video hands over (or
      immediately on any video failure). The video crossfades OVER the
      logo's arrival — the smoke's last wisps dissolve as the wordmark
      surfaces, per the "grande fluidité" brief.
    */
    const tl = gsap.timeline({ paused: true })
    tl.to(videoWrapRef.current, { autoAlpha: 0, duration: 0.75, ease: 'power2.inOut' }, 0)
      // The smoke leads, the logo follows: the wordmark only starts once
      // the dissolve is well under way, surfacing through its last wisps.
      .fromTo(
        logoRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.1, ease: 'power3.out' },
        0.55,
      )
      // A breath to read the lockup.
      .addLabel('open', '+=0.85')
      .call(
        () => {
          opening = true
        },
        null,
        'open',
      )
      .to(topRef.current, { yPercent: -100, duration: 1.2, ease: 'power3.inOut' }, 'open')
      .to(bottomRef.current, { yPercent: 100, duration: 1.2, ease: 'power3.inOut' }, 'open')
      // "Une fois l'ouverture terminée, le scroll est débloqué."
      .call(() => {
        unlock()
        finishFlag()
      })
      .to(logoRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '-=0.05')
      .call(() => setDone(true))

    // ---- phase 1: the video, with every escape route wired ----
    const video = videoRef.current
    let started = false
    const handover = () => {
      if (started) return
      started = true
      tl.play()
    }
    let fadeArmed = false
    const onTime = () => {
      // Begin the dissolve shortly before the last frame — never a hard cut.
      if (!fadeArmed && video.duration && video.currentTime > video.duration - 0.8) {
        fadeArmed = true
        handover()
      }
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', handover)
    video.addEventListener('error', handover)
    // Slow network: don't hold a black screen hostage. If the video can't
    // start within 4s, move on; if it started, cap the whole phase at 7s.
    const bootTimeout = setTimeout(() => {
      if (video.readyState < 2) handover()
    }, 4000)
    const hardTimeout = setTimeout(handover, 8000)
    // Always restart from frame 0: a StrictMode/HMR remount re-runs this
    // effect while the element kept playing — without the reset the second
    // run would join the powder mid-flight or already ended (and an
    // 'ended' video never fires 'ended' again: instant skip to the logo).
    try {
      if (video.currentTime > 0.05) video.currentTime = 0
    } catch {
      /* not seekable yet — it will start at 0 anyway */
    }
    /*
      Autoplay refusal is NOT hypothetical on desktop — it reproduced
      right in the test harness: the video sat paused at t=0 while a later
      scripted play() succeeded. Three defenses, layered:

      1. muted is asserted IMPERATIVELY before play(). React's `muted`
         prop famously sets the DOM property without writing the HTML
         attribute, and some autoplay heuristics evaluate the attribute —
         an "unmuted" autoplay video is exactly what gets blocked.
      2. If play() still rejects, retry on the FIRST SIGN OF LIFE — not
         just pointerdown/keydown: a viewer watching an intro doesn't
         click, but their hand rests on the trackpad (mousemove/wheel) or
         the screen (touchstart). Any of them re-arms playback.
      3. A 3.5s grace window: only if nothing has started playing by then
         does the sequence move on to the logo. Black never traps.
    */
    let graceTimeout = null
    const retryPlay = () => {
      video.play().catch(() => {})
    }
    const RETRY_EVENTS = ['pointerdown', 'keydown', 'mousemove', 'wheel', 'touchstart']
    video.defaultMuted = true
    video.muted = true
    const p = video.play()
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        RETRY_EVENTS.forEach((ev) =>
          window.addEventListener(ev, retryPlay, { once: true, passive: true }),
        )
        video.addEventListener(
          'playing',
          () => clearTimeout(graceTimeout),
          { once: true },
        )
        graceTimeout = setTimeout(handover, 3500)
      })
    }

    return () => {
      clearTimeout(bootTimeout)
      clearTimeout(hardTimeout)
      clearTimeout(graceTimeout)
      RETRY_EVENTS.forEach((ev) => window.removeEventListener(ev, retryPlay))
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', handover)
      video.removeEventListener('error', handover)
      // StrictMode remount / teardown mid-intro: never leave the page
      // locked. Deliberately NO finishFlag() here — firing the relay from
      // a dev remount made the hero letters rise under the black while the
      // real intro replayed. If a preloader ever dies without completing,
      // the Hero's own safety timer releases the letters.
      unlock()
    }
  }, [])

  if (done) return null

  return (
    <>
      {/* Phase 3 panels — in place from the first frame so the black is
          continuous; the seam is invisible until they part. The 50/50
          split is only the pre-measure fallback: place() re-cuts them at
          the H1's centerline so the opening is born inside the text. */}
      <div
        ref={topRef}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[1001] h-1/2 bg-black will-change-transform"
      />
      <div
        ref={bottomRef}
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-[1001] h-1/2 bg-black will-change-transform"
      />
      {/* Phase 1 video, above the panels, below the logo. Its own black
          background covers the instants before the first decoded frame. */}
      <div ref={videoWrapRef} aria-hidden="true" className="fixed inset-0 z-[1001] bg-black">
        <video
          ref={videoRef}
          src="/videos/intro.mp4"
          muted
          playsInline
          autoPlay
          preload="auto"
          className="h-full w-full bg-black object-cover"
        />
      </div>
      {/*
        The lockup — the hero H1's exact typographic system (extended
        Archivo eyebrow over Fraunces), white, blended with difference so
        phase 3 re-derives it against whatever passes behind: white on the
        black panels, near-black once the cream page is revealed. The
        chromatic inversion IS the blend mode; no filter gymnastics needed
        on live text.

        NOT flex-centered: place() pins this wrapper to the real H1's
        measured top/left/width, and the inner block carries the H1's exact
        classes — same clamp, same tracking, same eyebrow margins — so the
        two render with identical metrics. When the panels part and this
        fades, the hero title underneath is at the same pixels: the relay
        is invisible.
      */}
      <div
        ref={logoRef}
        aria-hidden="true"
        // will-change + translateZ: during the césure the difference blend
        // re-derives this text against two moving panels every frame; its
        // own composited layer keeps the glyphs rasterised once (no
        // sub-pixel re-render shimmer — the "trembling" during opening).
        className="pointer-events-none fixed left-0 top-0 z-[1002] w-full opacity-0 will-change-transform [mix-blend-mode:difference] [transform:translateZ(0)]"
      >
        <div className="text-center font-serif text-[clamp(3rem,15vw,6rem)] font-semibold uppercase leading-[1.05] tracking-[-0.01em] text-white md:text-[9.5vw] lg:text-[9vw]">
          <span className="type-studio mb-3 block text-[0.24em] tracking-[0.52em] md:mb-4 [&>span:last-child]:-mr-[0.52em]">
            {'STUDIO'.split('').map((l, i) => (
              <span key={i} className="inline-block">
                {l}
              </span>
            ))}
          </span>
          <span className="block">CÉSURE</span>
        </div>
      </div>
    </>
  )
}
