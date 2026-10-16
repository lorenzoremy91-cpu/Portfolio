import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONTACT, PRINCIPAL, mailto, telHref } from '../lib/identity.js'

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
          Parlons de
          <br />
          votre projet
        </h2>

        {/* Les deux moyens de contact au même niveau : un commanditaire
            associatif ou artisan décroche plus souvent qu'il n'écrit. */}
        <div data-contact className="mt-12 flex flex-col gap-5 md:mt-16">
          <a
            href={mailto}
            className="font-display text-xl underline decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-3xl"
          >
            {CONTACT.email}
          </a>
          <a
            href={telHref}
            className="font-display text-xl underline decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-3xl"
          >
            {CONTACT.phoneDisplay}
          </a>
        </div>

        {/* Le studio parle au « nous », mais l'engagement est nominatif :
            à ce niveau de budget, le client doit savoir qui il aura en face. */}
        <p data-contact className="mt-10 max-w-md text-sm leading-relaxed text-ink/70 md:text-base">
          {PRINCIPAL.statement}
        </p>

        <footer
          data-contact
          className="mt-24 flex flex-col gap-4 border-t border-ink/10 pt-6 text-xs uppercase tracking-widest text-ink/60 md:mt-36 md:flex-row md:items-center md:justify-between"
        >
          <span>
            © {new Date().getFullYear()} Césure — Studio digital · {CONTACT.location}
          </span>
          {/*
            Instagram / Behance / LinkedIn retirés : les trois pointaient vers
            « # », donc vers nulle part. Un lien mort dans un pied de page est
            un signal de négligence sur un site qui doit inspirer confiance.
            À remettre quand les comptes existeront.
          */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            <Link to="/mentions-legales" className="transition-colors hover:text-accent">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="transition-colors hover:text-accent">
              Confidentialité
            </Link>
          </nav>
        </footer>
      </div>
    </section>
  )
}
