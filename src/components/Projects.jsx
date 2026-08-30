import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Placeholder roster — swap media/titles as real case studies land.
// (The 3D avatar deliberately does NOT appear here: it lives solely in the
// Story section.)
const PROJECTS = [
  {
    title: 'Marguerite',
    category: 'Direction artistique',
    year: '2026',
    media: { type: 'video', src: '/videos/daisy.mp4' },
    ratio: 'aspect-[4/3]',
    span: 'md:col-span-7',
  },
  {
    title: 'Lumière',
    category: 'Identité visuelle',
    year: '2025',
    media: { type: 'image', src: '/images/lumiere.jpg' },
    ratio: 'aspect-[4/5]',
    span: 'md:col-span-5 md:mt-32',
  },
  {
    title: 'Interlude',
    category: 'Développement web',
    year: '2025',
    media: { type: 'image', src: '/images/interlude.jpg' },
    ratio: 'aspect-[16/9]',
    span: 'md:col-span-7 md:col-start-6',
  },
]

function ProjectCard({ project, index }) {
  const { title, category, year, media, ratio, span } = project
  const hoverZoom =
    'transition-transform duration-700 ease-out group-hover:scale-[1.04]'
  return (
    <article data-project className={`group col-span-1 ${span}`}>
      <a href="#" className="block">
        <div className={`overflow-hidden bg-stone-soft ${ratio}`}>
          {media.type === 'video' ? (
            <video
              src={media.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover ${hoverZoom}`}
            />
          ) : (
            <img
              src={media.src}
              alt={title}
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
            {category} — {year}
          </p>
        </div>
      </a>
    </article>
  )
}

export default function Projects() {
  const scope = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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
    },
    { scope },
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
            ({String(PROJECTS.length).padStart(2, '0')})
          </span>
        </header>

        <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-12 md:gap-y-8">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
