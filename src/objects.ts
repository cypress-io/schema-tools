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

// 40 or 7 characters
// export type commitSha = string

// like "2018-03-20T18:23:51.121Z"
// export type ISODateString = string

// our tests have ids like "r1", "r2", etc
// export type testId = string

// our test hooks (before, beforeEach, afterEach, after) get
// ids like "h1", "h2", etc
// export type hookId = string

// UTC seconds
// export type UTCSeconds = number

// UUID strings like "22908a15-d7cd-4779-b31c-78b021c684f8"
// export type uuid = string

// "foo@foo.com"
// export type email = string

// height or width of an image or video
// export type pixels = number

// user role in an organization
// export type role = 'owner' | 'admin' | 'member'

/**
 * "Official" operating system names
 */
// export type osName = 'linux' | 'darwin' | 'win32'

// short project ids we use - 6 characters
// export type projectId = string

// the status of a project
// TODO set specific choices union
// export type projectStatus = string

// URL like "https://builds.cypress.io/564/screenshots/1.png"
// export type uri = string

// billing plan prices are in cents
// export type cents = number

// export type milliseconds = number

// test state matches Mocha labels
// export type testState = 'passed' | 'pending' | 'skipped' | 'failed'

/**
 * Single instance status.
 */
// export type instanceStatus =
//   | 'unclaimed'
//   | 'running'
//   | 'errored'
//   | 'failed'
//   | 'timedOut'
//   | 'passed'
//   | 'noTests'
//   | 'cancelled'

/**
 * Single run status, usually determined from the statuses of its instances
 */
// export type runStatus =
//   | 'unclaimed'
//   | 'running'
//   | 'errored'
//   | 'failed'
//   | 'timedOut'
//   | 'noTests'
//   | 'passed'

/**
 * schema version string like "1.1.0"
 */
export type SchemaVersion = string

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
  description?: string
  required?: boolean | string[]
  properties?: JsonProperties
  items?: JsonProperty
  see?: string
  title?: string
  patternProperties?: object
  additionalProperties?: boolean
  enum?: string[]
}

type JsonProperties = {
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
  required?: string[]
  // does the schema allow unknown properties?
  additionalProperties?: boolean
}

export type ObjectSchema = {
  version: Semver
  schema: JsonSchema
  example: PlainObject
}

export type VersionedSchema = {
  // SemverString to ObjectSchema
  [key: string]: ObjectSchema
}

export type SchemaCollection = {
  // schema name to versioned schema
  [key: string]: VersionedSchema
}

// https://semver.org/
export type Semver = {
  major: number
  minor: number
  patch: number
}
