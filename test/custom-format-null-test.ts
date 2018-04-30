import validator from 'is-my-json-valid'
import test from 'ava'
import { JsonSchema } from '../src/objects'
import { JsonSchemaFormats } from '../src/formats'

const schema: JsonSchema = {
  type: 'object',
  title: 'testSchema',
  properties: {
    t: {
      type: ['null', 'string'],
      format: 'foo',
      description: 'this property could be a string in format "foo" or a null',
    },
  },
  required: ['t'],
}

const formats: JsonSchemaFormats = {
  // custom format "foo" can only be the string "FOO"
  foo: /^FOO$/,
}

test('valid string in format foo', t => {
  const validate = validator(schema, { formats })
  t.true(validate({ t: 'FOO' }))
})

test('invalid string is caught', t => {
  t.plan(2)
  const validate = validator(schema, { formats })
  const result = validate({ t: 'bar' })
  t.false(result)
  t.deepEqual(validate.errors, [
    { field: 'data.t', message: 'must be foo format' },
  ])
})

test('null is allowed with custom format', t => {
  t.plan(1)
  const validate = validator(schema, { formats })
  const result = validate({ t: null })
  t.true(result)
})
