import test from 'ava'
import { sanitize, sanitizeBySchema } from '../src/sanitize'
import { schemas } from './example-schemas'
import stringify from 'json-stable-stringify'
import { JsonSchema } from '../src/objects'

test('example sanitize', t => {
  const object = {
    name: 'joe',
    age: 21,
  }
  const result = sanitize(schemas)('example', '1.0.0')(object)
  t.snapshot(stringify(result, { space: '  ' }))
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
