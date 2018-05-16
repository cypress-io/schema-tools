import test from 'ava'
import json2md from 'json2md'
import { clone } from 'ramda'
import { documentSchemas, setPackageName } from '../src'
import { documentCustomFormats } from '../src/document/doc-formats'
import {
  documentProperties,
  documentSchema,
  findUsedColumns,
} from '../src/document/utils'
import { CustomFormats } from '../src/formats'
import { JsonProperties, JsonSchema } from '../src/objects'
import { exampleFormats, schemas } from './example-schemas'

test('documents just schemas', t => {
  // without schemas and formats, the output document
  // just has the custom format by name
  const markdown = documentSchemas(schemas)
  t.snapshot(markdown)
})

test('documents schemas and custom formats', t => {
  // with schemas and custom formats it can link to the formats section
  const markdown = documentSchemas(schemas, exampleFormats)
  t.snapshot(markdown)
})

test('document properties', t => {
  t.plan(1)
  const properties: JsonProperties = {
    foo: {
      type: 'string',
      description: 'Property foo',
    },
    bar: {
      type: 'string',
      enum: ['A', 'B'],
      description: 'Can only be choice a or b',
    },
  }
  const result = documentProperties(properties)
  t.snapshot(result)
})

test('documents schemas with package name', t => {
  t.plan(1)
  const schemasWithName = clone(schemas)
  setPackageName(schemasWithName, 'test-package')
  const markdown = documentSchemas(schemasWithName, exampleFormats)
  t.true(markdown.includes('Defined in `test-package`'))
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
      // should use name in the documentation
      name: 'my-foo',
      description: 'example custom format foo',
      detect: /^foo$/,
    },
  }
  const result = documentCustomFormats(formats)
  t.snapshot(result)
  t.snapshot(json2md(result))
})

test('JSON schema with enumeration to Markdown', t => {
  const schema: JsonSchema = {
    title: 'test schema',
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
        enum: ['joe', 'mary'],
      },
    },
  }
  const result = json2md(documentSchema(schema))
  t.snapshot(result)
})
