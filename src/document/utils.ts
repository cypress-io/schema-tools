import { JsonSchema, JsonProperties, SchemaCollection } from '../objects'
import { schemaNames, normalizeName } from '..'
import { CustomFormats } from '../formats'
import { toLower, find } from 'ramda'
import quote from 'quote'

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

export const formatToMarkdown = value => {
  if (!value.format) {
    if (value.see) {
      return isSchemaName(value.see)
        ? `[${value.see}](#${toLower(normalizeName(value.see))})`
        : ticks(value.see)
    } else {
      return emptyMark
    }
  }

  if (isCustomFormat(value.format)) {
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
}

export const documentProperties = (
  properties: JsonProperties,
  required: string[] = [],
): PropertyDescription[] => {
  const isRequired = name => required.indexOf(name) !== -1
  const typeText = type => (Array.isArray(type) ? type.join(' or ') : type)

  return Object.keys(properties)
    .sort()
    .map(prop => {
      const value = properties[prop]
      return {
        name: ticks(prop),
        type: typeText(value.type),
        required: isRequired(prop) ? checkMark : emptyMark,
        format: formatToMarkdown(value),
        description: value.description ? value.description : emptyMark,
      }
    })
}

export const documentSchema = (schema: JsonSchema) => {
  const properties = schema.properties

  if (properties) {
    const rows: PropertyDescription[] = documentProperties(
      properties,
      schema.required,
    )
    const headers = ['name', 'type', 'required', 'format', 'description']
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
