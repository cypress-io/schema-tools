import { curry, difference, keys, reduce } from 'ramda'
import { getObjectSchema } from './api'
import {
  ObjectSchema,
  PlainObject,
  SchemaCollection,
  SchemaVersion,
} from './objects'

// TODO: add types to input args
export const fillBySchema = curry(
  (schema: ObjectSchema, object: PlainObject): PlainObject => {
    // @ts-ignore
    schema = schema.properties || (schema.schema || schema.items).properties
    const objectProps = keys(object)
    const schemaProps = keys(schema)

    const missingProperties = difference(schemaProps, objectProps)
    const filledObject = reduce<string | number, PlainObject>(
      (result: PlainObject, key: string | number): PlainObject => {
        const property = schema[key]
        if ('defaultValue' in property) {
          const value = property.defaultValue
          return { ...result, [key]: value }
        } else {
          throw new Error(
            `Do not know how to get default value for property "${key}"`,
          )
        }
      },
      object,
      missingProperties,
    )

    return <PlainObject>filledObject
  },
)

const fillObject = (
  schemas: SchemaCollection,
  schemaName: string,
  version: SchemaVersion,
  object: object,
): PlainObject => {
  const schema = getObjectSchema(schemas, schemaName, version)
  if (!schema) {
    throw new Error(
      `Could not find schema ${schemaName}@${version} to trim an object`,
    )
  }
  if (!object) {
    throw new Error('Expected an object to trim')
  }

  return fillBySchema(schema, <PlainObject>object)
}

/**
 * Fills missing properties with explicit default values if possible. Curried.
 * Note: for now only fills top level.
 *
 * @example
 *    const o = ... // some object with missing properties for Person 1.0.0
 *    const t = fill('Person', '1.0.0', o)
 *    // t has missing properties filled if possible
 */
export const fill = curry(fillObject)
