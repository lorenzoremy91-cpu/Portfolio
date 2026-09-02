import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchProjects, layoutFor } from '../lib/projects.js'

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
  const { title, category, year, slug, coverUrl, coverVideoUrl, coverAlt, featured } = project
  const { span, ratio } = layoutFor(index, featured)
  const hoverZoom =
    'transition-transform duration-700 ease-out group-hover:scale-[1.04]'
  return (
    <article data-project className={`group col-span-1 ${span}`}>
      <Link to={`/projets/${slug}`} className="block">
        <div className={`overflow-hidden bg-stone-soft ${ratio}`}>
          {coverVideoUrl ? (
            <video
              src={coverVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover ${hoverZoom}`}
            />
          ) : (
            <img
              src={coverUrl}
              alt={coverAlt || title}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover ${hoverZoom}`}
            />
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-medium tracking-tight md:text-2xl">
            <span className="mr-3 text-xs text-ink/40 align-middle">
              {String(index + 1).padStart(2, '0')}
            </span>
            {title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-ink/60">
            {category}
            {year ? ` — ${year}` : ''}
          </p>
        </div>
      </Link>
    </article>
  )
}

export default function Projects() {
  const scope = useRef(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let alive = true
    fetchProjects().then((list) => {
      if (alive) setProjects(list)
    })
    return () => {
      alive = false
    }
  }, [])

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
            <ProjectCard key={project._id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
