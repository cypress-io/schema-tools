import jsonValidator from 'is-my-json-valid'
import { AnyNullableObjectSchema, Validator } from './bridge-validator-types'
import { JsonSchemaFormats } from './formats'
import { JsonSchema } from './objects'

export function validator(
  schema: JsonSchema,
  formats?: JsonSchemaFormats,
  greedy: boolean = true,
  schemas?: any,
): Validator<AnyNullableObjectSchema> {
  const bridgedSchema = {
    ...schema,
    properties: schema.properties as Record<string, any>,
    type: ['object'] as ('object' | 'null')[],
  } as AnyNullableObjectSchema

  return jsonValidator(bridgedSchema, { formats, greedy, schemas })
}
