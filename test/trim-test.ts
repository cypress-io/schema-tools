import test from 'ava'
import { bind } from '../src/api'
import { schemas } from './example-schemas'

const api = bind({ schemas: schemas })

const schemaName = 'Person'
const schemaVersion = '1.0.0'

test('has trim method', t => {
  t.is(typeof api.trim, 'function')
})

test('trim returns a cloned object', t => {
  const e: object = api.getExample(schemaName, schemaVersion) as object
  t.truthy(e, 'we have an example')
  const r: object = api.trim(schemaName, schemaVersion, e)
  t.true(r !== e, 'returns new object')
  t.deepEqual(r, e, 'nothing should be trimmed')
})

test('trim removes extra properties', t => {
  const e: any = api.getExample(schemaName, schemaVersion) as object
  // add extra property
  e.foo = 'bar'
  const r: object = api.trim(schemaName, schemaVersion, e)
  t.true(r !== e, 'returns new object')
  t.deepEqual(
    r,
    {
      name: 'Joe',
      age: 10,
    },
    'extra property foo should be trimmed',
  )
})
