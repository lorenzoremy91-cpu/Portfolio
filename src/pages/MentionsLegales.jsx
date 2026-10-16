import LegalLayout, { Section, ToComplete } from '../components/LegalLayout.jsx'
import { CONTACT, LEGAL, SITE, mailto, telHref } from '../lib/identity.js'

export default function MentionsLegales() {
  return (
    <LegalLayout
      eyebrow="Informations légales"
      title="Mentions légales"
      intro={`Informations prévues par l'article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.`}
    >
      <Section title="Éditeur du site">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-xs uppercase tracking-widest text-ink/50">Responsable</dt>
          <dd>{LEGAL.editor}</dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">Statut</dt>
          <dd>{LEGAL.status}</dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">Adresse</dt>
          <dd>{LEGAL.address}</dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">SIRET</dt>
          <dd>{LEGAL.siret}</dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">Courriel</dt>
          <dd>
            <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
              {CONTACT.email}
            </a>
          </dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">Téléphone</dt>
          <dd>
            <a href={telHref} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
              {CONTACT.phoneDisplay}
            </a>
          </dd>
          <dt className="text-xs uppercase tracking-widest text-ink/50">TVA</dt>
          <dd>
            {/*
              Franchise en base confirmée. Aucun numéro de TVA
              intracommunautaire n'a donc à figurer ici : en afficher un
              serait une erreur, pas une précaution.
            */}
            TVA non applicable, article 293 B du Code général des impôts
          </dd>
        </dl>
      </Section>

      <Section title="Directeur de la publication">
        <p>{LEGAL.publisher}</p>
      </Section>

      <Section title="Hébergeur">
        <p>
          {LEGAL.host.name}
          <br />
          {LEGAL.host.address}
          <br />
          <a
            href={LEGAL.host.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
          >
            vercel.com
          </a>
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L'ensemble de ce site — structure, textes, mise en page, code source,
          images et animations — est la propriété de {LEGAL.editor}, sauf mention
          contraire. Toute reproduction ou représentation, totale ou partielle,
          sans autorisation écrite préalable, est interdite.
        </p>
        <p>
          Les visuels présentés dans les études de cas restent la propriété de
          leurs commanditaires respectifs et sont reproduits à titre de
          référence professionnelle.
        </p>
      </Section>

      <Section title="Liens vers des sites tiers">
        <p>
          Ce site renvoie vers des sites réalisés pour des commanditaires ou vers
          des maquettes de démonstration. {LEGAL.editor} n'exerce aucun contrôle
          sur leur contenu après livraison et ne peut en être tenu responsable.
        </p>
      </Section>

      <Section title="Signaler un contenu">
        <p>
          Pour toute demande de rectification ou de retrait concernant un contenu
          publié sur {SITE.domainDisplay}, écrivez à{' '}
          <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
            {CONTACT.email}
          </a>
          . Une réponse vous sera apportée dans les meilleurs délais.
        </p>
      </Section>
    </LegalLayout>
  )
}
