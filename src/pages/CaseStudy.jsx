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

/*
  Cadre de téléphone — affiché UNIQUEMENT sur ordinateur (voir la section
  des visuels). Sur un vrai téléphone, montrer une capture de téléphone
  dans un petit cadre de 178 px était absurde : l'écran EST déjà le cadre.
*/
function Phone({ src, alt }) {
  return (
    <figure className="w-[260px] shrink-0">
      <div className="overflow-hidden rounded-[2rem] border-[7px] border-ink/85 bg-ink/85 shadow-[0_28px_70px_-30px_rgba(16,16,16,0.6)]">
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
    visuals, beforeAfter, deliverables, autonomy,
  } = project

  /* Première capture téléphone : sert de couverture sous 768 px. */
  const phoneShot = visuals.mobile[0] ?? null

  /*
    La couverture est presque toujours la première capture d'ordinateur.
    La galerie ne doit donc pas la remontrer : on filtre par l'adresse du
    fichier plutôt que par l'index, pour que ça tienne aussi si la
    couverture vient d'ailleurs.
  */
  const galleryDesktop = visuals.desktop.filter((v) => v.src !== cover?.src)

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
            /*
              LA BONNE IMAGE POUR LE BON ÉCRAN. Une capture d'ordinateur de
              1440 px réduite à 390 px sur un téléphone rend son texte 2,7
              fois trop petit : ça ne se lit pas, ça fait une tache. <picture>
              sert la capture téléphone sous 768 px — et comme le navigateur
              ne télécharge QUE la source retenue, c'est aussi plus léger.
            */
            <figure className="mt-14 overflow-hidden rounded-xl bg-stone-soft shadow-[0_30px_70px_-40px_rgba(16,16,16,0.45)]">
              <picture>
                {phoneShot && <source media="(max-width: 767px)" srcSet={phoneShot.src} />}
                <img
                  src={cover.src}
                  alt={cover.alt}
                  fetchPriority="high"
                  decoding="async"
                  className="mx-auto block w-full"
                />
              </picture>
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

          {/*
            UNE SEULE SECTION DE VISUELS, au lieu de deux.

            Avant : « Les écrans » montrait les captures d'ordinateur à tous,
            puis « L'écran qui compte » rajoutait des vignettes de 178 px.
            Sur un téléphone, cela donnait des captures illisibles suivies de
            miniatures encore plus petites — deux fois la même information,
            mal rendue les deux fois.

            Maintenant : chaque écran ne reçoit que ce qui s'y lit.
              • téléphone — les captures téléphone, pleine largeur, à peu
                près à l'échelle 1:1, donc nettes ;
              • ordinateur — les captures ordinateur en grand, et les
                captures téléphone dans un cadre, qui n'a de sens que là.
          */}
          {(visuals.desktop.length > 0 || visuals.mobile.length > 0) && (
            <Block eyebrow="Les écrans" title="Le projet en images">
              {/*
                TÉLÉPHONE. On saute la première capture téléphone : elle sert
                déjà de couverture juste au-dessus.

                Les DÉTAILS DE SECTION, eux, sont montrés ici AUSSI. Ils
                étaient réservés à l'ordinateur, et un visiteur sur téléphone
                ne voyait donc qu'une seule image de tout le projet. Ce sont
                des découpes de section — un titre, des photos, une grille —
                et non des pages entières réduites : leur contenu reste
                lisible à 342 px, parce qu'on y regarde une composition, pas
                un paragraphe.
              */}
              <div className="space-y-10 md:hidden">
                {[...visuals.mobile.slice(1), ...galleryDesktop].map((v, i) => (
                  <figure key={i}>
                    <div className="overflow-hidden rounded-xl bg-stone-soft shadow-[0_24px_60px_-34px_rgba(16,16,16,0.5)]">
                      <img src={v.src} alt={v.alt} loading="lazy" decoding="async" className="block w-full" />
                    </div>
                    {v.caption && (
                      <figcaption className="mt-3 text-sm text-ink/60">{v.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
              {/* Repli : un projet sans capture téléphone montre quand même
                  quelque chose plutôt qu'un vide. */}
              {visuals.mobile.length === 0 && visuals.desktop.length > 0 && (
                <div className="space-y-10 md:hidden">
                  {visuals.desktop.slice(0, 2).map((v, i) => (
                    <figure key={i}>
                      <div className="overflow-hidden rounded-xl bg-stone-soft">
                        <img src={v.src} alt={v.alt} loading="lazy" decoding="async" className="block w-full" />
                      </div>
                    </figure>
                  ))}
                </div>
              )}

              {/* ORDINATEUR */}
              <div className="hidden md:block">
                {galleryDesktop.length > 0 && (
                <div className="space-y-14">
                  {galleryDesktop.map((v, i) => (
                    <figure key={i}>
                      <div className="overflow-hidden rounded-xl bg-stone-soft shadow-[0_30px_70px_-40px_rgba(16,16,16,0.4)]">
                        <img src={v.src} alt={v.alt} loading="lazy" decoding="async" className="block w-full" />
                      </div>
                      {v.caption && (
                        <figcaption className="mt-3 text-sm text-ink/60">{v.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
                )}
                {visuals.mobile.length > 0 && (
                  <div className="mt-16 flex flex-wrap justify-center gap-8">
                    {visuals.mobile.map((v, i) => (
                      <Phone key={i} src={v.src} alt={v.alt} />
                    ))}
                  </div>
                )}
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
