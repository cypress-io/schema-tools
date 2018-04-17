import test from 'ava'
import { validate, validateBySchema } from '../src'
import { JsonSchema } from '../src/objects'
import { schemas } from './example-schemas'

const validateExample100 = validate(schemas)('example', '1.0.0')

test('is a function', t => {
  t.is(typeof validate, 'function')
})

test('passing membership invitation 1.0.0', t => {
  const o = {
    name: 'foo',
    age: 1,
  }
  t.truthy(validateExample100(o))
})

test('missing name membership invitation 1.0.0', t => {
  const o = {
    age: 1,
  }
  const result = validateExample100(o)
  t.deepEqual(result, ['data.name is required'])
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
  },
  required: ['createdAt', 'name', 'hook'],
}

test('validates object by schema', t => {
  const o = {
    createdAt: new Date().toISOString(),
    name: 'Joe',
    hook: 'h1',
  }
  t.true(validateBySchema(schema)(o))
})

test('shows error for missing property', t => {
  const o = {
    name: 'Joe',
    hook: 'h1',
  }
  t.snapshot(validateBySchema(schema)(o))
})

test('shows error for wrong type', t => {
  const o = {
    createdAt: 'Sunday',
    name: 'Joe',
    hook: 'h1',
  }
  t.snapshot(validateBySchema(schema)(o))
})
