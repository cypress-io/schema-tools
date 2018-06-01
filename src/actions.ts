import { clone, equals, reject } from 'ramda'
import { JsonPropertyTypes, ObjectSchema } from './objects'
import { normalizeRequiredProperties } from './utils'

//
// different actions that produce new schema from existing one
//

type AddPropertyOptions = {
  schema: ObjectSchema
  title?: string
  description: string
  property: string
  propertyType: JsonPropertyTypes
  propertyFormat: string | null
  exampleValue: any
  isRequired?: boolean
  propertyDescription?: string
  see?: string | ObjectSchema
}

/**
 * Adds a property to another schema, creating a new schema.
 */
export const addProperty = (options: AddPropertyOptions) => {
  const newSchema: ObjectSchema = clone(options.schema)
  newSchema.schema.description = options.description
  if (options.title) {
    newSchema.schema.title = options.title
  } else {
    // copying title from previous schema BUT
    // incrementing "minor" version because we are extending schema
    newSchema.version.minor += 1
  }

  if (!newSchema.schema.properties) {
    newSchema.schema.properties = {}
  }

  newSchema.schema.properties[options.property] = {
    type: options.propertyType,
  }
  const newProp = newSchema.schema.properties[options.property]

  // refine new property
  if (options.propertyFormat) {
    newProp.format = options.propertyFormat
  }

  normalizeRequiredProperties(newSchema.schema)
  // now newSchema.schema.required is string[]
  const required: string[] = newSchema.schema.required as string[]

  if (options.isRequired) {
    required.push(options.property)
  } else {
    newSchema.schema.required = reject(equals(options.property), required)
  }

  if (options.propertyDescription) {
    newProp.description = options.propertyDescription
  }

  if (options.see) {
    newProp.see = options.see
  }

  newSchema.example[options.property] = clone(options.exampleValue)
  return newSchema
}
