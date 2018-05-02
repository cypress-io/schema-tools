import {
  ObjectSchema,
  SchemaCollection,
  SchemaVersion,
  PlainObject,
  JsonSchema,
} from './objects'

import * as utils from './utils'
import {
  JsonSchemaFormats,
  CustomFormats,
  detectors,
  getDefaults,
  FormatDefaults,
} from './formats'
import { sanitize } from './sanitize'
import debugApi from 'debug'
import validator from '@bahmutov/is-my-json-valid'
import cloneDeep from 'lodash.clonedeep'
import set from 'lodash.set'
import get from 'lodash.get'
import { uniq, find, whereEq, difference, keys, uniqBy } from 'ramda'
import stringify from 'json-stable-stringify'

const debug = debugApi('schema-tools')

export const getVersionedSchema = (schemas: SchemaCollection) => (
  name: string,
) => {
  name = utils.normalizeName(name)
  return schemas[name]
}

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

/**
 * Error returned by the json validation library.
 * Has an error message for specific property
 */
type ValidationError = {
  field: string
  message: string
}

const dataHasAdditionalPropertiesValidationError = {
  field: 'data',
  message: 'has additional properties',
}

const findDataHasAdditionalProperties = find(
  whereEq(dataHasAdditionalPropertiesValidationError),
)

const includesDataHasAdditionalPropertiesError = (
  errors: ValidationError[],
): boolean => findDataHasAdditionalProperties(errors) !== undefined

const errorToString = (error: ValidationError): string =>
  `${error.field} ${error.message}`

/**
 * Flattens validation errors into user-friendlier strings
 */

const errorsToStrings = (errors: ValidationError[]): string[] =>
  errors.map(errorToString)

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

  const uniqueErrors: ValidationError[] = uniqBy(errorToString, validate.errors)

  if (
    includesDataHasAdditionalPropertiesError(uniqueErrors) &&
    keys(schema.properties).length
  ) {
    const hasData: ValidationError = findDataHasAdditionalProperties(
      uniqueErrors,
    ) as ValidationError
    const additionalProperties: string[] = difference(
      keys(object),
      keys(schema.properties),
    )
    hasData.message += ': ' + additionalProperties.join(', ')
  }

  const errors = uniq(errorsToStrings(uniqueErrors))
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
export const validate = (
  schemas: SchemaCollection,
  formats?: JsonSchemaFormats,
) => (schemaName: string, version: string) => (
  object: object,
): true | string[] => {
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

/**
 * Error thrown when an object does not pass schema.
 *
 * @export
 * @class SchemaError
 * @extends {Error}
 */
export class SchemaError extends Error {
  /**
   * List of individual errors
   *
   * @type {string[]}
   * @memberof SchemaError
   */
  errors: string[]

  /**
   * Current object being validated
   *
   * @type {PlainObject}
   * @memberof SchemaError
   */
  object: PlainObject

  /**
   * Example object from the schema
   *
   * @type {PlainObject}
   * @memberof SchemaError
   */
  example: PlainObject

  /**
   * Name of the schema that failed
   *
   * @type {string}
   * @memberof SchemaError
   */
  schemaName: string

  /**
   * Version of the schema violated
   *
   * @type {string}
   * @memberof SchemaError
   */
  schemaVersion?: string

  constructor(
    message: string,
    errors: string[],
    object: PlainObject,
    example: PlainObject,
    schemaName: string,
    schemaVersion?: string,
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.errors = errors
    this.object = object
    this.example = example
    this.schemaName = schemaName
    if (schemaVersion) {
      this.schemaVersion = schemaVersion
    }
  }
}

export const assertBySchema = (
  schema: JsonSchema,
  example: PlainObject = {},
  substitutions: string[] = [],
  label?: string,
  formats?: JsonSchemaFormats,
  schemaVersion?: SchemaVersion,
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

  throw new SchemaError(
    message,
    result,
    object,
    example,
    schema.title,
    schemaVersion,
  )
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
  return assertBySchema(
    schema.schema,
    example,
    substitutions,
    label,
    formats,
    utils.semverToString(schema.version),
  )(object)
}

type BindOptions = {
  schemas: SchemaCollection
  formats?: CustomFormats
}

/**
 * Given schemas and formats creates "mini" API bound to the these schemas.
 */
export const bind = (options: BindOptions) => {
  const formatDetectors: JsonSchemaFormats | undefined = options.formats
    ? detectors(options.formats)
    : undefined

  const defaults: FormatDefaults | undefined = options.formats
    ? getDefaults(options.formats)
    : undefined

  const api = {
    assertSchema: assertSchema(options.schemas, formatDetectors),
    schemaNames: schemaNames(options.schemas),
    getExample: getExample(options.schemas),
    sanitize: sanitize(options.schemas, defaults),
    validate: validate(options.schemas),
  }
  return api
}
