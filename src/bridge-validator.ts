import jsonValidator from 'is-my-json-valid'
import { JsonSchemaFormats } from '.'
import { JsonSchema } from './objects'

type ValidatorFactory = typeof jsonValidator
type Validator = ReturnType<ValidatorFactory>
//schema: JsonSchema, formats?: JsonSchemaFormats, greedy: boolean = true

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

export function validator(
  schema: LenientJsonSchema,
  options?: {
    formats?: JsonSchemaFormats
    greedy?: boolean
    schemas?: SchemasOption
  },
): Validator {
  const bridgedSchema = {
    ...schema,
    properties: schema.properties as Record<string, any>,
    type: ['object'] as ('object' | 'null')[],
  }

  return jsonValidator(bridgedSchema, options)
}
