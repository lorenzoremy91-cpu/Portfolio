import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-ink/60">Erreur 404</p>
        <h1 className="font-serif mt-4 text-[clamp(2.5rem,10vw,4rem)] font-semibold uppercase leading-none">
          Page introuvable
        </h1>
        <p className="mt-6 max-w-md text-ink/70">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="group mt-10 inline-flex min-h-11 items-center gap-3 rounded-full bg-accent px-7 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-[transform,background-color,color] duration-300 ease-out hover:scale-[1.04] hover:bg-ink hover:text-cream active:scale-[0.96]"
        >
          Retour à l'accueil
        </Link>
      </main>
    </>
  )
}
