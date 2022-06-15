export type AnySchema = NullSchema | BooleanSchema | NullableBooleanSchema | NumberSchema | NullableNumberSchema | StringSchema | NullableStringSchema | AnyEnumSchema | AnyArraySchema | AnyNullableArraySchema | AnyObjectSchema | AnyNullableObjectSchema | AnyAllOptionalObjectSchema | AnyNullableAllOptionalObjectSchema | AnyOneOfSchema
type StringKeys<T> = (keyof T) & string

interface NullSchema { type: 'null' }

interface BooleanSchema { type: 'boolean' }
interface NullableBooleanSchema { type: ('boolean' | 'null')[] }

interface NumberSchema { type: 'number' }
interface NullableNumberSchema { type: ('number' | 'null')[] }

interface StringSchema { type: 'string' }
interface NullableStringSchema { type: ('string' | 'null')[] }

interface AnyEnumSchema extends EnumSchema<any> {}
interface EnumSchema<Enum> { enum: Enum[] }

interface AnyArraySchema extends ArraySchema<AnySchema> {}
interface ArraySchema<ItemSchema extends AnySchema> { type: 'array', items: ItemSchema }

interface AnyNullableArraySchema extends NullableArraySchema<AnySchema> {}
interface NullableArraySchema<ItemSchema extends AnySchema> { type: ('array' | 'null')[], items: ItemSchema }

interface AnyObjectSchema extends ObjectSchema<Record<string, AnySchema>, string> {}
interface ObjectSchema<Properties extends Record<string, AnySchema>, Required extends StringKeys<Properties>> {
  additionalProperties?: boolean
  type: 'object'
  properties: Properties
  required: Required[]
}

export interface AnyNullableObjectSchema extends NullableObjectSchema<Record<string, AnySchema>, string> {}
interface NullableObjectSchema<Properties extends Record<string, AnySchema>, Required extends StringKeys<Properties>> {
  additionalProperties?: boolean
  type: ('object' | 'null')[]
  properties: Properties
  required: Required[]
}

interface AnyAllOptionalObjectSchema extends AllOptionalObjectSchema<Record<string, AnySchema>> {}
interface AllOptionalObjectSchema<Properties extends Record<string, AnySchema>> {
  additionalProperties?: boolean
  type: 'object'
  properties: Properties
}

interface AnyNullableAllOptionalObjectSchema extends NullableAllOptionalObjectSchema<Record<string, AnySchema>> {}
interface NullableAllOptionalObjectSchema<Properties extends Record<string, AnySchema>> {
  additionalProperties?: boolean
  type: ('object' | 'null')[]
  properties: Properties
}

interface AnyOneOfSchema { oneOf: AnySchema[] }

interface ArrayFromSchema<ItemSchema extends AnySchema> extends Array<TypeFromSchema<ItemSchema>> {}

type ObjectFromSchema<Properties extends Record<string, AnySchema>, Required extends StringKeys<Properties>> = {
  [Key in keyof Properties]: (Key extends Required ? TypeFromSchema<Properties[Key]> : TypeFromSchema<Properties[Key]> | undefined)
}

type TypeFromSchema<Schema extends AnySchema> = (
    Schema extends EnumSchema<infer Enum> ? Enum
  : Schema extends NullSchema ? null
  : Schema extends BooleanSchema ? boolean
  : Schema extends NullableBooleanSchema ? (boolean | null)
  : Schema extends NumberSchema ? number
  : Schema extends NullableNumberSchema ? (number | null)
  : Schema extends StringSchema ? string
  : Schema extends NullableStringSchema ? (string | null)
  : Schema extends ArraySchema<infer ItemSchema> ? ArrayFromSchema<ItemSchema>
  : Schema extends NullableArraySchema<infer ItemSchema> ? (ArrayFromSchema<ItemSchema> | null)
  : Schema extends ObjectSchema<infer Properties, infer Required> ? ObjectFromSchema<Properties, Required>
  : Schema extends NullableObjectSchema<infer Properties, infer Required> ? (ObjectFromSchema<Properties, Required> | null)
  : Schema extends AllOptionalObjectSchema<infer Properties> ? ObjectFromSchema<Properties, never>
  : Schema extends NullableAllOptionalObjectSchema<infer Properties> ? (ObjectFromSchema<Properties, never> | null)
  : never
)

declare namespace factory {
    interface ValidationError {
      field: string
      message: string
      value: unknown
      type: string
    }
  }

export interface Validator<Schema extends AnySchema, Output = TypeFromSchema<Schema>> {
    (input: unknown, options?: any): input is Output
    errors: factory.ValidationError[]
    toJSON(): Schema
}
