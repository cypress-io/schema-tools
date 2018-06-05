import debugApi from 'debug'
import { clone } from 'ramda'
import { assertSchema, getObjectSchema } from './api'
import { FormatDefaults } from './formats'
import { JsonSchema, PlainObject, SchemaCollection } from './objects'

const debug = debugApi('schema-tools')

export const isDynamicFormat = (formatDefaults: FormatDefaults | undefined) => (
  format: string,
) => (formatDefaults ? format in formatDefaults : false)

const isString = s => typeof s === 'string'

const canPropertyBeString = type =>
  type === 'string' || (Array.isArray(type) && type.includes('string'))

const canPropertyBeArray = type =>
  type === 'array' || (Array.isArray(type) && type.includes('array'))

const isArrayType = prop => canPropertyBeArray(prop.type) && prop.items

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
      debug('looking at property %j', prop)

      if (key in object && Array.isArray(object[key])) {
        debug('%s is present as an array', key)

        if (isStringArray(prop)) {
          debug('%s is a string array', key)
          // go through the items in the array and if the format is dynamic
          // set default values
          const list: string[] = result[key] as string[]

          if (prop.items && prop.items.format) {
            const itemFormat = prop.items.format
            debug('items format %s', itemFormat)

            if (formatDefaults && isDynamic(itemFormat)) {
              debug(
                'format %s is dynamic, need to replace with default value',
                itemFormat,
              )
              const defaultValue = formatDefaults[itemFormat]
              for (let k = 0; k < list.length; k += 1) {
                list[k] = defaultValue as string
              }
              return
            }
          }
        } else if (isArrayType(prop) && hasPropertiesArray(prop)) {
          debug('property %s is array-like and has properties', key)

          const list: PlainObject[] = object[key] as PlainObject[]
          const propSchema: JsonSchema = prop.items as JsonSchema
          result[key] = list.map(sanitizeBySchema(propSchema, formatDefaults))
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

/**
 * Given a schema (by name and version) and an object, replaces dynamic values
 * in the object with default values. Useful to replace UUIDs, timestamps, etc
 * with defaults before comparing with expected value.
 */
export const sanitize = (
  schemas: SchemaCollection,
  formatDefaults?: FormatDefaults,
) => (name: string, version: string) => (object: PlainObject) => {
  assertSchema(schemas)(name, version)(object)
  const schema = getObjectSchema(schemas, name, version)
  if (!schema) {
    throw new Error(`Could not schema ${name}@${version}`)
  }

  return sanitizeBySchema(schema.schema, formatDefaults)(object)
}
