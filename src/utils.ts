import camelCase from 'lodash.camelcase'
import { map, path, uniq } from 'ramda'
import {
  JsonSchema,
  ObjectSchema,
  SchemaCollection,
  SchemaVersion,
  Semver,
  VersionedSchema,
} from './objects'

/**
 * converts semantic version object into a string.
 * @example semverToString({major: 1, minor: 2, patch: 3}) // "1.2.3"
 */
export const semverToString = (s: Semver): SchemaVersion =>
  `${s.major}.${s.minor}.${s.patch}`

/**
 * Returns consistent name for a schema.
 *
 * @example normalizeName('membership_invitation') //> 'membershipInvitation'
 */
export const normalizeName = (s: string): string => camelCase(s)

export const normalizeRequiredProperties = (schema: JsonSchema) => {
  if (schema.required === true) {
    if (schema.properties) {
      schema.required = Object.keys(schema.properties)
    } else {
      schema.required = []
    }
  }
  return schema
}

/**
 * Returns single object with every object schema under semver key.
 * @param schemas Schemas to combine into single object
 * @example versionSchemas(TestInformation100, TestInformation110)
 */
export const versionSchemas = (...schemas: ObjectSchema[]) => {
  if (!schemas.length) {
    throw new Error('expected list of schemas')
  }

  const titles: string[] = map(path(['schema', 'title']))(schemas) as string[]
  const unique = uniq(titles)
  if (unique.length !== 1) {
    throw new Error(`expected same schema titles, got ${titles.join(', ')}`)
  }

  const result: VersionedSchema = {}
  schemas.forEach(s => {
    normalizeRequiredProperties(s.schema)
    const version = semverToString(s.version)
    result[version] = s
  })
  return result
}

/**
 * Sets name for each schema in the collection.
 * Note: mutates the input collection
 */
export const setPackageName = (
  schemas: SchemaCollection,
  packageName: string,
) => {
  Object.keys(schemas).forEach(name => {
    Object.keys(schemas[name]).forEach(version => {
      const schema = schemas[name][version]
      if (!schema.package) {
        schema.package = packageName
      }
    })
  })
  // returns modified schemas just for convenience
  return schemas
}

/**
 * Combines multiple versioned schemas into single object
 *
 * @example combineSchemas(BillingPlan, GetRunResponse, ...)
 */
export const combineSchemas = (...versioned: VersionedSchema[]) => {
  const result: SchemaCollection = {}
  versioned.forEach(v => {
    const title = v[Object.keys(v)[0]].schema.title
    const name = normalizeName(title)
    result[name] = v
  })
  return result
}
