import LegalLayout, { Section, ToComplete } from '../components/LegalLayout.jsx'
import { CONTACT, LEGAL, mailto } from '../lib/identity.js'

/*
  Ce document décrit EXACTEMENT ce que le code fait — vérifié ligne par ligne
  avant rédaction, pas recopié d'un modèle :
    • aucun appel à document.cookie nulle part ;
    • aucun outil de mesure (ni Google Analytics, ni Plausible, ni Matomo,
      ni pixel publicitaire) ;
    • un seul sessionStorage, la clé « cesure:intro », qui évite de rejouer
      l'animation d'ouverture ;
    • deux domaines tiers appelés : fonts.googleapis.com et fonts.gstatic.com.
  Si le code change, ce document doit changer avec lui.
*/
export default function Confidentialite() {
  return (
    <LegalLayout
      eyebrow="Vos données"
      title="Politique de confidentialité"
      intro="Ce site n'utilise aucun cookie, aucun outil de mesure d'audience et aucun traceur publicitaire. Voici précisément ce qui se passe quand vous le consultez."
    >
      <Section title="En résumé">
        <ul className="space-y-3">
          {[
            'Aucun cookie n’est déposé sur votre appareil.',
            'Aucune statistique de visite n’est collectée, ni par nous ni par un tiers.',
            'Il n’existe aucun formulaire : vous ne pouvez rien nous transmettre depuis ce site.',
            'Nous ne connaissons donc de vous que ce que vous nous écrivez vous-même, par courriel ou par téléphone.',
          ].map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Responsable du traitement">
        <p>
          {LEGAL.editor}, {LEGAL.status} — {LEGAL.address}. Contact :{' '}
          <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
            {CONTACT.email}
          </a>
          .
        </p>
      </Section>

      <Section title="Ce que votre navigateur enregistre">
        <p>
          Le site mémorise une seule information, dans l'espace de stockage de
          session de votre navigateur : le fait que l'animation d'ouverture a
          déjà été jouée, afin de ne pas vous l'imposer à chaque page. Cette
          information est purement technique, ne contient aucune donnée
          personnelle, n'est jamais transmise à un serveur, et disparaît dès que
          vous fermez l'onglet.
        </p>
        <p>
          Ce n'est pas un cookie et cela ne requiert donc pas votre
          consentement, s'agissant d'un usage strictement nécessaire au
          fonctionnement du service.
        </p>
      </Section>

      <Section title="Polices de caractères (point important)">
        <p>
          Les polices du site sont chargées depuis Google Fonts
          (<span className="whitespace-nowrap">fonts.googleapis.com</span> et{' '}
          <span className="whitespace-nowrap">fonts.gstatic.com</span>). Pour vous
          les livrer, votre navigateur contacte directement un serveur de Google
          LLC, qui reçoit à cette occasion votre adresse IP ainsi que des
          informations techniques sur votre navigateur.
        </p>
        <p>
          Nous le signalons parce que cela constitue un transfert de donnée vers
          un tiers, même si nous n'en recevons rien et n'en faisons aucun usage.
          Ce transfert peut être supprimé en hébergeant les polices directement
          sur le site : cette évolution est prévue.
        </p>
      </Section>

      <Section title="Hébergement et journaux techniques">
        <p>
          Le site est hébergé par {LEGAL.host.name} ({LEGAL.host.address}). Comme
          tout hébergeur, {LEGAL.host.name} enregistre des journaux techniques de
          connexion — adresse IP, date, page demandée — nécessaires à la
          sécurité et au bon fonctionnement du service. Ces journaux sont gérés
          par l'hébergeur selon sa propre politique de confidentialité, et nous
          ne les exploitons pas.
        </p>
        <p>
          L'hébergeur étant établi aux États-Unis, cet acheminement implique un
          transfert de données hors de l'Union européenne, encadré par les
          garanties contractuelles de {LEGAL.host.name}.
        </p>
      </Section>

      <Section title="Si vous nous écrivez">
        <p>
          Lorsque vous nous contactez par courriel ou par téléphone, nous
          conservons votre message et vos coordonnées dans le seul but de vous
          répondre et, le cas échéant, de suivre notre relation
          professionnelle. Ces informations ne sont ni revendues, ni cédées, ni
          utilisées pour de la prospection.
        </p>
        {/*
          Durées alignées sur la recommandation de la CNIL (3 ans après le
          dernier contact pour une prospection restée sans suite) et sur
          l'article L123-22 du code de commerce (10 ans pour les pièces
          comptables). Ce sont des standards défendables, pas une décision
          arbitraire — mais ils restent modifiables.
        */}
        <p>
          Concrètement : une demande restée sans suite est conservée{' '}
          <strong className="font-medium text-ink">3 ans</strong> à compter du
          dernier échange, conformément à la recommandation de la CNIL. Les
          pièces comptables d'un projet facturé sont conservées{' '}
          <strong className="font-medium text-ink">10 ans</strong>, durée imposée
          par le code de commerce. Passé ces délais, les données sont
          supprimées.
        </p>
      </Section>

      <Section title="Vos droits">
        <p>
          Conformément au règlement (UE) 2016/679, vous disposez d'un droit
          d'accès, de rectification, d'effacement, de limitation et d'opposition
          sur les données vous concernant. Pour l'exercer, écrivez à{' '}
          <a href={mailto} className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent">
            {CONTACT.email}
          </a>
          . Une réponse vous sera apportée dans un délai d'un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la Commission
          nationale de l'informatique et des libertés (CNIL),{' '}
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
          >
            cnil.fr
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  )
}
