import test from 'ava'
import { assertSchema } from '../src'
import { schemas } from './example-schemas'

test('nested object has required properties', t => {
  t.notThrows(() => {
    return assertSchema(schemas)('Person', '1.3.0')({
      name: {
        first: 'John',
        last: 'Snow'
      },
      age: 2
    })
  })
})

test('nested object extended with partly required properties', t => {
  t.notThrows(() => {
    return assertSchema(schemas)('Person', '1.4.0')({
      yearOfBirth: 1234,
      age: 23
    })
  })
})
