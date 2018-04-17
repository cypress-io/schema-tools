import { PlainObject, JsonSchema, SchemaCollection } from './objects'
import { assertSchema, getObjectSchema } from './api'
import { clone } from 'ramda'
import { FormatDefaults } from './formats'

export const isDynamicFormat = (formatDefaults: FormatDefaults | undefined) => (
  format: string,
) => (formatDefaults ? format in formatDefaults : false)

const isString = s => typeof s === 'string'

const canPropertyBeString = type =>
  type === 'string' || (Array.isArray(type) && type.includes('string'))

const isArrayType = prop => prop.type === 'array' && prop.items

const isStringArray = prop =>
  isArrayType(prop) && canPropertyBeString(prop.items.type)

const isJsonSchema = o =>
  isString(o.title) && o.properties && o.type === 'object'

const hasPropertiesArray = prop =>
  isArrayType(prop) && prop.items && isJsonSchema(prop.items)

/**
 * Sanitize an object given a JSON schema. Replaces all highly dynamic fields
 * (like "date-time", "uuid") with default values.
 * @param schema
 */
export const sanitizeBySchema = (
  schema: JsonSchema,
  formatDefaults?: FormatDefaults,
) => (object: PlainObject) => {
  const isDynamic = isDynamicFormat(formatDefaults)
  let result = clone(object)

  // simple single level sanitize for now
  const props = schema.properties
  if (props) {
    Object.keys(props).forEach(key => {
      if (!(key in object)) {
        // do not sanitize / replace non-existent value
        return
      }

      const prop = props[key]

      if (key in object && Array.isArray(object[key])) {
        if (isStringArray(prop)) {
          // go through the items in the array and if the format is dynamic
          // set default values
          const list: string[] = result[key] as string[]

          if (prop.items && prop.items.format) {
            const itemFormat = prop.items.format
            if (formatDefaults && isDynamic(itemFormat)) {
              const defaultValue = formatDefaults[itemFormat]
              for (let k = 0; k < list.length; k += 1) {
                list[k] = defaultValue as string
              }
              return
            }
          }
        } else if (isArrayType(prop) && hasPropertiesArray(prop)) {
          const list: PlainObject[] = object[key] as PlainObject[]
          result[key] = list.map(sanitizeBySchema(prop.items as JsonSchema))
          return
        }
      }
      if (!isString(object[key])) {
        // for now can only sanitize string properties
        return
      }

      if (canPropertyBeString(prop.type)) {
        if (prop.format && formatDefaults && isDynamic(prop.format)) {
          const defaultValue = formatDefaults[prop.format]
          if (!defaultValue) {
            throw new Error(
              `Cannot find default value for format name ${prop.format}`,
            )
          }
          result[key] = defaultValue
        }
      }
    })
  }

  return result
}

export const sanitize = (schemas: SchemaCollection) => (
  name: string,
  version: string,
) => (object: PlainObject) => {
  assertSchema(schemas)(name, version)(object)
  const schema = getObjectSchema(schemas)(name)(version)
  if (!schema) {
    throw new Error(`Could not schema ${name}@${version}`)
  }

  return sanitizeBySchema(schema.schema)(object)
}
