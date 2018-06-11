import stringify from 'json-stable-stringify'
import quote from 'quote'
import { find, flatten, toLower } from 'ramda'
import { normalizeName, schemaNames, semverToString } from '..'
import { CustomFormats } from '../formats'
import {
  JsonProperties,
  JsonProperty,
  JsonSchema,
  ObjectSchema,
  SchemaCollection,
} from '../objects'

const ticks = quote({ quotes: '`' })

/**
 * Unicode '✔' for consistency
 */
export const checkMark = '✔'

/**
 * Empty string for markdown table cells
 */
export const emptyMark = ''

const isCustomFormat = (formats: CustomFormats) => name => name in formats

const knownSchemaNames = (schemas: SchemaCollection) => schemaNames(schemas)

const isSchemaName = (schemas: SchemaCollection) => (s: string) =>
  knownSchemaNames(schemas).includes(normalizeName(s))

// removes all characters to have a link
export const anchor = (s: string) => toLower(s.replace(/[\.@]/g, ''))

export const anchorForSchema = (s: ObjectSchema): string => {
  const schemaName = toLower(normalizeName(s.schema.title))
  const seeVersion = semverToString(s.version)
  const nameAndVersion = `${schemaName}@${seeVersion}`
  return anchor(nameAndVersion)
}

export const enumToMarkdown = enumeration => {
  if (!enumeration) {
    return emptyMark
  }
  return ticks(enumeration.map(JSON.stringify).join(', '))
}

export const formatToMarkdown = (
  schemas?: SchemaCollection,
  formats?: CustomFormats,
) => (value: JsonProperty): string => {
  if (!value.format) {
    if (value.see) {
      if (typeof value.see === 'string') {
        // try finding schema by name
        return schemas && isSchemaName(schemas)(value.see)
          ? `[${value.see}](#${toLower(normalizeName(value.see))})`
          : ticks(value.see)
      } else {
        const seeSchema: ObjectSchema = value.see
        const schemaName = `${seeSchema.schema.title}`
        const seeVersion = semverToString(seeSchema.version)
        const nameAndVersion = `${schemaName}@${seeVersion}`
        const seeAnchor = anchorForSchema(seeSchema)
        return schemas && isSchemaName(schemas)(schemaName)
          ? `[${nameAndVersion}](#${seeAnchor})`
          : ticks(nameAndVersion)
      }
    } else {
      return emptyMark
    }
  }

  if (formats && isCustomFormat(formats)(value.format)) {
    // point at the formats section
    return `[${value.format}](#formats)`
  }

  return ticks(value.format)
}

export const findUsedColumns = (headers: string[], rows: object[]) => {
  const isUsed = (header: string) => find(r => r[header], rows)
  const usedHeaders = headers.filter(isUsed)
  return usedHeaders
}

type PropertyDescription = {
  name: string
  type: string
  required: string
  format: string
  description: string
  enum: string
}

export const documentProperties = (
  properties: JsonProperties,
  required: string[] | true = [],
  schemas?: SchemaCollection,
  formats?: CustomFormats,
): PropertyDescription[] => {
  const requiredProperties: string[] = Array.isArray(required)
    ? required
    : Object.keys(properties)
  const isRequired = name => requiredProperties.indexOf(name) !== -1
  const typeText = type => (Array.isArray(type) ? type.join(' or ') : type)
  const deprecatedMessage = (value: JsonProperty) =>
    value.deprecated ? `**deprecated** ${value.deprecated}` : emptyMark

  return Object.keys(properties)
    .sort()
    .map(prop => {
      const value: JsonProperty = properties[prop]
      return {
        name: ticks(prop),
        type: typeText(value.type),
        required: isRequired(prop) ? checkMark : emptyMark,
        format: formatToMarkdown(schemas, formats)(value),
        enum: enumToMarkdown(value.enum),
        description: value.description ? value.description : emptyMark,
        deprecated: deprecatedMessage(value),
      }
    })
}

export const documentSchema = (
  schema: JsonSchema,
  schemas?: SchemaCollection,
  formats?: CustomFormats,
) => {
  const properties = schema.properties

  if (properties) {
    const rows: PropertyDescription[] = documentProperties(
      properties,
      schema.required,
      schemas,
      formats,
    )
    const headers = [
      'name',
      'type',
      'required',
      'format',
      'enum',
      'description',
      'deprecated',
    ]
    const usedHeaders = findUsedColumns(headers, rows)
    const table: object[] = [
      {
        table: {
          headers: usedHeaders,
          rows,
        },
      },
    ]
    if (schema.additionalProperties) {
      table.push({
        p: 'This schema allows additional properties.',
      })
    }
    return table
  } else {
    return { p: 'Hmm, no properties found in this schema' }
  }
}

const schemaNameHeading = (name: string, version: string) =>
  `${name}@${version}`

export const documentObjectSchema = (
  schema: ObjectSchema,
  schemas?: SchemaCollection,
  formats?: CustomFormats,
) => {
  const schemaName = schema.schema.title

  if (schemaName.includes(' ')) {
    throw new Error(`Schema title contains spaces "${schemaName}"
      This can cause problems generating anchors!`)
  }

  const schemaVersion = semverToString(schema.version)

  const start: object[] = [
    { h3: schemaNameHeading(normalizeName(schemaName), schemaVersion) },
  ]
  if (schema.package) {
    start.push({
      p: `Defined in ${ticks(schema.package)}`,
    })
  }
  if (schema.schema.description) {
    start.push({ p: schema.schema.description })
  }

  if (schema.schema.deprecated) {
    start.push({
      p: `**deprecated** ${schema.schema.deprecated}`,
    })
  }

  const propertiesTable = documentSchema(schema.schema, schemas, formats)

  const exampleFragment = flatten([
    { p: 'Example:' },
    {
      code: {
        language: 'json',
        content: stringify(schema.example, { space: '  ' }),
      },
    },
  ])

  return flatten(start.concat(propertiesTable).concat(exampleFragment))
}
