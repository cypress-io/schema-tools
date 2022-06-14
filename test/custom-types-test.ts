import validator from 'is-my-json-valid'
import test from 'ava'

// looking at jsen as an alternative
// import jsen from 'jsen'
;(() => {
  // GOOD EXAMPLE date-time string format
  const schema = {
    properties: {
      t: {
        type: 'string',
        format: 'date-time',
      },
    } as Record<string, any>,
    required: true,
    type: ['object'] as ("object" | "null")[]
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
  const schema = {
    type: ['object'] as ("object" | "null")[],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        required: true,
      },
    } as Record<string, any>,
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
    type: ['object'] as ("object" | "null")[],
    properties: {
      age: {
        type: 'integer',
        minimum: 1,
        required: true,
      },
    } as Record<string, any>,
  }
  const schema = {
    type: ['object'] as ("object" | "null")[],
    properties: {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        $ref: 'definitions#/age',
        required: true,
      },
    }  as Record<string, any>,
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
    },
    required: ['age'],
  }
  const schema = {
    type: ['object'] as ("object" | "null")[],
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
    } as Record<string, any>,
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
