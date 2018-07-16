import { curry, keys, reduce, contains } from 'ramda'
import { getObjectSchema } from './api'
import { SchemaCollection, SchemaVersion } from './objects'
import { isJsonSchema } from './sanitize'

const reduceToSchema = (object: object, schema) => {
  schema = schema.schema.properties
  const objectProps = keys(object)
  const schemaProps = keys(schema)
  return reduce(
    (trimmedObj, prop) => {
      if (contains(prop, schemaProps)) {
        if (isJsonSchema(object[prop])) {
          trimmedObj[prop] = reduceToSchema(object[prop], schema[prop])
        } else {
          trimmedObj[prop] = object[prop]
        }
      }
      return trimmedObj
    },
    {},
    objectProps,
  )
}

const trimObject = (
  schemas: SchemaCollection,
  schemaName: string,
  version: SchemaVersion,
  object: object,
) => {
  const schema = getObjectSchema(schemas, schemaName, version)
  if (!schema) {
    throw new Error(`Could not schema ${schemaName}@${version}`)
  }
  if (!object) {
    throw new Error('Expected an object to trim')
  }

  return reduceToSchema(object, schema)
}

/**
 * Removes all properties from the given object that are not in the schema. Curried
 *
 * Note: currently only looks at the top level properties!
 * @example
 *    const o = ... // some object
 *    const t = trim('Person', '1.0.0', o)
 *    // t only has properties from the schema Person@1.0.0
 */
export const trim = curry(trimObject)
