import test from 'ava'
import { addProperty } from '../src/actions'
import { person100 } from './example-schemas'

test('addProperty creates example', t => {
  const person110 = addProperty(
    person100,
    'Person',
    'Person with title',
    'title',
    'string',
    null,
    'mr',
    false,
    'How to address this person',
  )
  t.truthy(person110, 'returns new schema')
  t.snapshot(person110.example)
})
