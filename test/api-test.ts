import test from 'ava'
import * as methods from '../src/api'
import { schemas } from './example-schemas'

test('public api', t => {
  const methodNames = Object.keys(methods)
  t.snapshot(methodNames)
})

test('bind api to schemas', t => {
  t.plan(0)
  const api = methods.bind({ schemas })
  const person = {
    name: 'joe',
    age: 20,
  }
  api.assertSchema('person', '1.0.0')(person)
})
