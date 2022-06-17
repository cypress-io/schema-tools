import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import keywords from 'ajv-keywords'
import { JsonSchemaFormats, ValidationError } from '.'
import { JsonSchema } from './objects'

export type LenientJsonSchema = Partial<JsonSchema>
// {
//     properties?: JsonProperties,
//     title?: string;
//     type?: 'object';
//     description?: string | undefined;
//     patternProperties?: object | undefined;
//     required?: true | string[] | undefined;
//     additionalProperties?: boolean;
//     deprecated?: string | undefined;
// }

export type SchemasOption = {
  definitions: LenientJsonSchema
}

/**
var validate = validator({
  type: 'string',
  required: true,
  format: 'only-a'
}, {
  formats: {
    'only-a': /^a+$/
  }
})
 */

type Validator = {
  (input: any, options?: any): () => boolean
  errors: ValidationError[]
}

export function validator(
  schema: LenientJsonSchema,
  options?: {
    formats?: JsonSchemaFormats
    greedy?: boolean
    schemas?: SchemasOption
  },
): Validator {
  const requiredFields = [] as string[]
  const strippedProperties = {} as Record<string, any>
  const unmodifiedProperties = {} as Record<string, any>
  let nameMinLength = 0
  let nameMaxLength = 0
  if (schema.properties) {
    Object.keys(schema.properties).forEach((property) => {
      if (
        schema.properties![property].required ||
        schema.properties![property].see
      ) {
        if (schema.properties![property].required) {
          requiredFields.push(property)
          const clone = Object.assign({}, schema.properties![property])
          // Strip required so we can leave tests alone - there are places where we have `required: true`, which is not supported normally - it MUST be an array, when used
          delete clone.required
          strippedProperties[property] = clone
        }

        if (schema.properties![property].see) {
          requiredFields.push(property)
          const clone = Object.assign({}, schema.properties![property])
          clone.$ref = clone.see as string
          delete clone.see
          strippedProperties[property] = clone
        }
      } else {
        if (property === 'name') {
          if (schema.properties![property].minLength)
            nameMinLength = schema.properties![property].minLength!
          if (schema.properties![property].maxLength)
            nameMaxLength = schema.properties![property].maxLength!
        }
        unmodifiedProperties[property] = schema.properties![property]
      }
    })
  }

  const bridgedSchema = {
    ...schema,
    properties: {
      ...strippedProperties,
      ...unmodifiedProperties,
    },
    type: ['object'] as ('object' | 'null')[],
    required: requiredFields,
  }

  const ajv = new Ajv()

  if (options?.formats) {
    Object.keys(options.formats).forEach((format) => {
      ajv.addFormat(format, {
        type: 'string',
        // options and formats are already known to be defined by this point
        validate: (x) => options!.formats![format].test(x),
      })
    })
  }

  keywords(ajv)
  addFormats(ajv) // adds built-in formats
  ajv.addFormat('name', {
    type: 'string',
    validate: (x) => x.length >= nameMinLength && x.length <= nameMaxLength,
  })
  ajv.addFormat('hookId', {
    type: 'string',
    validate: (x) => x.length > 0,
  })

  const validate = ajv.compile(bridgedSchema)
  // Map raw errors to the ValidationError shape
  // const rawErrors = validate.errors
  const adaptedErrors: ValidationError[] = validate.errors
    ? validate.errors.map((error) => {
        return {
          field: error.propertyName || ``,
          message: error.message || ``,
        }
      })
    : []

  function adaptedValidator(schema: any) {
    return () => validate(schema)
  }

  adaptedValidator.errors = adaptedErrors

  return adaptedValidator
}
