import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Contact() {
  const scope = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.utils.toArray('[data-contact]').forEach((block, i) => {
        gsap.from(block, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power4.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: scope.current,
            start: 'top 75%',
          },
        })
      })
    },
    { scope },
  )

  return (
    <section
      id="contact"
      ref={scope}
      className="relative bg-cream px-6 pb-10 pt-28 md:px-10 md:pt-40"
    >
      <div className="mx-auto max-w-7xl">
        <p data-contact className="text-xs uppercase tracking-widest text-ink/60">
          Contact
        </p>

        <h2
          data-contact
          className="font-display mt-6 text-[clamp(2.5rem,11vw,4rem)] font-medium uppercase leading-[0.95] tracking-hero md:text-7xl lg:text-8xl"
        >
          Travaillons
          <br />
          ensemble
        </h2>

        <div data-contact className="mt-12 md:mt-16">
          <a
            href="mailto:hello@cesure.studio"
            className="font-display text-xl underline decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-3xl"
          >
            hello@cesure.studio
          </a>
        </div>

        <footer
          data-contact
          className="mt-24 flex flex-col gap-4 border-t border-ink/10 pt-6 text-xs uppercase tracking-widest text-ink/60 md:mt-36 md:flex-row md:items-center md:justify-between"
        >
          <span>© {new Date().getFullYear()} Césure — Studio digital, Paris</span>
          <div className="flex gap-8">
            <a href="#" className="transition-colors hover:text-accent">Instagram</a>
            <a href="#" className="transition-colors hover:text-accent">Behance</a>
            <a href="#" className="transition-colors hover:text-accent">LinkedIn</a>
          </div>
        </footer>
      </div>
    </section>
  )
}
