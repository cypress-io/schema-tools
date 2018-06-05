import { clone, curry, difference, keys } from 'ramda'
import { getObjectSchema } from './api'
import { SchemaCollection, SchemaVersion } from './objects'

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

  const result = clone(object)

  const objectProperties = keys(result)
  const schemaProperties = keys(schema.schema.properties)
  const extraProperties = difference(objectProperties, schemaProperties)
  // TODO recursively go into properties that are objects schemas themselves
  extraProperties.forEach(extra => {
    delete result[extra]
  })

  return result
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
