import {
  CustomFormat,
  CustomFormats,
  JsonSchemaFormats,
  detectors,
} from '../src'
import { ObjectSchema, SchemaCollection, VersionedSchema } from '../src/objects'
import { combineSchemas, versionSchemas } from '../src/utils'

const name: CustomFormat = {
  name: 'name',
  description: 'Custom name format',
  detect: /^[A-Z][a-z]+$/,
  defaultValue: 'Buddy',
}

export const exampleFormats: CustomFormats = {
  name,
}

// individual schema describing "Person" v1.0.0
export const person100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Person',
    description: 'An example schema describing a person',
    properties: {
      name: {
        type: 'string',
        format: 'name',
        description: 'this person needs a name',
      },
      age: {
        type: 'integer',
        minimum: 0,
        description: 'Age in years',
      },
    },
    required: ['name', 'age'],
    additionalProperties: false,
  },
  example: {
    name: 'Joe',
    age: 10,
  },
}

// example schema that has an array of "Person" objects
const team100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Team',
    description: 'A team of people',
    properties: {
      people: {
        type: 'array',
        items: {
          ...person100.schema,
        },
        see: person100,
      },
    },
  },
  example: {
    people: [person100.example],
  },
}

// collection of "Person" schemas by version.
// In our case there will be single version, but here is where we can combine multiple
// versions like: versionSchemas(person100, person110, person200, ...)
const personVersions: VersionedSchema = versionSchemas(person100)
const teamVersions: VersionedSchema = versionSchemas(team100)

// combines "Person" versions with other schemas if any
export const schemas: SchemaCollection = combineSchemas(
  personVersions,
  teamVersions,
)

export const formats: JsonSchemaFormats = detectors(exampleFormats)
