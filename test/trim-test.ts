import test from 'ava'
import { bind } from '../src/api'
import { schemas } from './example-schemas'

const api = bind({ schemas: schemas })

test('has trim method', t => {
  t.is(typeof api.trim, 'function')
})

test('trim returns a cloned object', t => {
  const e: object = api.getExample('Person', '1.0.0') as object
  t.truthy(e, 'we have an example')
})
