import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'cesure',
  title: 'Studio Césure',
  // Renseigné par `npx sanity init` (ou colle ton ID depuis sanity.io/manage).
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
