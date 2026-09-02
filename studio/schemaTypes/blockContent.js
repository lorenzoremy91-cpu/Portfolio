import { defineType, defineArrayMember } from 'sanity'

/*
  Le texte riche des études de cas. Volontairement restreint : pas de
  couleurs, pas de tailles de police, pas d'alignements. L'éditeur écrit du
  SENS (un titre, une citation, un lien) et le front-end décide de
  l'apparence — c'est ce qui garantit que chaque étude de cas reste dans la
  direction artistique du site, même écrite à la va-vite.
*/
export default defineType({
  name: 'blockContent',
  title: 'Contenu',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraphe', value: 'normal' },
        { title: 'Intertitre', value: 'h3' },
        { title: 'Citation', value: 'blockquote' },
      ],
      lists: [{ title: 'Liste', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Lien',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'Adresse',
                validation: (r) =>
                  r.uri({ scheme: ['http', 'https', 'mailto'] }),
              },
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Description' },
        { name: 'caption', type: 'string', title: 'Légende' },
      ],
    }),
  ],
})
