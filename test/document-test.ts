import test from 'ava'
import json2md from 'json2md'
import { documentSchema, findUsedColumns } from '../src/document/utils'
import { documentCustomFormats } from '../src/document/doc-formats'
import { JsonSchema } from '../src/objects'
import { CustomFormats } from '../src/formats'
import { schemas, exampleFormats } from './example-schemas'
import { documentSchemas } from '../src'

test('documents just schemas', t => {
  const markdown = documentSchemas(schemas)
  t.snapshot(markdown)
})

test('documents schemas and custom formats', t => {
  const markdown = documentSchemas(schemas, exampleFormats)
  t.snapshot(markdown)
})

test('sublist', t => {
  const json = [
    {
      ul: [
        'top level',
        {
          ul: ['inner level 1', 'inner level 2'],
        },
      ],
    },
  ]
  const md = json2md(json)
  t.snapshot(md)
})

test('filters unused columns', t => {
  const headers = ['first', 'second', 'third']
  const rows = [
    {
      first: 'a',
      second: '',
      third: '',
    },
    {
      first: 'b',
      second: '',
      third: '',
    },
    {
      first: '',
      second: '',
      third: 'c',
    },
  ]
  const used = findUsedColumns(headers, rows)
  t.snapshot(used)
})

test('JSON schema object to Markdown object', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
  }
  const result = documentSchema(schema)
  t.snapshot(result)
})

test('JSON schema object to Markdown', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
  }
  const result = json2md(documentSchema(schema))
  t.snapshot(result)
})

test('custom formats', t => {
  const formats: CustomFormats = {
    foo: {
      name: 'foo',
      description: 'example custom format foo',
      detect: /^foo$/,
    },
  }
  const result = documentCustomFormats(formats)
  t.snapshot(result)
  t.snapshot(json2md(result))
})

// test('default values for custom formats', t => {
//   t.snapshot(formatDefaults)
// })
