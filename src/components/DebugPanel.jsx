import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
  On-screen diagnostics for a real phone, where a console is out of reach.
  Add ?debug to the URL to show it. It answers, in one glance, the questions
  that remote debugging cannot: which build is running, whether this device
  took the no-pin mobile path, whether a pin (and therefore a pinSpacer)
  exists, and how the viewport moves as the address bar slides.
*/
export default function DebugPanel() {
  const [on, setOn] = useState(false)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!location.search.includes('debug')) return undefined
    setOn(true)
    const read = () => {
      const triggers = ScrollTrigger.getAll()
      setInfo({
        build: window.__BUILD_ID__ || 'inconnu',
        w: window.innerWidth,
        h: window.innerHeight,
        narrow: window.matchMedia('(max-width: 767px)').matches,
        coarse: window.matchMedia('(pointer: coarse)').matches,
        noHover: window.matchMedia('(hover: none)').matches,
        isTouch: ScrollTrigger.isTouch,
        pins: triggers.filter((t) => t.pin).length,
        pinSpacers: document.querySelectorAll('.pin-spacer').length,
        normalize: !!ScrollTrigger.normalizeScroll(),
        heroH: document.querySelector('section')?.style.minHeight || '—',
        scrollY: Math.round(window.scrollY),
        video: (() => {
          const v = document.querySelector('[data-zone="bg-video"] video')
          return v ? `${v.currentTime.toFixed(2)}s / ${(v.duration || 0).toFixed(2)}s` : '—'
        })(),
        // The iOS tell: an unprimed video paints nothing once seeked.
        primed: (() => {
          const v = document.querySelector('[data-zone="bg-video"] video')
          return v ? v.dataset.primed === '1' : false
        })(),
        ready: (() => {
          const v = document.querySelector('[data-zone="bg-video"] video')
          return v ? v.readyState : '—'
        })(),
      })
    }
    read()
    const id = setInterval(read, 250)
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      clearInterval(id)
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  if (!on || !info) return null

  const bad = info.pins > 0 || info.pinSpacers > 0
  return (
    <div
      className="fixed left-2 top-2 z-[999] max-w-[92vw] rounded-lg bg-ink/85 px-3 py-2 font-mono text-[10px] leading-relaxed text-cream"
      style={{ pointerEvents: 'none' }}
    >
      <div>build {String(info.build).slice(0, 19)}</div>
      <div>
        viewport {info.w}×{info.h} · scroll {info.scrollY}
      </div>
      <div>
        narrow {String(info.narrow)} · coarse {String(info.coarse)} · noHover{' '}
        {String(info.noHover)}
      </div>
      <div>isTouch {String(info.isTouch)} · normalize {String(info.normalize)}</div>
      <div style={{ color: bad ? '#ff8a6a' : '#9fe08f' }}>
        pins {info.pins} · pinSpacers {info.pinSpacers} {bad ? '⚠ PIN ACTIF' : '✓ sans pin'}
      </div>
      <div>heroH {info.heroH} · vidéo {info.video}</div>
      <div style={{ color: info.primed ? '#9fe08f' : '#ff8a6a' }}>
        primed {String(info.primed)} · readyState {info.ready}{' '}
        {info.primed ? '✓' : '⚠ iOS peindra du vide'}
      </div>
    </div>
  )
}
