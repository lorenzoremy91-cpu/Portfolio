import { Link } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import { CONTACT, mailto, telHref } from '../lib/identity.js'

/*
  Gabarit commun aux pages légales. Volontairement sobre : pas de marguerite,
  pas d'avatar, aucun scrub vidéo — ces pages doivent être lisibles, imprimables
  et rapides. Elles n'embarquent donc aucune machinerie GSAP.

  `À COMPLÉTER` est un composant visible exprès : une mention légale fausse
  est un risque juridique, un trou bien signalé n'en est pas un.
*/
export function ToComplete({ children }) {
  return (
    <mark className="mx-0.5 rounded-sm bg-accent/25 px-1.5 py-0.5 text-ink decoration-accent underline-offset-2">
      <span className="text-[0.7em] font-semibold uppercase tracking-widest text-accent">
        À compléter —{' '}
      </span>
      {children}
    </mark>
  )
}

export function Section({ title, children }) {
  return (
    <section className="mt-12 border-t border-ink/10 pt-8 first:mt-0 first:border-0 first:pt-0">
      <h2 className="font-serif text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
        {children}
      </div>
    </section>
  )
}

export default function LegalLayout({ eyebrow, title, intro, children }) {
  return (
    <>
      <Navbar />
      <main className="bg-cream px-6 pb-24 pt-28 md:px-10 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-ink/60">{eyebrow}</p>
          <h1 className="font-serif mt-4 text-[clamp(2rem,8vw,3.25rem)] font-semibold uppercase leading-[1.05] tracking-[-0.01em]">
            {title}
          </h1>
          {intro && <p className="mt-6 max-w-xl text-ink/70">{intro}</p>}

          <div className="mt-16">{children}</div>

          <footer className="mt-20 border-t border-ink/10 pt-8">
            <p className="text-sm text-ink/70">
              Une question sur ce document ?{' '}
              <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
                {CONTACT.email}
              </a>{' '}
              ou{' '}
              <a href={telHref} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
                {CONTACT.phoneDisplay}
              </a>
              .
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-full border border-ink/15 px-6 py-3 text-xs font-medium uppercase tracking-widest transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              ← Retour à l'accueil
            </Link>
          </footer>
        </div>
      </main>
    </>
  )
}
