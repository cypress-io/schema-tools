import { curry } from 'ramda'
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
}

export const trim = curry(trimObject)
