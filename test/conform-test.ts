import test from 'ava'
import { JsonSchema, ObjectSchema, stringToSemver, trimBySchema } from '../src'

test('sanitize handles extra property', t => {
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
