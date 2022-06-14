import jsonValidator, { ValidationError } from 'is-my-json-valid'
import { AnyNullableObjectSchema, AnySchema, Validator } from './bridge-validator-types';
import { JsonSchemaFormats } from './formats';
import { JsonSchema } from './objects';

export function validator(
    schema: JsonSchema,
    formats?: JsonSchemaFormats,
    greedy: boolean = true,
) {

    const bridgedSchema = {
        ...schema,
        properties: schema.properties as Record<string, any>,
        type: ['object'] as ("object" | "null")[]
    } as AnyNullableObjectSchema

    const validate = jsonValidator(bridgedSchema, { formats, greedy })

    return (object: object): Validator<AnyNullableObjectSchema> => {
        return {
            errors: [] as ValidationError[],
            toJSON: () => { return bridgedSchema }
        }
    }

}
