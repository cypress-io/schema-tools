import test from 'ava'
import { ObjectSchema } from '../src'
import { addProperty } from '../src/actions'
import { person100 } from './example-schemas'

test('addProperty creates example', t => {
  const person110 = addProperty(
    {
      schema: person100,
      description: 'Person with title',
    },
    {
      property: 'title',
      propertyType: 'string',
      propertyFormat: null,
      exampleValue: 'mr',
      isRequired: false,
      propertyDescription: 'How to address this person',
    },
  )
  t.truthy(person110, 'returns new schema')
  t.false(person110 === person100, 'returns new object')
  t.is(person110.schema.title, person100.schema.title, 'copied title')
  t.snapshot(person110.example, 'example object')
  t.snapshot(person110.version, 'example version')
  t.snapshot(person110.schema, 'new json schema')
})

test('addProperty several properties', t => {
  t.plan(1)
  const person110 = addProperty(
    {
      schema: person100,
      description: 'Person with title',
    },
    {
      property: 'title',
      propertyType: 'string',
      propertyFormat: null,
      exampleValue: 'mr',
      isRequired: false,
      propertyDescription: 'How to address this person',
    },
    {
      property: 'mood',
      propertyType: 'string',
      propertyFormat: null,
      exampleValue: 'blue',
      isRequired: false,
      propertyDescription: 'How does this person feel',
    },
  )
  t.snapshot(person110, 'added two properties: title and mood')
})

test('addProperty links property via see parameter', t => {
  t.plan(1)
  const person110 = addProperty(
    {
      schema: person100,
      description: 'Person with title',
    },
    {
      property: 'title',
      propertyType: 'string',
      propertyFormat: null,
      exampleValue: 'mr',
      isRequired: false,
      propertyDescription: 'How to address this person',
      see: person100,
    },
  )
  t.snapshot(
    person110,
    'new schema with property that points at different schema',
  )
})

test('addProperty respects isRequired false', t => {
  t.plan(2)
  const a: ObjectSchema = {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
    example: {
      foo: 'foo',
    },
    schema: {
      title: 'test',
      type: 'object',
      description: 'test schema A',
      properties: {
        foo: {
          type: 'string',
        },
      },
      required: true,
      additionalProperties: false,
    },
  }
  const b = addProperty(
    {
      schema: a,
      description: 'Test schema B',
    },
    {
      property: 'bar',
      propertyType: 'string',
      propertyFormat: null,
      exampleValue: 'bar',
      isRequired: false,
    },
  )
  t.deepEqual(b.schema.required, ['foo'], 'bar should not be required')
  t.snapshot(b, 'new schema without required new property "bar"')
})
