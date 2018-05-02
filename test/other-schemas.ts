import { SchemaCollection, VersionedSchema, ObjectSchema } from '../src/objects'
import { combineSchemas, versionSchemas } from '../src/utils'

// individual schema describing "Todo item" v1.0.0
const todo100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'TodoItem',
    description: 'An example schema describing a todo item',
    properties: {
      caption: {
        type: 'string',
        description: 'what needs to be done',
      },
      done: {
        type: 'boolean',
        description: 'Is it done',
      },
    },
    required: ['caption', 'done'],
    additionalProperties: false,
  },
  example: {
    caption: 'start testing',
    done: false,
  },
}

const todoItemVersions: VersionedSchema = versionSchemas(todo100)
export const schemas: SchemaCollection = combineSchemas(todoItemVersions)
