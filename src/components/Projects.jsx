import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJECTS, STATUS_LABEL } from '../content/projects.js'
import { layoutFor } from '../lib/projects.js'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/*
  The roster now comes from Sanity (src/lib/projects.js), which falls back to
  a local list whenever the CMS is unconfigured, unreachable or empty — the
  grid can never render blank.

  Note what is NOT stored per project: its column span and aspect ratio. The
  editorial rhythm is derived from the card's position by layoutFor(), so
  adding a client is a content act, never a layout decision.
  (The 3D avatar deliberately does NOT appear here: it lives solely in the
  Story section.)
*/
function ProjectCard({ project, index }) {
  const { title, projectType, year, slug, cover, featured, status } = project
  const phoneShot = project.visuals?.mobile?.[0] ?? null
  const { span, ratio } = layoutFor(index, featured)
  return (
    <article data-project className={`group col-span-1 ${span}`}>
      <Link to={`/projets/${slug}`} className="block">
        <div className={`relative overflow-hidden bg-stone-soft ${ratio}`}>
          {/*
            Deux corrections de cadrage, toutes deux mesurées :

            • <picture> sert la capture TÉLÉPHONE sous 768 px. Une capture
              d'ordinateur rognée en 4/5 ne montre qu'une colonne du centre ;
              la capture téléphone, elle, est déjà au bon format.
            • object-top, et non le centrage par défaut. Ce qui identifie un
              site, c'est son en-tête et son titre — pas une tranche prise au
              milieu de la page.
          */}
          <picture>
            {phoneShot && <source media="(max-width: 767px)" srcSet={phoneShot.src} />}
            <img
              src={cover.src}
              alt={cover.alt}
              /* La première carte est souvent visible d'emblée après le vol
                 de pétales : elle ne doit pas arriver en retard. */
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </picture>
          {/*
            Le statut est porté par la CARTE, pas seulement par la page
            projet : quelqu'un qui parcourt la grille sans cliquer ne doit
            jamais pouvoir prendre une maquette pour un site en service.

            EN BAS À GAUCHE, et non en haut : en haut, la pastille se posait
            pile sur le logo du site capturé — on lisait « EN LIGNE …e Door »
            et « MAQUETTE …ret Nettoyeur ». Le bas de la capture est une zone
            de contenu, bien plus sûre.
          */}
          <span
            className={`absolute bottom-4 left-4 rounded-full px-3 py-1 shadow-sm text-[0.65rem] font-semibold uppercase tracking-widest backdrop-blur-sm ${
              status === 'en-ligne' ? 'bg-accent/95 text-ink' : 'bg-cream/85 text-ink/75'
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-medium tracking-tight md:text-2xl">
            <span className="mr-3 align-middle text-xs text-ink/40">
              {String(index + 1).padStart(2, '0')}
            </span>
            {title}
          </h3>
          <p className="text-right text-xs uppercase tracking-widest text-ink/60">
            {projectType}
            {year ? ` — ${year}` : ''}
          </p>
        </div>
      </Link>
    </article>
  )
}

export default function Projects() {
  const scope = useRef(null)
  /*
    PLUS AUCUN CHARGEMENT ASYNCHRONE. Les projets venaient de Sanity, dans
    le navigateur : la grille était vide au premier rendu, puis grandissait
    APRÈS que ScrollTrigger avait mesuré la page, décalant toutes les
    animations situées en dessous. C'est ce décalage que ce changement
    supprime.

    À NE PAS CONFONDRE avec le référencement : le contenu est maintenant
    dans le BUNDLE, pas dans le HTML. Le fichier servi fait toujours 2 ko et
    ne contient toujours aucun texte. Seul un prérendu mettra ces projets
    dans le HTML — c'est une étape distincte, encore à faire.
  */
  const projects = PROJECTS

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // The cards arrive asynchronously, so this must re-run once they exist
      // (see `dependencies` below) — on the first pass the grid is empty and
      // toArray would match nothing.
      if (!projects.length) return

      gsap.from('[data-projects-heading]', {
        y: 48,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: scope.current,
          start: 'top 75%',
        },
      })

      gsap.utils.toArray('[data-project]').forEach((card) => {
        gsap.from(card, {
          y: 64,
          autoAlpha: 0,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
        })
      })

      /*
        Cover images have no intrinsic size until they load, so every trigger
        below this section would be measured against a collapsing page.
        One refresh once the grid's media has settled keeps the Contact
        section's triggers — and the document height — honest.
      */
      const media = gsap.utils.toArray('[data-project] img, [data-project] video')
      let pending = media.length
      if (!pending) return
      const settle = () => {
        pending -= 1
        if (pending <= 0) ScrollTrigger.refresh()
      }
      media.forEach((el) => {
        const done =
          el.tagName === 'IMG' ? el.complete : el.readyState >= 1
        if (done) settle()
        else {
          el.addEventListener('load', settle, { once: true })
          el.addEventListener('loadedmetadata', settle, { once: true })
          el.addEventListener('error', settle, { once: true })
        }
      })
    },
    { scope, dependencies: [projects] },
  )

  return (
    <section id="work" ref={scope} className="relative bg-cream px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <header
          data-projects-heading
          className="mb-16 flex items-end justify-between md:mb-24"
        >
          <h2 className="font-display text-[clamp(2.5rem,10vw,3.5rem)] font-medium uppercase tracking-hero md:text-6xl lg:text-7xl">
            Projets
          </h2>
          <span className="text-xs uppercase tracking-widest text-ink/60">
            ({String(projects.length).padStart(2, '0')})
          </span>
        </header>

        <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-12 md:gap-y-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
