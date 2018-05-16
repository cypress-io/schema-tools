import test from 'ava'
import { JsonProperty } from '../src'
import { emptyMark, formatToMarkdown } from '../src/document/utils'
import { exampleFormats, schemas } from './example-schemas'

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

test.only('schema pointing at another schema', t => {
  t.true('person' in schemas, 'there is a schema named "person"')
})
