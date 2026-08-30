import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/*
  Minimalist custom cursor: an 8px ink dot that trails the pointer with a
  short eased lag and grows only slightly (×1.8 → ~14px) over interactive
  elements. Renders exclusively on fine-pointer devices with motion allowed —
  touchscreens and reduced-motion users keep their native experience.
*/
export default function CustomCursor() {
  const dotRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (fine && !reduced) setEnabled(true)
  }, [])

  useEffect(() => {
    const dot = dotRef.current
    if (!enabled || !dot) return undefined
    document.documentElement.classList.add('custom-cursor-active')
    gsap.set(dot, { xPercent: -50, yPercent: -50 })
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3.out' })
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3.out' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const over = (e) => {
      const interactive = e.target.closest?.('a, button, [role="button"]')
      gsap.to(dot, { scale: interactive ? 1.8 : 1, duration: 0.25, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('custom-cursor-active')
      gsap.killTweensOf(dot)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-ink/80"
    />
  )
}
