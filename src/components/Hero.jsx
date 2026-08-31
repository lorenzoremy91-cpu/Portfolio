import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/*
  Global config, executed at module load — i.e. BEFORE any ScrollTrigger is
  created anywhere in the app (this module is imported by App before Hero
  renders, and Story creates its triggers later).
*/
ScrollTrigger.config({ ignoreMobileResize: true })

/*
  pinType 'transform': GSAP's default on touch devices is position:fixed
  pinning, and a fixed pinned element is exactly what iOS Safari re-lays-out
  when the address bar slides — the classic pinSpacer collapse. Transform
  pinning keeps the element in normal flow and merely translates it, so the
  bar has nothing to disturb. Only the desktop branch pins at all, but this
  makes any pin safe on any device that reaches it (iPads included).
*/
ScrollTrigger.defaults({ pinType: 'transform' })

/*
  Scrolling is NATIVE everywhere — normalizeScroll was tried for the
  pin-entry jolt and proved erratic on real iOS (bounces, locked touch,
  uncontrolled jumps), so it must never come back.

  NO PIN ON MOBILE (<768px): Safari's address-bar resize during the first
  scroll gesture disturbs GSAP pinning (jump/lock). On touch-mobile the hero
  is plain flow — the petal flight scrubs across the hero's own natural
  one-viewport exit instead of a pinned hold. Desktop keeps the pinned
  cinematic hold.
*/
/*
  Belt-and-braces phone detection. A width media query alone is not enough:
  if it ever resolves false on a real device (a stale viewport meta, an
  unusual zoom/text-size setting, a webview reporting a wide layout), the
  DESKTOP branch would run on a phone — creating a pin, hence a pinSpacer,
  hence exactly the reported iOS collapse. Any of these three signals is
  enough to take the no-pin path:
    • narrow layout, • coarse pointer (finger), • no hover capability.
*/
/*
  ── THE iOS ROOT CAUSE ───────────────────────────────────────────────────
  On iOS Safari a <video> that has NEVER been played does not paint frames
  obtained by seeking. It shows its poster, and the moment you set
  currentTime the poster is dismissed — leaving the element blank. A
  scroll-scrubbed video therefore goes empty on the very first scroll
  (confirmed on a real iPhone: the hero showed the poster at 0.00s, then
  bare backdrop colour at 0.06s while the scrub itself kept working).

  The cure is to "prime" the element: play it for an instant, then pause.
  After that Safari renders seeked frames normally. muted + playsInline
  normally allows this without a gesture; in Low Power Mode autoplay is
  refused, so we also prime on the first touch, which is a user gesture.
  Desktop browsers do not need this, but priming is harmless there.
*/
export function primeVideo(v) {
  if (!v || v.dataset.primed === '1') return
  const resume = () => {
    v.pause()
    v.dataset.primed = '1'
  }
  try {
    const p = v.play()
    if (p && typeof p.then === 'function') p.then(resume).catch(() => {})
    else resume()
  } catch {
    /* ignore — the touch handler will try again */
  }
}

const NARROW_MQ = window.matchMedia('(max-width: 767px)')
const COARSE_MQ = window.matchMedia('(pointer: coarse)')
const NO_HOVER_MQ = window.matchMedia('(hover: none)')
const MOBILE_NO_PIN =
  NARROW_MQ.matches || COARSE_MQ.matches || NO_HOVER_MQ.matches

/*
  HEIGHT AUTHORITY — captured in JS ONCE at load (iOS toolbar show/hide can
  never move it, unlike dynamic CSS viewport units which shift mid-scroll
  and break ScrollTrigger's pin geometry). Section, pin distance and curtain
  track all derive from this single number, making raw overlap between
  sections geometrically impossible. Only a real orientation change updates
  it (followed by a full refresh) — rotating the phone is the one case where
  keeping the load-time value would be wrong.
*/
let viewportH = window.innerHeight
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    viewportH = window.innerHeight
    ScrollTrigger.refresh()
  }, 300)
})

// Live media-query handles (checked at use time, cheap).
const REDUCED_MQ = window.matchMedia('(prefers-reduced-motion: reduce)')
const FINE_POINTER_MQ = window.matchMedia('(hover: hover) and (pointer: fine)')

const TITLE = 'CÉSURE'

// Master plate: daisy in the lower-left of the studio background,
// petals fly off over the video's 5s — playback is scrubbed by scroll.
// This cut ends on warm golden-cream light (~#ddc093 average) — the Story
// section's background gradient picks up exactly that tone.
const BACKGROUND_VIDEO = '/videos/background-daisy.mp4'

/*
  Image-trail pool. Cards are invisible until the cursor moves; they spawn in
  sequence along the cursor's path (round-robin through this pool), so order
  here is the dealing order of the trail.
*/
const TRAIL_IMAGES = [
  '/images/eclipse.jpg',
  '/images/watch.jpg',
  '/images/plate.jpg',
  '/images/leaves.jpg',
  '/images/perfume.jpg',
  '/images/excavator.jpg',
  '/images/sneaker.jpg',
  '/images/sky.jpg',
  '/images/basketball.jpg',
  '/images/pasta.jpg',
  '/images/camera.jpg',
  '/images/stethoscope.jpg',
]

// Spawn a new card once the cursor has travelled this far (px).
const SPAWN_DISTANCE = 70

export default function Hero() {
  const scope = useRef(null)
  const bgVideoRef = useRef(null)
  const curtainRef = useRef(null)
  const layerRef = useRef(null)
  const spacerRef = useRef(null)
  const trailState = useRef({ lastX: null, lastY: null, idx: 0, z: 10 })

  useGSAP(
    () => {
      // Intro reveal — typography only; the trail cards stay hidden until
      // the cursor moves. Skipped entirely under prefers-reduced-motion:
      // .from() tweens never created means everything simply renders in its
      // final state.
      if (!REDUCED_MQ.matches) {
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-letter]', { yPercent: 115, duration: 1.1, stagger: 0.055 })
          .from('[data-tagline]', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.55')
          .from('[data-cta]', { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.45')
      }

      /*
        Trail initial state: every card centered on its transform origin,
        fully hidden. They only ever appear through spawnCard below.
      */
      gsap.set('[data-trail]', { xPercent: -50, yPercent: -50, opacity: 0, scale: 0 })

      /*
        Scroll-scrubbed background playback (petal flight): proxy tween so
        the scrub smoothing is real, seek coalescing so the decoder never
        chokes, metadata re-sync for scroll-restored loads.
      */
      const proxy = { p: 0 }
      let pendingSeek = null
      // Tighter seek threshold on phones (1/60 s ≈ 2.7 px of scroll) so the
      // very first pixels of a finger gesture already move the playhead —
      // no dead zone before the first petal lifts. Desktop keeps 1/30.
      /*
        DESKTOP JUDDER, measured: both plates are 24 fps (ffprobe), so one
        frame is 1/24 s — which over the desktop's one-screen scroll is ~6.6px.
        The old epsilon of 1/30 s (~5.3px) was FINER than a frame, so a
        trackpad — which emits many sub-pixel deltas per frame — kept ordering
        seeks that decoded the frame already on screen. Those wasted decodes
        queue up behind the useful ones and come back late: that is the
        stutter.

        Fix: snap the desktop target to the 24 fps grid and use half a frame
        as the epsilon, so a genuine one-frame move always passes while
        sub-frame jitter issues nothing at all. Same frames, far fewer seeks.
        p=1 still lands on the closing frame the weld depends on.
        Phones keep their existing values byte-for-byte.
      */
      const FPS = 24
      const seekEps = MOBILE_NO_PIN ? 1 / 60 : 1 / (FPS * 2)
      const applySeek = () => {
        const video = bgVideoRef.current
        if (!video || !video.duration) return
        const raw = proxy.p * video.duration
        const target = MOBILE_NO_PIN
          ? raw
          : Math.min(Math.round(raw * FPS) / FPS, video.duration)
        if (video.seeking) {
          pendingSeek = target
        } else if (Math.abs(video.currentTime - target) > seekEps) {
          video.currentTime = target
        }
      }
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        onUpdate: applySeek,
        scrollTrigger: MOBILE_NO_PIN
          ? {
              // Mobile: no pin — the scrub rides the hero's own natural
              // exit: petals fly from the first scrolled pixel until the
              // section has fully left the viewport.
              /*
                Phones: the flight runs across the hero's own screen height
                (start = first scrolled pixel, end = one screen later). The
                spacer added below then gives page 2 its own screen of travel
                AFTER the flight is finished, so the two plates never show
                different moments of the same scene at once.
                scrub 0.15 (not 0.5): half a second of catch-up smoothing
                reads as a dead zone under the thumb.
              */
              /*
                Absolute scroll positions, NO trigger element: nothing is
                measured against a box whose height Safari can change. The
                flight runs from the first scrolled pixel to one captured
                screen-height later, full stop.
              */
              start: () => 0,
              end: () => viewportH,
              scrub: 0.15,
              invalidateOnRefresh: true,
            }
          : {
              trigger: scope.current,
              start: 'top top',
              // Function-based so invalidateOnRefresh re-reads it, but it
              // always returns the load-captured viewportH — stable.
              end: () => `+=${viewportH}`,
              pin: true,
              /*
                0.1, not 0.5. Half a second of catch-up easing is what made a
                Mac trackpad feel desynchronised: the playhead kept arriving
                late and then rushing to catch up. 0.1 tracks the finger
                essentially 1:1 while still absorbing the momentum jitter that
                scrub:true would pass straight through to the decoder.
              */
              scrub: 0.1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
      })
      /*
        Declared out here so the cleanup below can actually remove it. It used
        to be a `const` scoped inside the `if` block, which meant the two
        window listeners were never removed — and that is not cosmetic:

        StrictMode double-invokes this effect in development, and every Vite
        hot reload re-runs it again. Each run leaves another live
        `primeOnGesture` closure on window. They are all {once:true}, so they
        ALL fire on the first click anywhere on the page — including the
        Projets CTA. The stale ones close over a `proxy` whose tween
        gsap.context already reverted to p=0, so they compute
        target = 0 * duration and command the video back to frame 0: a visible
        snap to the start of the flight, mid-scroll, in dev only.
      */
      let primeOnGesture = null
      if (bgVideoRef.current) {
        // Property assignments (not addEventListener) stay idempotent across
        // StrictMode re-runs.
        bgVideoRef.current.onloadedmetadata = applySeek
        /*
          Prime for iOS (see primeVideo above) then micro-seek to warm the
          decoder. Priming also happens on the first touch/pointer gesture,
          which is what unblocks Low Power Mode.
        */
        bgVideoRef.current.onloadeddata = (e) => {
          primeVideo(e.target)
          if (e.target.currentTime === 0) e.target.currentTime = 0.001
        }
        primeVideo(bgVideoRef.current)
        primeOnGesture = () => {
          primeVideo(bgVideoRef.current)
          applySeek()
        }
        window.addEventListener('touchstart', primeOnGesture, { once: true, passive: true })
        window.addEventListener('pointerdown', primeOnGesture, { once: true, passive: true })
        if (bgVideoRef.current.readyState >= 1) applySeek()
        bgVideoRef.current.onseeked = (e) => {
          if (pendingSeek !== null) {
            const t = pendingSeek
            pendingSeek = null
            e.target.currentTime = t
          }
        }
      }

      /*
        The background curtain track must span the hero's full scroll
        footprint: the pinned viewport (innerHeight) + the pin distance
        (+=100% = another innerHeight). CSS 200vh matches on desktop, but
        innerHeight is the authority ScrollTrigger uses, so size it in px on
        every refresh.
      */
      const sizeCurtain = () => {
        // Section, pin and curtain all locked to the load-captured viewportH
        // (min-h-svh in the markup is only the pre-JS fallback) — one height
        // authority makes raw section overlap geometrically impossible.
        // Without a pin, the hero's scroll footprint is just its own height,
        // so the mobile curtain track is 1× viewportH instead of 2×.
        /*
          PHONES: the background layer is a plain `position: fixed` element
          with NO height of our own (see JSX). Safari itself keeps a fixed
          element matched to the visual viewport as the address bar comes and
          goes — no JS height, no CSS viewport unit, nothing for a resize to
          collapse. Later sections are opaque and come after it in the DOM, so
          they cover it as they arrive; that is the whole "curtain".
          Only the flow heights below need locking.
        */
        if (!MOBILE_NO_PIN && curtainRef.current) {
          /*
            Two screens on BOTH platforms now. Desktop: the section + the
            pinned hold. Phones: the section + the spacer below it — and the
            phone layer is position:sticky, which stays glued for exactly
            (trackHeight − layerHeight) = one screen, i.e. precisely the
            flight. A one-screen track (the previous value) clipped the
            bottom-anchored daisy away as soon as the user scrolled.
          */
          curtainRef.current.style.height = `${viewportH * 2}px`
        }
        if (scope.current) {
          scope.current.style.minHeight = `${viewportH}px`
        }
        // Phone-only runway: one screen of transparent scroll AFTER the
        // flight, so page 2 rises only once the petals have finished.
        if (spacerRef.current) {
          spacerRef.current.style.height = MOBILE_NO_PIN ? `${viewportH}px` : '0px'
        }
        /*
          THE iOS BUG: the sticky layer used to be sized with the CSS unit
          `lvh` — the LARGE viewport height, i.e. the height with Safari's
          address bar HIDDEN (~852px on an iPhone 14) — while viewportH is
          innerHeight captured with the bar VISIBLE (~745px). Two fatal
          consequences on a real phone, both invisible in a desktop preview:
            • the daisy is anchored to the bottom of an 852px box inside a
              745px window, so it sits ~107px BELOW THE FOLD at first paint
              (the beige empty screen), and
            • sticky then holds for track − layer = 638px instead of 745px,
              releasing before the flight ends (the brutal jump to page 2).
          Locking the layer to the same px authority as everything else fixes
          both. Desktop clears the inline height (the fixed layer uses inset-0).
        */
        if (layerRef.current) {
          // Phones: no explicit height at all — the fixed parent is sized by
          // the browser. Desktop: inset-0 on the fixed layer does the work.
          layerRef.current.style.height = ''
        }
      }
      sizeCurtain()
      /*
        refreshInit, NOT refresh: 'refresh' fires AFTER ScrollTrigger has
        measured the page, so the first pass measured the track at its CSS
        fallback height (200svh) and only then did we swap in the px value —
        leaving every trigger anchored to stale geometry until something else
        forced a second refresh. refreshInit runs before measuring.
      */
      ScrollTrigger.addEventListener('refreshInit', sizeCurtain)

      /*
        Re-assert ignoreMobileResize HERE as well as at module load. GSAP
        stores it as `ScrollTrigger.isTouch === 1 && value` (ScrollTrigger.js
        ~line 2175) — evaluated at call time. At module load, before the
        plugin has run its touch detection, isTouch can still be undefined,
        which silently turns the flag OFF. By this point the plugin is
        initialised, so the setting sticks.
      */
      ScrollTrigger.config({ ignoreMobileResize: true })

      /*
        normalizeScroll — GSAP's official iOS weapon: it takes scrolling onto
        the main thread, which stops Safari from showing/hiding its address
        bar at all, so the resize that collapses everything never happens.

        Scoped to touch devices only, and escapable: it was tried once before
        and felt erratic, so `?nonormalize` in the URL turns it off without a
        redeploy if it misbehaves again on a specific device.
      */
      if (MOBILE_NO_PIN && !location.search.includes('nonormalize')) {
        ScrollTrigger.normalizeScroll(true)
      }

      // Cleanup (runs on context revert): kill any in-flight spawn tweens.
      // Spawn timelines are deliberately created OUTSIDE this context (plain
      // gsap in spawnCard) so they don't accumulate in context.data forever —
      // this is the one piece of teardown they need.
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', sizeCurtain)
        // See primeOnGesture above. Removing an already-fired {once:true}
        // listener is a harmless no-op, so this is safe on every path; in
        // production the component mounts once and this only runs at teardown,
        // leaving the iOS priming path bit-identical.
        if (primeOnGesture) {
          window.removeEventListener('touchstart', primeOnGesture)
          window.removeEventListener('pointerdown', primeOnGesture)
        }
        gsap.killTweensOf(gsap.utils.toArray('[data-trail]', scope.current || undefined))
      }
    },
    { scope },
  )

  /*
    One card of the trail: placed at the cursor, tilted by horizontal
    velocity (alternating bias), it blooms in while gliding a step further
    along the cursor's direction — the elastic lag — then sinks away on its
    own, so a stopped cursor leaves the trail to settle and fade back to
    nothing. killTweensOf lets a fast cursor recycle pool cards mid-flight.

    Deliberately a PLAIN function (not contextSafe): gsap.context retains
    every animation created under it until revert, so per-spawn timelines
    would otherwise accumulate for the life of the page. These tweens always
    end hidden and need no revert; the useGSAP cleanup kills in-flight ones.
  */
  const spawnCard = (clientX, clientY, dx, dy) => {
    const state = trailState.current
    const pool = gsap.utils.toArray('[data-trail]', scope.current)
    if (!pool.length) return
    const rect = scope.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const el = pool[state.idx % pool.length]
    state.idx += 1
    state.z += 1
    const tilt =
      gsap.utils.clamp(-16, 16, dx * 0.25) + (state.idx % 2 ? 5 : -5)
    gsap.killTweensOf(el)
    gsap
      .timeline()
      .set(el, { x, y, zIndex: state.z, rotation: tilt * 0.4, opacity: 0, scale: 0.3 })
      .to(el, {
        opacity: 1,
        scale: 1,
        rotation: tilt,
        x: x + gsap.utils.clamp(-90, 90, dx * 0.9),
        y: y + gsap.utils.clamp(-90, 90, dy * 0.9),
        duration: 0.5,
        ease: 'power2.out',
      })
      .to(
        el,
        {
          opacity: 0,
          scale: 0.25,
          y: '+=44',
          rotation: tilt * 1.7,
          duration: 0.75,
          ease: 'power2.in',
        },
        '+=0.12',
      )
  }

  /*
    Spawns are distance-gated: every SPAWN_DISTANCE px of CURSOR travel deals
    the next card. The gate tracks raw client coordinates — never
    section-relative ones — because after the pin releases, scrolling shifts
    the section under a stationary cursor, and a rect-relative gate would
    count that scroll as cursor travel and spawn phantom cards. Conversion to
    section coordinates happens only at spawn time, inside spawnCard.
  */
  const onHeroMove = (e) => {
    if (REDUCED_MQ.matches) return
    const state = trailState.current
    if (state.lastX === null) {
      state.lastX = e.clientX
      state.lastY = e.clientY
      return
    }
    const dx = e.clientX - state.lastX
    const dy = e.clientY - state.lastY
    if (Math.hypot(dx, dy) > SPAWN_DISTANCE) {
      spawnCard(e.clientX, e.clientY, dx, dy)
      state.lastX = e.clientX
      state.lastY = e.clientY
    }
  }

  const onHeroLeave = () => {
    trailState.current.lastX = null
    trailState.current.lastY = null
  }

  return (
    <>
      {/*
        Background curtain track — OUTSIDE the pinned section, because
        ScrollTrigger's pin leaves a transform on the section and a
        transformed ancestor turns position:fixed into position:absolute.
        This track is document-anchored, spans the hero's full scroll
        footprint (sized by sizeCurtain), and clips a viewport-FIXED layer:
        the background stays frozen in place while the pinned hero's CONTENT
        slides up over it like a blind. The Story section runs the identical
        weld, and its frame 0 matches this video's final frame — so the seam
        stays in perfect registration at every scroll position. No
        autoplay/loop: playback is driven entirely by the scroll scrub.
      */}
      <div
        aria-hidden="true"
        ref={curtainRef}
        className={
          MOBILE_NO_PIN
            ? 'fixed inset-0 overflow-hidden'
            : 'absolute left-0 top-0 w-full'
        }
        data-zone="bg-video"
        style={
          MOBILE_NO_PIN
            ? // Phones: ZERO viewport units and zero JS height. `fixed
              // inset-0` is re-laid-out by the browser itself whenever
              // Safari's bar moves, so it can never collapse or desync.
              { backgroundColor: '#cfc9ba' }
            : { clipPath: 'inset(0)', height: `${viewportH * 2}px` }
        }
      >
        {/*
          Phones use a NATIVE sticky layer instead of the clipped fixed one:
          with fixed+clip, the track's shrinking clip window cut the
          bottom-anchored daisy away as soon as the user scrolled, so the end
          of the petal flight played out of sight. Sticky keeps the whole
          plate glued to the screen for the flight, then releases naturally
          into page 2. NOTE: the track must NOT get overflow-hidden below md —
          an overflow ancestor silently disables sticky.
          Desktop/tablet keep the clipped fixed layer the pin relies on.
        */}
        {/* Phones: fills the browser-managed fixed parent (inset-0, no
            height of its own). Desktop: the clipped viewport-fixed layer. */}
        <div
          ref={layerRef}
          className={MOBILE_NO_PIN ? 'absolute inset-0 overflow-hidden' : 'fixed inset-0'}
        >
          {/* Mobile-only backdrop: fills the space above the scaled-down
              video with the footage's wall tones, leaving the upper half
              free for the typography. Hidden on md+. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-[#d0ccc0] via-[#d5d0c2] to-[#cfc9ba] lg:hidden"
          />
          {/* MOBILE + TABLET FRAMING — must stay IDENTICAL to the Story
              section's video classes, or the curtain weld loses pixel
              registration: bottom-anchored, 185vw wide on phones and 160vw
              on tablets, top edge dissolving upward so departing petals fade
              into the sky instead of hard-cutting. lg+ is the untouched
              desktop cover.

              Phone framing is measured, not eyeballed. In frame 0 the yellow
              disc sits at 24.6% of the video width and the flower head spans
              11.5%–44.5%. At 185vw/-20vw that puts the head between 1.3vw and
              62vw: it still hugs the lower-left corner, but the right ~38vw
              stays clear so the petal flight reads against the darker
              backdrop. Widening or shifting right eats that corridor. */}
          {/* poster = frame 0 as an instant JPEG: on slow mobile networks
              the daisy is visible before a single video byte arrives. */}
          <video
            ref={bgVideoRef}
            src={BACKGROUND_VIDEO}
            poster="/videos/poster-hero.jpg"
            muted
            playsInline
            preload="auto"
            className="absolute bottom-0 left-[-20vw] w-[185vw] max-w-none [mask-image:linear-gradient(to_top,black_72%,transparent_100%)] md:left-[-8vw] md:w-[160vw] lg:static lg:h-full lg:w-full lg:object-cover lg:object-center lg:[mask-image:none]"
          />
          <div className="absolute inset-0 bg-cream/20" />
          {/* Warm sunlight glows (daisy-gold, very low opacity) + filmic
              grain to lift the plate out of monochrome. Static layers only —
              the scroll scrub drives the video untouched. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(90% 70% at 78% 8%, rgba(217, 151, 30, 0.12), transparent 55%), radial-gradient(70% 60% at 12% 92%, rgba(217, 151, 30, 0.08), transparent 60%)',
            }}
          />
          <div className="grain absolute inset-0" />
        </div>
      </div>

    <section
      ref={scope}
      onMouseMove={onHeroMove}
      onMouseLeave={onHeroLeave}
      // ZERO CSS viewport units: the height comes from the JS-captured
      // innerHeight, in px, from the very first paint (sizeCurtain keeps it
      // in sync on refreshes). Nothing here can change when Safari's bar moves.
      /*
        will-change on the PINNED element only. ScrollTrigger pins with
        pinType:'transform', so this section is transform-animated for the
        whole hold — telling the compositor up front earns it a dedicated
        layer instead of one promoted mid-gesture.

        This is safe here for one specific reason: the section contains NO
        position:fixed descendant. will-change:transform makes an element the
        containing block for fixed descendants, which is exactly why the
        background curtain track is a SIBLING of this section and not a child
        (see the track's comment). The track and the Story weld must never
        receive this — it would demote their `fixed inset-0` layers to
        absolute and destroy both welds.
      */
      style={{
        minHeight: `${viewportH}px`,
        ...(MOBILE_NO_PIN ? null : { willChange: 'transform' }),
      }}
      className="relative flex flex-col justify-center overflow-hidden px-6 pt-nav md:px-10"
    >

      {/* Layer 0.5 — cursor image trail, under the typography. Cards live at
          the layer origin and are positioned purely via transforms when they
          spawn along the cursor path. Rendered only for fine pointers with
          motion allowed — touch devices never see the trail, so they never
          pay for its images either. */}
      {FINE_POINTER_MQ.matches && !REDUCED_MQ.matches && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          data-zone="cursor-trail"
        >
          {TRAIL_IMAGES.map((src) => (
            <div
              key={src}
              data-trail
              className="absolute left-0 top-0 w-24 will-change-transform md:w-32"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-lg shadow-ink/15">
                <img src={src} alt="" decoding="async" className="h-full w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layer 1 — central typography over the plate's daisy (lower left),
          lifted well above center so the composition breathes */}
      <div className="relative z-10 mx-auto -mt-[5vh] w-full max-w-4xl text-center md:-mt-[15vh]">
        <h1
          aria-label={TITLE}
          className="font-serif overflow-hidden text-[clamp(3rem,15vw,6rem)] font-semibold uppercase leading-[1.05] tracking-[-0.01em] md:text-[9.5vw] lg:text-[9vw]"
        >
          {TITLE.split('').map((letter, i) => (
            <span
              key={i}
              data-letter
              aria-hidden="true"
              className="inline-block will-change-transform"
            >
              {letter}
            </span>
          ))}
        </h1>
        <span data-tagline className="mx-auto mt-3 block h-px w-12 bg-accent" />
        <p
          data-tagline
          className="mx-auto mt-3 max-w-md text-sm uppercase tracking-widest text-ink/85 md:text-base"
        >
          L'art du détail, le rythme de l'image.
        </p>
        <div data-cta className="mt-8">
          <a
            href="#work"
            // min-h-11 = 44px: the minimum comfortable tap target on phones
            // (the pill measured 40px before, just under the threshold).
            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-accent px-7 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-all duration-300 hover:bg-ink hover:text-cream"
          >
            Projets
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            >
              ↓
            </span>
          </a>
        </div>
      </div>

    </section>

    {/* Phone-only scroll runway (height set by sizeCurtain; 0 elsewhere):
        the screen of travel during which page 2 rises, AFTER the petal
        flight has finished — so the hero plate and the Story plate always
        show the same frame while both are on screen. */}
    <div ref={spacerRef} aria-hidden="true" style={{ height: 0 }} />
    </>
  )
}
