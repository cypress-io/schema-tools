import test from 'ava'
import { sanitize, sanitizeBySchema } from '../src/sanitize'
import { schemas, exampleFormats } from './example-schemas'
import stringify from 'json-stable-stringify'
import { JsonSchema } from '../src/objects'
import { getDefaults } from '../src/formats'

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

const schema: JsonSchema = {
  title: 'TestSchema',
  type: 'object',
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

test('sanitize empty object using schema', t => {
  const o = {}
  const result = sanitizeBySchema(schema)(o)
  t.deepEqual(result, {})
})
