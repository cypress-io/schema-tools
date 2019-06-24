import test from 'ava'
import { assertBySchema, JsonSchema, PlainObject } from '..'

test('allows arrays of numbers', t => {
  t.plan(0)
  const jsonSchema: JsonSchema = {
    title: 'Schema with numbers',
    type: 'object',
    additionalProperties: false,
    properties: {
      numbers: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    },
  }
  const example: PlainObject = {
    numbers: [1, 2, 3],
  }
  const o: PlainObject = {
    numbers: [101, 102, 103],
  }
  assertBySchema(jsonSchema, example)(o)
})
