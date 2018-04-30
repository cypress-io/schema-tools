import test from 'ava'
import { assertSchema } from '../src'
import { schemas } from './example-schemas'

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
  const assert = assertSchema(schemas)('Person', '1.0.0', ['age'])
  const fn = () => assert(o)
  t.notThrows(fn)
})
