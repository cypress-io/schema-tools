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
