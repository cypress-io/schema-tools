import {
  Semver,
  ObjectSchema,
  JsonPropertyTypes,
  VersionedSchema,
  SchemaCollection,
} from './objects'
import camelCase from 'lodash.camelcase'
import cloneDeep from 'lodash.clonedeep'
import la from 'lazy-ass'
import { map, path, uniq } from 'ramda'

/**
 * converts semantic version object into a string.
 * @example semverToString({major: 1, minor: 2, patch: 3}) // "1.2.3"
 */
export const semverToString = (s: Semver): string =>
  `${s.major}.${s.minor}.${s.patch}`

/**
 * Returns consistent name for a schema.
 *
 * @example normalizeName('membership_invitation') //> 'membershipInvitation'
 */
export const normalizeName = (s: string): string => camelCase(s)

/**
 * Returns single object with every object schema under semver key.
 * @param schemas Schemas to combine into single object
 * @example versionSchemas(TestInformation100, TestInformation110)
 */
export const versionSchemas = (...schemas: ObjectSchema[]) => {
  la(schemas.length, 'expected list of schemas')
  const titles: string[] = map(path(['schema', 'title']))(schemas) as string[]
  const unique = uniq(titles)
  la(unique.length === 1, 'expected same schema titles, got', titles)

  const result: VersionedSchema = {}
  schemas.forEach(s => {
    const version = semverToString(s.version)
    result[version] = s
  })
  return result
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

/**
 * Adds a property to another schema, creating a new schema.
 */
export const addProperty = (
  objectSchema: ObjectSchema,
  title: string,
  description: string,
  property: string,
  propertyType: JsonPropertyTypes,
  propertyFormat: string | null,
  exampleValue: any,
  isRequired?: boolean,
  propertyDescription?: string,
  see?: string,
) => {
  const newSchema: ObjectSchema = cloneDeep(objectSchema)
  newSchema.schema.description = description
  newSchema.schema.title = title

  if (!newSchema.schema.properties) {
    newSchema.schema.properties = {}
  }

  newSchema.schema.properties[property] = {
    type: propertyType,
  }
  const newProp = newSchema.schema.properties[property]

  // refine new property
  if (propertyFormat) {
    newProp.format = propertyFormat
  }

  if (isRequired) {
    if (!newSchema.schema.required) {
      newSchema.schema.required = []
    }
    newSchema.schema.required.push(property)
  }

  if (propertyDescription) {
    newProp.description = propertyDescription
  }

  if (see) {
    newProp.see = see
  }

  newSchema.example[property] = cloneDeep(exampleValue)
  return newSchema
}
