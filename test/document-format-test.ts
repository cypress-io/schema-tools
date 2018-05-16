import test from 'ava'
import { JsonProperty } from '../src'
import {
  anchorForSchema,
  emptyMark,
  formatToMarkdown,
} from '../src/document/utils'
import { exampleFormats, person100, schemas } from './example-schemas'

test('no format', t => {
  const value: JsonProperty = {
    type: 'string',
  }
  const result = formatToMarkdown(schemas, exampleFormats)(value)
  t.is(result, emptyMark)
})

test('no custom schemas or formats', t => {
  const value: JsonProperty = {
    type: 'string',
  }
  const result = formatToMarkdown(undefined, undefined)(value)
  t.is(result, emptyMark)
})

test('date-time format', t => {
  const value: JsonProperty = {
    type: 'string',
    format: 'date-time',
  }
  const result = formatToMarkdown(undefined, undefined)(value)
  t.is(result, '`date-time`')
})

test('custom format', t => {
  t.true('name' in exampleFormats, 'there is custom format "name"')
  const value: JsonProperty = {
    type: 'string',
    format: 'name',
  }
  const result = formatToMarkdown(undefined, exampleFormats)(value)
  t.is(result, '[name](#formats)', 'points at the custom formats section')
})

test('schema using "see" text', t => {
  t.plan(1)
  const value: JsonProperty = {
    type: 'object',
    see: 'another thing',
  }
  const result = formatToMarkdown(undefined, exampleFormats)(value)
  t.is(result, '`another thing`', 'adds quotes')
})

test('anchorForSchema', t => {
  t.is(anchorForSchema(person100), 'person100')
})

test('schema pointing at another schema', t => {
  t.true('person' in schemas, 'there is a schema named "person"')
  const value: JsonProperty = {
    type: 'array',
    items: {
      ...person100.schema,
    },
    see: person100,
  }
  const result = formatToMarkdown(schemas, exampleFormats)(value)
  t.is(result, '[Person@1.0.0](#person100)')
})
