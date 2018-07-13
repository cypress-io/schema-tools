import test from 'ava'
import { ObjectSchema } from '../src'
import { extend } from '../src/actions'
import { person100 } from './example-schemas'

test('extend existing schema creates new schema', t => {
  const person110: ObjectSchema = extend(person100, {
    schema: {
      description: 'Person with title',
      properties: {
        title: {
          type: 'string',
          format: null,
          description: 'How to address this person',
        },
      },
      required: ['title'],
    },
    example: {
      title: 'mr',
    },
  })
  t.truthy(person110, 'returns new schema')
  t.false(person110 === person100, 'returns new object')
  t.deepEqual(person110.schema.required, ['name', 'age', 'title'])
  t.is(person110.schema.title, person100.schema.title, 'copied title')
  t.snapshot(person110.example, 'example object')
  t.snapshot(person110.version, 'example version')
  t.snapshot(person110.schema, 'new json schema')
})
