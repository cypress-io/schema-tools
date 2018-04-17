import {
  ObjectSchema,
  SchemaCollection,
  SchemaVersion,
  PlainObject,
  JsonSchema,
} from './objects'

import * as utils from './utils'
import { JsonSchemaFormats } from './formats'
import debugApi from 'debug'
import validator from 'is-my-json-valid'
import cloneDeep from 'lodash.clonedeep'
import set from 'lodash.set'
import get from 'lodash.get'
import stringify from 'json-stable-stringify'

const debug = debugApi('schema-tools')

/**
 * Returns object schema given a name and a version. Curried.
 * @param schemaName
 * @returns an object or undefined
 * @example getObjectSchema('membershipInvitation')('1.0.0')
 */
export const getObjectSchema = (schemas: SchemaCollection) => (
  schemaName: string,
) => (version: SchemaVersion): ObjectSchema | undefined => {
  schemaName = utils.normalizeName(schemaName)

  const namedSchemas = schemas[schemaName]
  if (!namedSchemas) {
    debug('missing schema %s', schemaName)
    return
  }
  return namedSchemas[version] as ObjectSchema
}

/**
 * Returns normalized names of all schemas
 *
 * @example schemaNames() //> ['membershipInvitation', 'somethingElse', ...]
 */
export const schemaNames = (schemas: SchemaCollection) =>
  Object.keys(schemas).sort()

/**
 * Returns list of version strings available for given schema name.
 *
 * If there is no such schema, returns empty list.
 *
 * @param schemaName Schema name to look up
 */
export const getSchemaVersions = (schemas: SchemaCollection) => (
  schemaName: string,
) => {
  schemaName = utils.normalizeName(schemaName)
  if (schemas[schemaName]) {
    return Object.keys(schemas[schemaName])
  }
  return []
}

/**
 * Returns our example for a schema with given version. Curried
 * @example getExample('membershipInvitation')('1.0.0')
 * // {id: '...', email: '...', role: '...'}
 */
export const getExample = (schemas: SchemaCollection) => (
  schemaName: string,
) => (version: SchemaVersion) => {
  const o = getObjectSchema(schemas)(schemaName)(version)
  if (!o) {
    debug('could not find object schema %s@%s', schemaName, version)
    return
  }
  return o.example
}

type ValidationError = {
  field: string
  message: string
}

/**
 * Flattens validation errors into user-friendlier strings
 */

const errorsToStrings = (errors: ValidationError[]): string[] =>
  errors.map(({ field, message }) => `${field} ${message}`)

/**
 * Validates given object using JSON schema. Returns either 'true' or list of string errors
 */
export const validateBySchema = (
  schema: JsonSchema,
  formats?: JsonSchemaFormats,
) => (object: object): true | string[] => {
  // TODO this could be cached, or even be part of the loaded module
  // when validating use our additional formats, like "uuid"
  const validate = validator(schema, { formats })
  if (validate(object)) {
    return true
  }
  const errors = errorsToStrings(validate.errors)
  return errors
}

/**
 * Validates an object against given schema and version
 *
 * @param {string} schemaName
 * @param {object} object
 * @param {string} version
 * @returns {(true | string[])} If there are no errors returns true.
 *  If there are any validation errors returns list of strings
 *
 */
export const validate = (schemas: SchemaCollection) => (
  schemaName: string,
  version: string,
  formats?: JsonSchemaFormats,
) => (object: object): true | string[] => {
  schemaName = utils.normalizeName(schemaName)

  const namedSchemas = schemas[schemaName]
  if (!namedSchemas) {
    return [`Missing schema ${schemaName}`]
  }

  const aSchema = namedSchemas[version] as ObjectSchema
  if (!aSchema) {
    return [`Missing schema ${schemaName}@${version}`]
  }

  // TODO this could be cached, or even be part of the loaded module
  // when validating use our additional formats, like "uuid"
  return validateBySchema(aSchema.schema, formats)(object)
}

export const assertBySchema = (
  schema: JsonSchema,
  example: PlainObject = {},
  substitutions: string[] = [],
  label?: string,
  formats?: JsonSchemaFormats,
) => (object: PlainObject) => {
  const replace = () => {
    const cloned = cloneDeep(object)
    substitutions.forEach(property => {
      const value = get(example, property)
      set(cloned, property, value)
    })
    return cloned
  }

  const replaced = substitutions.length ? replace() : object
  const result = validateBySchema(schema, formats)(replaced)
  if (result === true) {
    return object
  }

  const title = label ? `Schema ${label} violated` : 'Schema violated'
  const start = [title, '', 'Errors:']
    .concat(result)
    .concat(['', 'Current object:'])
  const objectString = stringify(replaced, { space: '  ' })
  const exampleString = stringify(example, { space: '  ' })

  const message =
    start.join('\n') +
    '\n' +
    objectString +
    '\n\n' +
    'Expected object like this:\n' +
    exampleString
  throw new Error(message)
}

/**
 * Validates given object against a schema, throws an error if schema
 * has been violated. Returns the original object if everything is ok.
 *
 * @param name Schema name
 * @param version Schema version
 * @param substitutions Replaces specific properties with values from example object
 * @example getOrganization()
 *  .then(assertSchema('organization', '1.0.0'))
 *  .then(useOrganization)
 * @example getOrganization()
 *  // returns {id: 'foo', ...}
 *  // but will check {id: '931...', ...}
 *  // where "id" is taken from this schema example object
 *  .then(assertSchema('organization', '1.0.0', ['id']))
 *  .then(useOrganization)
 */
export const assertSchema = (
  schemas: SchemaCollection,
  formats?: JsonSchemaFormats,
) => (name: string, version: string, substitutions: string[] = []) => (
  object: PlainObject,
) => {
  const example = getExample(schemas)(name)(version)
  const schema = getObjectSchema(schemas)(name)(version)
  if (!schema) {
    throw new Error(`Could not find schema ${name}@${version}`)
  }
  // TODO we can read title and description from the JSON schema itself
  // so external label would not be necessary
  const label = `${name}@${version}`
  return assertBySchema(schema.schema, example, substitutions, label, formats)(
    object,
  )
}
