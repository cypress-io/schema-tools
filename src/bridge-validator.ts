import jsonValidator from 'is-my-json-valid'
import { AnyNullableObjectSchema, Validator } from './bridge-validator-types'
import { JsonSchema } from './objects'

export function validator(
  schema: JsonSchema,
  options?: any,
): Validator<AnyNullableObjectSchema> {
  const bridgedSchema = {
    ...schema,
    properties: schema.properties as Record<string, any>,
    type: ['object'] as ('object' | 'null')[],
  } as AnyNullableObjectSchema

  const result = jsonValidator(bridgedSchema, options)

  const newMethod = result
  newMethod.errors = []
  newMethod.toJSON = () => bridgedSchema
  return newMethod
}
