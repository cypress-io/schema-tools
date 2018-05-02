import test from 'ava'
import { assertSchema } from '../src'
import { schemas, formats } from './example-schemas'

const assertExample100 = assertSchema(schemas)('Person', '1.0.0')

test('is a function', t => {
  t.is(typeof assertSchema, 'function')
})

test('passing example 1.0.0', t => {
  t.plan(1)

  const o = {
    name: 'Mary',
    age: 5,
  }
  const fn = () => assertExample100(o)
  t.notThrows(fn)
})

test('missing name membership invitation 1.0.0', t => {
  t.plan(2)

  const o = {
    // missing name on purpose
    age: 10,
  }
  const fn = () => assertExample100(o)
  t.throws(fn)

  // let's keep track of how the error message looks
  try {
    fn()
  } catch (e) {
    t.snapshot(e.message)
  }
})

test('has schema name and version in the error object', t => {
  t.plan(2)

  const o = {
    // missing name on purpose
    age: 10,
  }
  const fn = () => assertExample100(o)

  try {
    fn()
  } catch (e) {
    t.is(e.schemaName, 'Person')
    t.is(e.schemaVersion, '1.0.0')
  }
})

test('has input object and example in the error object', t => {
  t.plan(2)

  const o = {
    // missing name on purpose
    age: 10,
  }
  const fn = () => assertExample100(o)

  try {
    fn()
  } catch (e) {
    t.is(e.object, o)
    t.deepEqual(e.example, {
      name: 'Joe',
      age: 10,
    })
  }
})

test('passing membership invitation 1.0.0 with field substitution', t => {
  t.plan(1)

  // notice invalid "age" value
  const o = {
    name: 'Joe',
    age: -1,
  }
  // replace "age" value with value from the example
  const assert = assertSchema(schemas)('Person', '1.0.0', {
    substitutions: ['age'],
  })
  const fn = () => assert(o)
  t.notThrows(fn)
})

test('error message has object with substitutions', t => {
  t.plan(3)

  // notice invalid "age" value and invalid "name"
  const o = {
    name: 'lowercase',
    age: -1,
  }
  // replace "age" value with value from the example
  // but the "name" does not match schema format
  const assert = assertSchema(schemas, formats)('Person', '1.0.0', {
    substitutions: ['age'],
  })

  try {
    assert(o)
  } catch (e) {
    // because we told assertSchema to substitute ["age"], it will grab
    // the age value from the example object for this schema
    const oWithSubstitutions = {
      name: 'lowercase',
      age: e.example.age,
    }
    t.deepEqual(e.object, oWithSubstitutions, 'object with replaced values')
    t.snapshot(e.message, 'error message')
    t.snapshot(e.errors, 'list of errors')
  }
})

test('lists additional properties', t => {
  t.plan(1)

  const o = {
    name: 'test',
    age: 1,
    // notice additional property
    foo: 'bar',
  }
  const assert = assertSchema(schemas)('Person', '1.0.0')
  try {
    assert(o)
  } catch (e) {
    t.deepEqual(e.errors, ['data has additional properties: foo'])
  }
})

test('whitelist errors only', t => {
  t.plan(1)

  const o = {
    name: 'test',
    age: -2,
  }
  const assert = assertSchema(schemas)('Person', '1.0.0', {
    omit: {
      object: true,
      example: true,
    },
  })
  try {
    assert(o)
  } catch (e) {
    t.snapshot(e.message)
  }
})
