// generates Markdown document with all schema information

import json2md from 'json2md'
import { flatten } from 'ramda'
import {
  getObjectSchema,
  getSchemaVersions,
  normalizeName,
  schemaNames,
} from '..'
import { CustomFormats } from '../formats'
import { ObjectSchema, SchemaCollection } from '../objects'
import { documentCustomFormats } from './doc-formats'
import { anchor, documentObjectSchema } from './utils'

// const ticks = quote({ quotes: '`' })
const title = [{ h1: 'Schemas' }]
const titleLink = [{ p: '[🔝](#schemas)' }]

/**
 * Returns Markdown string describing the entire schema collection.
 *
 * @param {SchemaCollection} schemas Object with all schemas
 * @param {CustomFormats} formats Custom formats (optional)
 * @returns {string} Markdown
 */
export function documentSchemas(
  schemas: SchemaCollection,
  formats?: CustomFormats,
): string {
  const toDoc = (schemaName: string) => {
    const versions = getSchemaVersions(schemas)(schemaName)
    if (!versions.length) {
      return [{ h2: `⚠️ Could not find any versions of schema ${schemaName}` }]
    }

    const documentSchemaVersion = (version: string) => {
      const schema: ObjectSchema = getObjectSchema(schemas)(schemaName)(
        version,
      ) as ObjectSchema

      if (!schema) {
        throw new Error(`cannot find schema ${schemaName}@${version}`)
      }

      const schemaDoc = documentObjectSchema(schema, schemas, formats)

      return flatten(schemaDoc.concat(titleLink))
    }

    const versionFragments = versions.map(documentSchemaVersion)

    const start: object[] = [{ h2: normalizeName(schemaName) }]
    return start.concat(flatten(versionFragments))
  }

  const fragments = flatten(schemaNames(schemas).map(toDoc))

  const schemaNameToTopLevelLink = (schemaName: string) =>
    `[${schemaName}](#${anchor(schemaName)})`

  const schemaVersionLink = (schemaName: string) => (version: string) =>
    `[${version}](#${anchor(schemaName + version)})`

  const tocHeading = (schemaName: string) => {
    const versions = getSchemaVersions(schemas)(schemaName)
    const topLink = schemaNameToTopLevelLink(schemaName)
    if (versions.length < 2) {
      return topLink
    } else {
      const versionLinks = versions.map(schemaVersionLink(schemaName))
      const linkWithVersions = topLink + ' - ' + versionLinks.join(', ')
      return linkWithVersions
    }
  }

  const headings = schemaNames(schemas)
  const toc = [
    {
      ul: headings.map(tocHeading),
    },
  ]

  let list = (title as any[]).concat(toc).concat(fragments)

  if (formats) {
    list = list.concat(documentCustomFormats(formats)).concat(titleLink)
  }

  return json2md(list)
}
