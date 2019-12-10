import validator from '@bahmutov/is-my-json-valid'
import debugApi from 'debug'
import stringify from 'json-stable-stringify'
import get from 'lodash.get'
import set from 'lodash.set'
import {
  clone,
  curry,
  difference,
  filter,
  find,
  keys,
  map,
  mergeAll,
  mergeDeepLeft,
  prop,
  uniq,
  uniqBy,
  whereEq,
} from 'ramda'
import { fill } from './fill'
import {
  CustomFormats,
  detectors,
  FormatDefaults,
  getDefaults,
  JsonSchemaFormats,
} from './formats'
import {
  JsonSchema,
  ObjectSchema,
  PlainObject,
  SchemaCollection,
  SchemaVersion,
} from './objects'
import { sanitize } from './sanitize'
import { trim } from './trim'
import * as utils from './utils'

const debug = debugApi('schema-tools')

export const getVersionedSchema = (schemas: SchemaCollection) => (
  name: string,
) => {
  name = utils.normalizeName(name)
  return schemas[name]
}

const _getObjectSchema = (
  schemas: SchemaCollection,
  schemaName: string,
  version: SchemaVersion,
): ObjectSchema | undefined => {
  schemaName = utils.normalizeName(schemaName)

  const namedSchemas = schemas[schemaName]
  if (!namedSchemas) {
    debug('missing schema %s', schemaName)
    return
  }
  return namedSchemas[version] as ObjectSchema
}

/**
 * Returns object schema given a name and a version. Curried.
 * @returns an object or undefined
 * @example
 *    getObjectSchema(schemas, 'membershipInvitation', '1.0.0')
 *    getObjectSchema(schemas)('membershipInvitation')('1.0.0')
 */
export const getObjectSchema = curry(_getObjectSchema)

const _hasSchema = (
  schemas: SchemaCollection,
  schemaName: string,
  version: SchemaVersion,
): boolean => Boolean(_getObjectSchema(schemas, schemaName, version))

/**
 * Returns true if the given schema collection has schema by
 * name and version. Curried.
 * @returns `true` if there is a schema with such name and version
 * @example
 *    getObjectSchema(schemas, 'membershipInvitation', '1.0.0') // true
 *    getObjectSchema(schemas)('fooBarBaz', '1.0.0') // false
 */
export const hasSchema = curry(_hasSchema)

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
export const getExample = curry(
  (schemas: SchemaCollection, schemaName: string, version: SchemaVersion) => {
    const o = getObjectSchema(schemas)(schemaName)(version)
    if (!o) {
      debug('could not find object schema %s@%s', schemaName, version)
      return
    }
    return o.example
  },
)

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
  greedy: boolean = true,
) => (object: object): true | string[] => {
  // TODO this could be cached, or even be part of the loaded module
  // when validating use our additional formats, like "uuid"
  const validate = validator(schema, { formats, greedy })
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
  greedy: boolean = true,
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
  return validateBySchema(aSchema.schema, formats, greedy)(object)
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

type ErrorMessageWhiteList = {
  errors: boolean
  object: boolean
  example: boolean
}

type AssertBySchemaOptions = {
  greedy: boolean
  substitutions: string[]
  omit: Partial<ErrorMessageWhiteList>
}

const AssertBySchemaDefaults: AssertBySchemaOptions = {
  greedy: true,
  substitutions: [],
  omit: {
    errors: false,
    object: false,
    example: false,
  },
}

export const assertBySchema = (
  schema: JsonSchema,
  example: PlainObject = {},
  options?: Partial<AssertBySchemaOptions>,
  label?: string,
  formats?: JsonSchemaFormats,
  schemaVersion?: SchemaVersion,
) => (object: PlainObject) => {
  const allOptions = mergeDeepLeft(
    options || AssertBySchemaDefaults,
    AssertBySchemaDefaults,
  )

  const replace = () => {
    const cloned = clone(object)
    allOptions.substitutions.forEach(property => {
      const value = get(example, property)
      set(cloned, property, value)
    })
    return cloned
  }

  const replaced = allOptions.substitutions.length ? replace() : object
  const result = validateBySchema(schema, formats, allOptions.greedy)(replaced)
  if (result === true) {
    return object
  }

  const title = label ? `Schema ${label} violated` : 'Schema violated'
  const emptyLine = ''
  let parts = [title]

  if (!allOptions.omit.errors) {
    parts = parts.concat([emptyLine, 'Errors:']).concat(result)
  }

  if (!allOptions.omit.object) {
    const objectString = stringify(replaced, { space: '  ' })
    parts = parts.concat([emptyLine, 'Current object:', objectString])
  }

  if (!allOptions.omit.example) {
    const exampleString = stringify(example, { space: '  ' })
    parts = parts.concat([
      emptyLine,
      'Expected object like this:',
      exampleString,
    ])
  }

  const message = parts.join('\n')

  throw new SchemaError(
    message,
    result,
    replaced,
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
) => (
  name: string,
  version: string,
  options?: Partial<AssertBySchemaOptions>,
) => (object: PlainObject) => {
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
    options,
    label,
    formats,
    utils.semverToString(schema.version),
  )(object)
}

type BindOptions = {
  schemas: SchemaCollection
  formats?: CustomFormats
}

const mergeSchemas = (schemas: SchemaCollection[]): SchemaCollection =>
  mergeAll(schemas)

const mergeFormats = (formats: CustomFormats[]): CustomFormats =>
  mergeAll(formats)

const exists = x => Boolean(x)

/**
 * Given schemas and formats creates "mini" API bound to the these schemas.
 * Can take multiple schemas and merged them all, and merges formats.
 */
export const bind = (...options: BindOptions[]) => {
  const allSchemas: SchemaCollection[] = map(prop('schemas'), options)
  const schemas = mergeSchemas(allSchemas)

  const allFormats: CustomFormats[] = filter(
    exists,
    map(prop('formats'), options as Required<BindOptions>[]),
  )
  const formats = mergeFormats(allFormats)

  const formatDetectors = detectors(formats)

  const defaults: FormatDefaults = getDefaults(formats)

  const api = {
    assertSchema: assertSchema(schemas, formatDetectors),
    schemaNames: schemaNames(schemas),
    getExample: getExample(schemas),
    sanitize: sanitize(schemas, defaults),
    validate: validate(schemas),
    trim: trim(schemas),
    hasSchema: hasSchema(schemas),
    fill: fill(schemas),
  }
  return api
}
