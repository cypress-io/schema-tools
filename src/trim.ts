import { contains, curry, keys, map, reduce } from 'ramda'
import { getObjectSchema } from './api'
import { SchemaCollection, SchemaVersion } from './objects'
import { hasPropertiesArray, isJsonSchema } from './sanitize'

// TODO: add types to input args
const reduceToSchema = curry((schema, object: object) => {
  // @ts-ignore
  schema = schema.properties || (schema.schema || schema.items).properties
  const objectProps = keys(object)
  const schemaProps = keys(schema)
  return reduce(
    (trimmedObj, prop) => {
      if (contains(prop, schemaProps)) {
        if (object[prop] && isJsonSchema(schema[prop])) {
          trimmedObj[prop] = reduceToSchema(schema[prop], object[prop])
        } else if (object[prop] && hasPropertiesArray(schema[prop])) {
          trimmedObj[prop] = map(reduceToSchema(schema[prop]), object[prop])
        } else {
          trimmedObj[prop] = object[prop]
        }
      }
      return trimmedObj
    },
    {},
    objectProps,
  )
})

const trimObject = (
  schemas: SchemaCollection,
  schemaName: string,
  version: SchemaVersion,
  object: object,
) => {
  const schema = getObjectSchema(schemas, schemaName, version)
  if (!schema) {
    throw new Error(
      `Could not find schema ${schemaName}@${version} to trim an object`,
    )
  }
  if (!object) {
    throw new Error('Expected an object to trim')
  }

  return reduceToSchema(schema, object)
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
