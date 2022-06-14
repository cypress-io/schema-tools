import { assertBySchema } from '../src'
import test from 'ava'

test('pattern properties', t => {
  t.plan(0)
  const schema = {
    type: ['object'] as ("object" | "null")[],
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
    properties: {} as Record<string, any>,
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
