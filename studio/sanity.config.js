import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'cesure',
  title: 'Studio Césure',
  projectId: 'ycj8nmxr',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
