import { validator } from '../src/bridge-validator'
import test from 'ava'

// looking at jsen as an alternative
// import jsen from 'jsen'
;import { JsonProperties, JsonSchema } from '../src';
(() => {
  // GOOD EXAMPLE date-time string format
  const schema: JsonSchema = {
    type: 'object',
    title: 'testSchema',
    additionalProperties: false,
    properties: {
      t: {
        type: 'string',
        format: 'date-time',
      },
    },
    required: ['t'],
  }

  test('valid date-time', t => {
    const validate = validator(schema)
    t.true(validate({ t: '2018-03-21T02:01:29.557Z' }))
  })

  test('invalid date-time', t => {
    const validate = validator(schema)
    const result = validate({ t: '1001' })
    t.false(result)
    t.snapshot(validate.errors)
  })
})()
;(() => {
  // GOOD EXAMPLE uuid custom string format
  const schema: JsonSchema = {
    type: 'object',
    title: 'testSchema',
    additionalProperties: false,
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        required: true,
      },
    },
  }
  const formats = {
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  }

  test('valid uuid', t => {
    const validate = validator(schema, { formats })
    t.true(validate({ id: '22908a15-d7cd-4779-b31c-78b021c684f8' }))
  })

  test('invalid uuid', t => {
    const validate = validator(schema, { formats })
    const result = validate({ id: 'something-there' })
    t.false(result)
    t.snapshot(validate.errors)
  })
})()
;(() => {
  const innerSchema = {
    properties: {
      age: {
        type: 'integer',
        minimum: 1,
        required: true,
      },
    },
  }
  const schema: JsonSchema = {
    type: 'object',
    title: 'testSchema',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'string',
        $ref: 'definitions#/age',
        required: true,
      },
    },
  }

  const schemas = {
    definitions: innerSchema,
  }

  test('valid age when using external schema', t => {
    const validate = validator(schema, { schemas })
    const person = {
      name: 'joe',
      age: 20,
    }
    t.true(validate(person))
  })
})()
;(() => {
  const innerSchema = {
    properties: {
      age: {
        type: 'integer',
        minimum: 1,
      },
    } as JsonProperties,
    required: ['age'],
  }
  const schema: JsonSchema = {
    type: 'object',
    title: 'testSchema',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        required: true,
      },
      info: {
        type: 'object',
        properties: innerSchema.properties,
        required: innerSchema.required,
      },
    },
    required: ['name', 'info'],
  }

  test('valid age when using internal schema', t => {
    const validate = validator(schema)
    const person = {
      name: 'joe',
      info: {
        age: 20,
      },
    }
    t.true(validate(person))
  })

  test('invalid age', t => {
    const validate = validator(schema)
    const person = {
      name: 'joe',
      info: {
        age: -4,
      },
    }
    const result = validate(person)
    t.false(result)
    t.snapshot(validate.errors)
  })
})()
