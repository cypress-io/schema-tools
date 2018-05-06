// generates Markdown document with all schema information

import stringify from 'json-stable-stringify'
import json2md from 'json2md'
import la from 'lazy-ass'
import quote from 'quote'
import { flatten, toLower } from 'ramda'
import {
  getExample,
  getObjectSchema,
  getSchemaVersions,
  normalizeName,
  schemaNames,
} from '..'
import { CustomFormats } from '../formats'
import { ObjectSchema, SchemaCollection } from '../objects'
import { documentCustomFormats } from './doc-formats'
import { documentSchema } from './utils'

const ticks = quote({ quotes: '`' })
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
      la(schema, 'cannot find schema', schemaName, version)

      const schemaDoc = documentSchema(schema.schema)

      const start: any[] = [{ h3: `${schemaName}@${version}` }]
      if (schema.package) {
        start.push({
          p: `Defined in ${ticks(schema.package)}`,
        })
      }
      if (schema.schema.description) {
        start.push({ p: schema.schema.description })
      }

      const example = getExample(schemas)(schemaName)(version)
      const exampleFragment = flatten([
        schemaDoc,
        { p: 'Example:' },
        {
          code: {
            language: 'json',
            content: stringify(example, { space: '  ' }),
          },
        },
        titleLink,
      ])
      return flatten(start.concat(exampleFragment))
    }

    const versionFragments = versions.map(documentSchemaVersion)

    return [{ h2: normalizeName(schemaName) }].concat(flatten(versionFragments))
  }

  const fragments = flatten(schemaNames(schemas).map(toDoc))

  const anchor = (s: string) => toLower(s.replace(/[\.@]/g, ''))

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

  // const extractH2 = map(prop('h2'))
  // const filterH2 = filter(has('h2'))
  // const headings = extractH2(filterH2(fragments))

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
