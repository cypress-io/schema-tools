import test from 'ava'
import { assertBySchema, JsonSchema, PlainObject } from '..'

test('enforces string min length', t => {
  t.plan(2)
  const jsonSchema: JsonSchema = {
    title: 'Schema with minLength string property',
    type: 'object',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        minLength: 5,
      },
    },
  }
  const example: PlainObject = {
    name: 'Joe Smith',
  }
  const o: PlainObject = {
    name: 'A',
  }
  const e: Error = t.throws(() => assertBySchema(jsonSchema, example)(o))
  t.snapshot(e.message)
})

test('enforces string max length', t => {
  t.plan(2)
  const jsonSchema: JsonSchema = {
    title: 'Schema with maxLength string property',
    type: 'object',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        maxLength: 5,
      },
    },
  }
  const example: PlainObject = {
    name: 'Joe',
  }
  const o: PlainObject = {
    name: 'A very long name for some reason',
  }
  const e: Error = t.throws(() => assertBySchema(jsonSchema, example)(o))
  t.snapshot(e.message)
})
