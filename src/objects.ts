/**
 * "Simple" object type that can store strings, numbers and other simple objects
 */
export type PlainObject = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | PlainObject
    | PlainObject[]
}

/**
 * schema version string like "1.1.0"
 */
export type SchemaVersion = string

/**
 * Name and version tuple
 */
export type NameVersion = {
  name: string
  version: SchemaVersion
}

export type JsonPropertyTypes =
  | 'number'
  | 'integer'
  | 'string'
  | 'object'
  | 'boolean'
  | 'array'
  | string[]
  | number[]

export type JsonProperty = {
  type: JsonPropertyTypes
  format?: string
  minimum?: number
  maximum?: number
  minItems?: number
  maxItems?: number
  description?: string
  required?: boolean | string[]
  properties?: JsonProperties
  items?: JsonProperty
  see?: string | ObjectSchema
  title?: string
  patternProperties?: object
  additionalProperties?: boolean
  enum?: string[]
  // if the property is deprecated show this message
  deprecated?: string
}

export type JsonProperties = {
  [key: string]: JsonProperty
}

// describes roughly http://json-schema.org/examples.html
export type JsonSchema = {
  title: string
  type: 'object'
  description?: string
  properties?: JsonProperties
  patternProperties?: object
  // which properties are MUST have
  required?: string[] | true
  // does the schema allow unknown properties?
  additionalProperties: boolean
  deprecated?: string
}

export type ObjectSchema = {
  version: Semver
  schema: JsonSchema
  example: PlainObject
  /**
   * Usually the name of the package this schema is defined in.
   */
  package?: string
}

export type VersionedSchema = {
  // SemverString to ObjectSchema
  [key: string]: ObjectSchema
}

export type SchemaCollection = {
  // schema name to versioned schema
  [key: string]: VersionedSchema
}

/**
 * Semantic version object
 *
 * @example const v:Semver = {major: 1, minor: 0, patch: 2}
 * @see https://semver.org/
 */
export type Semver = {
  major: number
  minor: number
  patch: number
}
