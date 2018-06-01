import test from 'ava'
import { addProperty } from '../src/actions'
import { person100 } from './example-schemas'

test('addProperty creates example', t => {
  const person110 = addProperty({
    schema: person100,
    description: 'Person with title',
    property: 'title',
    propertyType: 'string',
    propertyFormat: null,
    exampleValue: 'mr',
    isRequired: false,
    propertyDescription: 'How to address this person',
  })
  t.truthy(person110, 'returns new schema')
  t.false(person110 === person100, 'returns new object')
  t.is(person110.schema.title, person100.schema.title, 'copied title')
  t.snapshot(person110.example, 'example object')
  t.snapshot(person110.version, 'example version')
  t.snapshot(person110.schema, 'new json schema')
})

test('addProperty links property via see parameter', t => {
  t.plan(1)
  const person110 = addProperty({
    schema: person100,
    description: 'Person with title',
    property: 'title',
    propertyType: 'string',
    propertyFormat: null,
    exampleValue: 'mr',
    isRequired: false,
    propertyDescription: 'How to address this person',
    see: person100,
  })
  t.snapshot(
    person110,
    'new schema with property that points at different schema',
  )
})
