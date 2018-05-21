import test from 'ava'
import stringify from 'json-stable-stringify'
import { getDefaults } from '../src/formats'
import { JsonSchema } from '../src/objects'
import { sanitize, sanitizeBySchema } from '../src/sanitize'
import { exampleFormats, schemas } from './example-schemas'

const schemaName = 'person'
const schemaVersion = '1.0.0'
const formatDefaults = getDefaults(exampleFormats)

test('example sanitize', t => {
  const object = {
    name: 'joe',
    age: 21,
  }
  const result = sanitize(schemas)(schemaName, schemaVersion)(object)
  t.snapshot(stringify(result, { space: '  ' }))
})

test('sanitize with default values', t => {
  t.plan(1)
  const object = {
    name: 'joe',
    age: 21,
  }
  const result = sanitize(schemas, formatDefaults)(schemaName, schemaVersion)(
    object,
  )
  t.deepEqual(result, {
    name: 'Buddy',
    age: 21,
  })
})

test('sanitize empty object using schema', t => {
  const schema: JsonSchema = {
    title: 'TestSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      name: {
        type: 'string',
      },
      hook: {
        type: 'string',
        format: 'hookId',
      },
      ids: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  }

  const o = {}
  const result = sanitizeBySchema(schema, formatDefaults)(o)
  t.deepEqual(result, {})
})

test('sanitize string array', t => {
  t.plan(1)
  const schema: JsonSchema = {
    title: 'TestSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
      names: {
        type: 'array',
        items: {
          type: 'string',
          format: 'name',
        },
      },
    },
  }

  const o = {
    names: ['Joe', 'Mary'],
  }
  const result = sanitizeBySchema(schema, formatDefaults)(o)
  t.deepEqual(
    result,
    { names: ['Buddy', 'Buddy'] },
    'both names were replaced with default value for the format',
  )
})

test('sanitize array', t => {
  const schema: JsonSchema = {
    title: 'TestSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
      names: {
        type: 'array',
        items: {
          // requires "title" in order to be considered a schema
          title: 'Name',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              format: 'name',
            },
          },
        },
      },
    },
  }

  const o = {
    names: [
      {
        name: 'Joe',
      },
      {
        name: 'Mary',
      },
    ],
  }
  const result = sanitizeBySchema(schema, formatDefaults)(o)
  t.deepEqual(
    result,
    {
      names: [
        {
          name: 'Buddy',
        },
        {
          name: 'Buddy',
        },
      ],
    },
    'name in each object is sanitized',
  )
})

test('sanitize array that can be null', t => {
  const schema: JsonSchema = {
    title: 'TestSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
      names: {
        // notice that names can be "null"
        // https://github.com/cypress-io/schema-tools/issues/53
        type: ['array', 'null'],
        items: {
          // requires "title" in order to be considered a schema
          title: 'Name',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              format: 'name',
            },
          },
        },
      },
    },
  }

  const o = {
    names: [
      {
        name: 'Joe',
      },
      {
        name: 'Mary',
      },
    ],
  }
  const result = sanitizeBySchema(schema, formatDefaults)(o)
  t.deepEqual(
    result,
    {
      names: [
        {
          name: 'Buddy',
        },
        {
          name: 'Buddy',
        },
      ],
    },
    'name in each object is sanitized',
  )
})
