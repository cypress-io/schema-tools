import { schemaNames, getExample, setPackageName } from '../src'
import { schemas } from './example-schemas'
import test from 'ava'
import { JsonSchema } from '../src/objects'
import validator from 'is-my-json-valid'
import { clone } from 'ramda'

test('has schema names', t => {
  t.is(typeof schemaNames, 'function')
  const names = schemaNames(schemas)
  t.truthy(Array.isArray(names))
})

test('provided schemas', t => {
  const names = schemaNames(schemas)
  t.snapshot(names)
})

test('returns example', t => {
  const example = getExample(schemas)('example')('1.0.0')
  t.deepEqual(example, {
    age: 10,
    name: 'Joe',
  })
})

test('optional uri field', t => {
  const schema: JsonSchema = {
    title: 'Test',
    type: 'object',
    properties: {
      // GOOD EXAMPLE optional but formatted property
      url: {
        type: ['string', 'null'],
        format: 'uri',
      },
    },
  }
  const valid = validator(schema)
  t.true(valid({ url: 'https://foo.com' }), 'has url property')
  t.true(valid({}), 'undefined url property')
  t.true(valid({ url: null }), 'null url property')
  t.false(valid({ url: 'foo' }), 'invalid url format')
})

test('sets package name', t => {
  t.plan(1)
  const schemasWithName = clone(schemas)
  setPackageName(schemasWithName, 'test-package')
  t.is(schemasWithName.person['1.0.0'].package, 'test-package')
})
