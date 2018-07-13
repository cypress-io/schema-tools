import test from 'ava'
import { assertSchema } from '../src'
import { person100, person110, schemas } from './example-schemas'

test('extend existing schema creates new schema', t => {
  t.truthy(person110, 'returns new schema')
  t.false(person110 === person100, 'returns new object')
  t.deepEqual(person110.schema.required, ['name', 'age'])
  t.is(person110.schema.title, person100.schema.title, 'copied title')
  t.snapshot(person110.example, 'example object')
  t.snapshot(person110.version, 'example version')
  t.snapshot(person110.schema, 'new json schema')
})

test('extend can mark required properties false', t => {
  t.notThrows(() => {
    return assertSchema(schemas)('car', '1.0.0')({
      color: 'blue',
    })
  })

  t.notThrows(() => {
    return assertSchema(schemas)('car', '1.1.0')({
      color: 'blue',
    })
  })
})
