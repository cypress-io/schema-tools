import test from 'ava'
import json2md from 'json2md'
import { clone } from 'ramda'
import { documentSchemas, setPackageName } from '../src'
import { documentCustomFormats } from '../src/document/doc-formats'
import {
  documentObjectSchema,
  documentProperties,
  documentProperty,
  documentSchema,
  findUsedColumns,
} from '../src/document/utils'
import { CustomFormats } from '../src/formats'
import {
  JsonProperties,
  JsonProperty,
  JsonSchema,
  ObjectSchema,
} from '../src/objects'
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

test('document property with minLength and maxLength', t => {
  t.plan(1)
  const property: JsonProperty = {
    type: 'string',
    minLength: 5,
    maxLength: 20,
  }
  const docProp = documentProperty([])
  const result = docProp('test property', property)
  t.snapshot({
    property,
    result,
  })
})

test('document property with minLength and maxLength at 0', t => {
  t.plan(1)
  const property: JsonProperty = {
    type: 'string',
    minLength: 0,
    maxLength: 0,
  }
  const docProp = documentProperty([])
  const result = docProp('test property', property)
  t.snapshot({
    property,
    result,
  })
})

test('document property with explicit default value', t => {
  t.plan(1)
  const property: JsonProperty = {
    type: 'string',
    defaultValue: 'foo Bar',
  }
  const docProp = documentProperty([])
  const result = docProp('test property', property)
  t.snapshot({
    property,
    result,
  })
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
    additionalProperties: false,
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
    additionalProperties: false,
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
    additionalProperties: false,
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

test('document deprecated schema', t => {
  t.plan(1)
  const jsonSchema: JsonSchema = {
    title: 'testSchema',
    type: 'object',
    additionalProperties: false,
    description: 'This is a test schema',
    deprecated: 'no longer in use',
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
  const schema: ObjectSchema = {
    version: {
      major: 1,
      minor: 2,
      patch: 3,
    },
    schema: jsonSchema,
    example: {
      id: 'abc',
      name: 'joe',
    },
  }
  const result = json2md(documentObjectSchema(schema))
  t.snapshot(result)
})

test('document deprecated schema property', t => {
  t.plan(1)
  const jsonSchema: JsonSchema = {
    title: 'testSchema',
    type: 'object',
    additionalProperties: true,
    description: 'This is a test schema',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
        enum: ['joe', 'mary'],
        deprecated: 'use property "fullName" instead',
      },
    },
  }
  const schema: ObjectSchema = {
    version: {
      major: 1,
      minor: 2,
      patch: 3,
    },
    schema: jsonSchema,
    example: {
      id: 'abc',
      name: 'joe',
    },
  }
  const result = json2md(documentObjectSchema(schema))
  t.snapshot(result)
})
