import {
  CustomFormat,
  CustomFormats,
  detectors,
  extend,
  JsonSchemaFormats,
} from '../src'
import { ObjectSchema, SchemaCollection, VersionedSchema } from '../src/objects'
import { combineSchemas, versionSchemas } from '../src/utils'

const traits100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Traits',
    description: 'Physical traits of person',
    properties: {
      eyeColor: {
        type: 'string',
        description: 'Eye color',
        minLength: 2,
        maxLength: 20,
      },
      hairColor: {
        type: 'string',
        description: 'Hair color',
      },
    },
    additionalProperties: false,
  },
  example: {
    eyeColor: 'brown',
    hairColor: 'black',
  },
}

const name: CustomFormat = {
  name: 'name',
  description: 'Custom name format',
  detect: /^[A-Z][a-z]+$/,
  defaultValue: 'Buddy',
}

const exampleFormats: CustomFormats = {
  name,
}

// individual schema describing "Person" v1.0.0
const person100: ObjectSchema = {
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
        minLength: 2,
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

const person110: ObjectSchema = extend(person100, {
  schema: {
    description: 'Person with title',
    properties: {
      title: {
        type: 'string',
        format: null,
        description: 'How to address this person',
      },
    },
  },
  example: {
    title: 'mr',
  },
})

const person120: ObjectSchema = extend(person110, {
  schema: {
    description: 'Person with traits',
    properties: {
      traits: {
        ...traits100.schema,
        see: traits100,
      },
    },
  },
  example: {
    name: 'Joe',
    age: 10,
    traits: {
      eyeColor: 'brown',
      hairColor: 'black',
    },
  },
})

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
    additionalProperties: false,
  },
  example: {
    people: [person100.example],
  },
}

const car100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Car',
    description: 'A motor vehicle',
    properties: {
      color: {
        type: 'string',
      },
    },
    additionalProperties: false,
    required: true,
  },
  example: {
    color: 'red',
  },
}

const car110: ObjectSchema = extend(car100, {
  schema: {
    properties: {
      doors: {
        type: 'number',
        required: false,
      },
    },
  },
  example: {
    doors: 2,
  },
})

// collection of "Person" schemas by version.
// In our case there will be single version, but here is where we can combine multiple
// versions like: versionSchemas(person100, person110, person200, ...)
const personVersions: VersionedSchema = versionSchemas(
  person100,
  person110,
  person120,
)
const teamVersions: VersionedSchema = versionSchemas(team100)
const carVersions: VersionedSchema = versionSchemas(car100, car110)

// combines "Person" versions with other schemas if any
const schemas: SchemaCollection = combineSchemas(
  personVersions,
  teamVersions,
  carVersions,
)

const formats: JsonSchemaFormats = detectors(exampleFormats)

export {
  car100,
  person100,
  person110,
  person120,
  formats,
  schemas,
  exampleFormats,
}
