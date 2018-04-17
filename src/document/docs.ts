// generates Markdown document with all schema information

import {
  schemaNames,
  normalizeName,
  getSchemaVersions,
  getObjectSchema,
  getExample,
} from '..'
import { ObjectSchema } from '../objects'
import { documentSchema } from './utils'
import { documentCustomFormats } from './doc-formats'

import json2md from 'json2md'
import stringify from 'json-stable-stringify'
import { flatten, toLower } from 'ramda'
import { SchemaCollection } from '../objects'
import { CustomFormats } from '../formats'
import la from 'lazy-ass'

const title = [{ h1: 'Schemas' }]
const titleLink = [{ p: '[🔝](#schemas)' }]

function documentSchemas(schemas: SchemaCollection, formats: CustomFormats) {
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

  const list = (title as any[])
    .concat(toc)
    .concat(fragments)
    .concat(documentCustomFormats(formats))
    .concat(titleLink)

  console.log(json2md(list))
}

module.exports = documentSchemas
