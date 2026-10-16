import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { bySlug, STATUS_LABEL } from '../content/projects.js'
import { CONTACT, mailto, telHref } from '../lib/identity.js'
import NotFound from './NotFound.jsx'

/*
  Le contenu vient désormais de src/content/projects.js, en SYNCHRONE.
  Avant, cette page attendait Sanity dans le navigateur : le HTML partait
  vide, Google ne voyait rien, et un visiteur sur une connexion lente
  regardait un écran blanc. Ici tout est compilé dans le bundle.
*/

/* Rend un { todo: … } en surbrillance, ou le texte simple sinon. */
function Line({ value }) {
  if (value && typeof value === 'object' && value.todo) {
    return (
      <span className="rounded-sm bg-accent/20 px-1.5 py-0.5">
        <span className="text-[0.7em] font-semibold uppercase tracking-widest text-accent">
          À compléter —{' '}
        </span>
        <span className="text-ink/80">{value.todo}</span>
      </span>
    )
  }
  return <span>{value}</span>
}

function Bullets({ items, className = '' }) {
  if (!items?.length) return null
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-base leading-relaxed text-ink/80">
          <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <Line value={it} />
        </li>
      ))}
    </ul>
  )
}

function Block({ eyebrow, title, children }) {
  return (
    <section className="mt-24 md:mt-36">
      {eyebrow && <p className="text-xs uppercase tracking-widest text-ink/50">{eyebrow}</p>}
      {title && (
        <h2 className="font-serif mt-4 text-[clamp(1.75rem,6vw,2.75rem)] font-semibold uppercase leading-[1.05] tracking-[-0.01em]">
          {title}
        </h2>
      )}
      <div className="mt-8">{children}</div>
    </section>
  )
}

/* Cadre de téléphone : rappelle que la conception part du mobile. */
function Phone({ src, alt }) {
  return (
    <figure className="w-[190px] shrink-0 md:w-[230px]">
      <div className="overflow-hidden rounded-[1.75rem] border-[6px] border-ink/85 bg-ink/85 shadow-[0_24px_60px_-28px_rgba(16,16,16,0.55)]">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block h-full w-full" />
      </div>
    </figure>
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const project = bySlug(slug)

  useEffect(() => {
    if (!project) return
    document.title = `${project.title} — Studio Césure`
    const d = document.querySelector('meta[name="description"]')
    if (d) d.setAttribute('content', project.summary)
    window.scrollTo(0, 0)
  }, [project])

  if (!project) return <NotFound />

  const {
    title, status, badge, projectType, year, sector, place,
    liveUrl, liveLabel, summary, cover, context, did,
    visuals, beforeAfter, deliverables, autonomy, results,
  } = project

  const meta = [
    ['Type de projet', projectType],
    ['Année', year],
    ['Secteur', sector],
    ['Lieu', place],
  ].filter(([, v]) => v)

  return (
    <>
      <Navbar />
      <main className="bg-cream px-6 pb-28 pt-28 md:px-10 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/#work"
            className="text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
          >
            ← Tous les projets
          </Link>

          {/*
            Le statut d'abord, et toujours. « En ligne » est une affirmation
            que le visiteur peut vérifier en un clic ; une maquette doit donc
            le dire, sans ambiguïté, avant même le titre du projet.
          */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest ${
                status === 'en-ligne'
                  ? 'bg-accent text-ink'
                  : 'border border-ink/20 text-ink/70'
              }`}
            >
              {STATUS_LABEL[status]}
            </span>
            <span className="text-xs uppercase tracking-widest text-ink/50">{badge}</span>
          </div>

          <h1 className="font-serif mt-6 text-[clamp(2.25rem,9vw,4.5rem)] font-semibold uppercase leading-[1.02] tracking-[-0.015em]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl">
            {summary}
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ink/10 pt-8 md:grid-cols-4">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-widest text-ink/50">{k}</dt>
                <dd className="font-serif mt-2 text-base font-medium md:text-lg">{v}</dd>
              </div>
            ))}
          </dl>

          {cover && (
            <figure className="mt-14 overflow-hidden rounded-lg bg-stone-soft">
              {/* Visuel d'ouverture : seule image chargée en priorité. */}
              <img
                src={cover.src}
                alt={cover.alt}
                fetchPriority="high"
                decoding="async"
                className="block h-full w-full"
              />
            </figure>
          )}

          <Block eyebrow="Le contexte" title="L'enjeu">
            {context.map((p, i) => (
              <p key={i} className="mt-5 max-w-2xl text-base leading-relaxed text-ink/80 md:text-lg">
                {p}
              </p>
            ))}
          </Block>

          <Block eyebrow="La méthode" title="Ce que nous avons fait">
            <Bullets items={did} className="max-w-2xl" />
          </Block>

          {visuals.desktop.length > 0 && (
            <Block eyebrow="Les écrans" title="Le projet en images">
              <div className="space-y-14">
                {visuals.desktop.map((v, i) => (
                  <figure key={i}>
                    <div className="overflow-hidden rounded-lg bg-stone-soft">
                      <img src={v.src} alt={v.alt} loading="lazy" decoding="async" className="block h-full w-full" />
                    </div>
                    {v.caption && (
                      <figcaption className="mt-3 text-sm text-ink/60">{v.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </Block>
          )}

          {visuals.mobile.length > 0 && (
            <Block eyebrow="Sur téléphone" title="L'écran qui compte">
              <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
                {visuals.mobile.map((v, i) => (
                  <Phone key={i} src={v.src} alt={v.alt} />
                ))}
              </div>
            </Block>
          )}

          {beforeAfter.length > 0 && (
            <Block eyebrow="Comparaison" title="Avant / Après">
              <div className="space-y-16">
                {beforeAfter.map((ba, i) => (
                  <div key={i}>
                    <h3 className="font-serif text-lg font-medium md:text-xl">{ba.label}</h3>
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      {[['Avant', ba.before], ['Après', ba.after]].map(([lab, img]) => (
                        <figure key={lab}>
                          <figcaption className="mb-2 text-xs uppercase tracking-widest text-ink/50">
                            {lab}
                          </figcaption>
                          <div className="overflow-hidden rounded-lg bg-stone-soft">
                            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="block h-full w-full" />
                          </div>
                        </figure>
                      ))}
                    </div>
                    {ba.note && <p className="mt-4 max-w-2xl text-sm text-ink/60">{ba.note}</p>}
                  </div>
                ))}
              </div>
            </Block>
          )}

          {(deliverables.length > 0 || autonomy.length > 0) && (
            <Block eyebrow="Ce qui est livré" title="Livrables et autonomie">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                {deliverables.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Livrables</h3>
                    <Bullets items={deliverables} className="mt-5" />
                  </div>
                )}
                {autonomy.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">
                      Ce que le client fait seul ensuite
                    </h3>
                    <Bullets items={autonomy} className="mt-5" />
                  </div>
                )}
              </div>
            </Block>
          )}

          {results.length > 0 && (
            <Block eyebrow="Résultats" title="Ce que ça a produit">
              <Bullets items={results} className="max-w-2xl" />
            </Block>
          )}

          <section className="mt-28 border-t border-ink/10 pt-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-3 self-start rounded-full bg-accent px-7 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-[transform,background-color,color] duration-300 ease-out hover:scale-[1.03] hover:bg-ink hover:text-cream active:scale-[0.97]"
                >
                  {liveLabel}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              ) : (
                <span className="text-sm text-ink/60">
                  Maquette — ce projet n'a pas d'adresse publique.
                </span>
              )}
              <p className="text-sm text-ink/70">
                Un projet comparable ?{' '}
                <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
                  {CONTACT.email}
                </a>{' '}
                ·{' '}
                <a href={telHref} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
                  {CONTACT.phoneDisplay}
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
