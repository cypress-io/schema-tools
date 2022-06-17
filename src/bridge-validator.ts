import Ajv from 'ajv'
import addFormats from 'ajv-formats'
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

// type LegacyProperty

export function validator(
  schema: LenientJsonSchema,
  options?: {
    formats?: JsonSchemaFormats
    greedy?: boolean
    schemas?: SchemasOption
  },
): Validator {
  // TODO: Traverse schema and

  // for each LenientJsonSchema level:
  // Grab all properties with `required: true`
  // Add their names to an array
  // Strip `required: true` from the property field
  // Add `required: [<FIELD_NAMES]` at same level as `properties` field

  const requiredFields = [] as string[]
  const strippedProperties = {} as Record<string, any>
  const unmodifiedProperties = {} as Record<string, any>
  if (schema.properties) {
    Object.keys(schema.properties).forEach((property) => {
      if (schema.properties![property].required) {
        requiredFields.push(property)
        const clone = Object.assign({}, schema.properties![property])
        delete clone.required
        strippedProperties[property] = clone
      } else {
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

  // Add built in formats
  addFormats(ajv)
  ajv.addFormat('name', {
    type: 'string',
    // options and formats are already known to be defined by this point
    validate: (x) => x.length > 0,
  })
  ajv.addFormat('hookId', {
    type: 'string',
    // options and formats are already known to be defined by this point
    validate: (x) => x.length > 0,
  })

  const validate = ajv.compile(bridgedSchema) as any
  // Map raw errors to the ValidationError shape
  // const rawErrors = validate.errors
  validate.errors = []

  return validate
}
