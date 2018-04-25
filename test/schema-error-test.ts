import test from 'ava'
import { SchemaError } from '../src'
import { assertSchema, getExample } from '../src'
import { schemas } from './example-schemas'

const assertPerson100 = assertSchema(schemas)('Person', '1.0.0')
const example = getExample(schemas)('Person')('1.0.0')

test('error has expected properties', t => {
  t.plan(5)

  // notice missing "name" property and invalid "age" value
  const o = {
    age: -1,
  }
  try {
    assertPerson100(o)
  } catch (e) {
    t.true(e instanceof SchemaError, 'error is instance of SchemaError')
    t.deepEqual(
      e.errors,
      ['data.name is required'],
      'only required properties is detected at first',
    )
    t.is(e.object, o, 'current object')
    t.is(e.example, example, 'example object')
    // entire message has everything
    t.snapshot(e.message)
  }
})
