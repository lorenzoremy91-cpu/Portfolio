import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import Navbar from '../components/Navbar.jsx'
import { fetchProject } from '../lib/projects.js'
import { urlFor } from '../lib/sanity.js'

/*
  Serialisers for the case-study rich text. The schema deliberately offers no
  colours, sizes or alignments, so every decision about how a paragraph or a
  quote LOOKS is made once, here, in the site's own type scale. A case study
  written in a hurry still lands inside the art direction.
*/
const portableComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-6 text-base leading-relaxed text-ink/80 md:text-lg">{children}</p>
    ),
    h3: ({ children }) => (
      <h3 className="font-display mt-14 text-2xl font-medium tracking-tight md:text-3xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="font-display my-12 border-l-2 border-accent pl-6 text-xl font-medium leading-snug text-ink md:text-2xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-6 space-y-2 text-base leading-relaxed text-ink/80 md:text-lg">
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3">
        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = urlFor(value, { width: 1600 })
      if (!src) return null
      return (
        <figure className="my-12">
          <img
            src={src}
            alt={value?.alt || ''}
            loading="lazy"
            decoding="async"
            className="w-full rounded-lg"
          />
          {value?.caption && (
            <figcaption className="mt-3 text-xs uppercase tracking-widest text-ink/50">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

export default function CaseStudy() {
  const { slug } = useParams()
  const [project, setProject] = useState(undefined) // undefined = chargement

  useEffect(() => {
    let alive = true
    window.scrollTo(0, 0)
    setProject(undefined)
    fetchProject(slug).then((doc) => {
      if (alive) setProject(doc)
    })
    return () => {
      alive = false
    }
  }, [slug])

  // Titre d'onglet et description : chaque étude de cas est une page à part
  // entière pour Google et pour un partage de lien.
  useEffect(() => {
    if (!project) return undefined
    const previousTitle = document.title
    document.title = `${project.title} — Studio Césure`
    const meta = document.querySelector('meta[name="description"]')
    const previousDesc = meta?.getAttribute('content')
    if (meta && project.summary) meta.setAttribute('content', project.summary)
    return () => {
      document.title = previousTitle
      if (meta && previousDesc != null) meta.setAttribute('content', previousDesc)
    }
  }, [project])

  if (project === undefined) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-dvh items-center justify-center px-6">
          <p className="text-xs uppercase tracking-widest text-ink/40">Chargement…</p>
        </main>
      </>
    )
  }

  if (project === null) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="font-serif text-[clamp(2rem,8vw,3rem)] font-semibold uppercase">
            Projet introuvable
          </h1>
          <Link
            to="/#work"
            className="mt-8 text-xs uppercase tracking-widest text-ink/60 underline decoration-accent underline-offset-8 transition-colors hover:text-accent"
          >
            Voir tous les projets
          </Link>
        </main>
      </>
    )
  }

  const { title, client, category, year, summary, roles, results, body, gallery, liveUrl } = project
  const cover = project.coverUrl
  const coverVideo = project.coverVideoUrl

  return (
    <>
      <Navbar />
      <main className="bg-cream pb-28 pt-nav md:pb-40">
        <article>
          {/* En-tête */}
          <header className="mx-auto max-w-7xl px-6 pt-16 md:px-10 md:pt-24">
            <Link
              to="/#work"
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
            >
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Tous les projets
            </Link>

            <p className="mt-10 flex items-center gap-3 text-xs uppercase tracking-widest text-ink/60">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {category}
            </p>

            <h1 className="font-serif mt-6 max-w-4xl text-[clamp(2.5rem,11vw,5rem)] font-semibold uppercase leading-[1.02] tracking-[-0.01em] [transform:translateZ(0)]">
              {title}
            </h1>

            {summary && (
              <p className="font-display mt-8 max-w-2xl text-lg font-medium leading-snug text-ink md:text-xl">
                {summary}
              </p>
            )}

            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-ink/10 pt-8 md:grid-cols-4">
              {client && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ink/50">Client</dt>
                  <dd className="font-display mt-2 text-base font-medium md:text-lg">{client}</dd>
                </div>
              )}
              {year && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ink/50">Année</dt>
                  <dd className="font-display mt-2 text-base font-medium md:text-lg">{year}</dd>
                </div>
              )}
              {roles?.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-xs uppercase tracking-widest text-ink/50">Notre rôle</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink/75"
                      >
                        {role}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </header>

          {/* Visuel de couverture */}
          {(coverVideo || cover) && (
            <div className="mx-auto mt-16 max-w-7xl px-6 md:mt-24 md:px-10">
              <div className="overflow-hidden rounded-lg bg-stone-soft">
                {coverVideo ? (
                  <video
                    src={coverVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={cover}
                    alt={project.coverAlt || title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Récit */}
          {body?.length > 0 && (
            <div className="mx-auto mt-20 max-w-3xl px-6 md:mt-28 md:px-10">
              <PortableText value={body} components={portableComponents} />
            </div>
          )}

          {/* Résultats */}
          {results?.length > 0 && (
            <div className="mx-auto mt-20 max-w-7xl px-6 md:mt-28 md:px-10">
              <ul className="grid gap-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10 sm:grid-cols-2 md:grid-cols-4">
                {results.map((r, i) => (
                  <li key={i} className="bg-cream p-7">
                    <p className="font-serif text-3xl font-semibold text-accent md:text-4xl">
                      {r.value}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-ink/60">{r.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Galerie */}
          {gallery?.length > 0 && (
            <div className="mx-auto mt-20 grid max-w-7xl gap-6 px-6 md:mt-28 md:grid-cols-2 md:gap-8 md:px-10">
              {gallery.map((img, i) => {
                const src = urlFor(img, { width: 1400 })
                if (!src) return null
                return (
                  <figure key={img._key || i} className={i % 3 === 0 ? 'md:col-span-2' : ''}>
                    <img
                      src={src}
                      alt={img.alt || ''}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-lg"
                    />
                    {img.caption && (
                      <figcaption className="mt-3 text-xs uppercase tracking-widest text-ink/50">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              })}
            </div>
          )}

          {/* Le site en ligne */}
          {liveUrl && (
            <div className="mx-auto mt-24 max-w-7xl px-6 text-center md:mt-32 md:px-10">
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-accent px-8 py-4 text-xs font-medium uppercase tracking-widest text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_28px_-14px_rgba(16,16,16,0.4)] transition-[transform,background-color,color,box-shadow] duration-300 ease-out hover:scale-[1.04] hover:bg-ink hover:text-cream active:scale-[0.96]"
              >
                Voir le site en ligne
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          )}
        </article>
      </main>
    </>
  )
}
