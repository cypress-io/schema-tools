import { assertBySchema } from '../src'
import { JsonSchema } from '../src/objects'
import test from 'ava'

test('pattern properties', t => {
  t.plan(0)
  const schema: JsonSchema = {
    type: 'object',
    title: 'test',
    // allow only properties that contains letter "a" like "a", "aa", "aaa", ...
    // and enumerated property "role"
    patternProperties: {
      '^a+$': {
        type: 'string',
      },
      '^role$': {
        enum: ['admin', 'member'],
      },
    },
    additionalProperties: false,
  }

  assertBySchema(schema)({
    a: 'foo',
  })

  assertBySchema(schema)({
    a: 'foo',
    aa: 'foo',
  })

  assertBySchema(schema)({
    a: 'foo',
    aa: 'foo',
    role: 'admin',
  })
})
