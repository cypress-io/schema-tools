import { SchemaCollection, VersionedSchema } from '../src/objects'
import { combineSchemas } from '../src/utils'
import { CustomFormats, CustomFormat } from '../src'

const name: CustomFormat = {
  name: 'name',
  description: 'Custom name format',
  detect: /^[A-Z][a-z]+$/,
}

export const exampleFormats: CustomFormats = {
  name,
}

const example: VersionedSchema = {
  '1.0.0': {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
    schema: {
      type: 'object',
      title: 'Example',
      description: 'An example schema',
      properties: {
        name: {
          type: 'string',
          format: 'name',
          description: 'this object needs a name',
        },
        age: {
          type: 'integer',
          minimum: 0,
          description: 'Age in years',
        },
      },
      required: ['name', 'age'],
    },
    example: {
      name: 'Joe',
      age: 10,
    },
  },
}

export const schemas: SchemaCollection = combineSchemas(example)
