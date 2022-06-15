import jsonValidator from 'is-my-json-valid'
import { AnyNullableObjectSchema, Validator } from './bridge-validator-types'

export function validator(
  schema: any,
  options?: any,
): Validator<AnyNullableObjectSchema> {
  const bridgedSchema = {
    ...schema,
    properties: schema.properties as Record<string, any>,
    type: ['object'] as ('object' | 'null')[],
  } as AnyNullableObjectSchema

  // TODO: adapt this logic so that it supports the custom (null) fields
  const result = jsonValidator(bridgedSchema, options)

  const newMethod = result
  newMethod.errors = []
  newMethod.toJSON = () => bridgedSchema
  return newMethod
}
