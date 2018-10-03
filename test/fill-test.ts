import test from 'ava'
import {
  fillBySchema,
  JsonSchema,
  ObjectSchema,
  stringToSemver,
  trimBySchema,
} from '../src'

// for comparison: here is how "trim" works
test('trim removes extra property', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      first: {
        type: 'number',
      },
    },
  }
  const objectSchema: ObjectSchema = {
    version: stringToSemver('1.0.0'),
    schema,
    example: {
      first: 42,
    },
  }
  // this object has 1 known property "first" and 1 extra property "second"
  const o = {
    first: 1,
    second: 2,
  }
  const result = trimBySchema(objectSchema, o)
  // second unknown property has been removed
  t.deepEqual(result, {
    first: 1,
  })
})

test('fill adds required property using explicit default value', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      first: {
        type: 'number',
      },
      second: {
        type: 'number',
        defaultValue: 99,
      },
    },
    required: ['first', 'second'],
  }
  const objectSchema: ObjectSchema = {
    version: stringToSemver('1.0.0'),
    schema,
    example: {
      first: 42,
      second: 43,
    },
  }
  // this object has only one required property "first" and is missing second property
  const o = {
    first: 1,
  }
  const result = fillBySchema(objectSchema, o)
  // second property with explicit default value has been added
  t.deepEqual(result, {
    first: 1,
    second: 99,
  })
})

test('fill adds properties to an empty object', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      first: {
        type: 'number',
        defaultValue: 14,
      },
      second: {
        type: 'number',
        defaultValue: 99,
      },
    },
    required: ['first', 'second'],
  }
  const objectSchema: ObjectSchema = {
    version: stringToSemver('1.0.0'),
    schema,
    example: {
      first: 42,
      second: 43,
    },
  }
  // empty starting object
  const o = {}
  const result = fillBySchema(objectSchema, o)
  // second property with explicit default value has been added
  t.deepEqual(result, {
    first: 14,
    second: 99,
  })
})

test('throws an error if cannot fill missing property', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      first: {
        type: 'number',
      },
      second: {
        type: 'number',
        defaultValue: 99,
      },
    },
    required: ['first', 'second'],
  }
  const objectSchema: ObjectSchema = {
    version: stringToSemver('1.0.0'),
    schema,
    example: {
      first: 42,
      second: 43,
    },
  }
  // does not know how to polyfill first property, there is no default value
  t.throws(() => {
    fillBySchema(objectSchema, {})
  }, 'Do not know how to get default value for property "first"')
})
