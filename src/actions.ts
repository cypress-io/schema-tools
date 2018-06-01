import cloneDeep from 'lodash.clonedeep'
import { JsonPropertyTypes, ObjectSchema } from './objects'

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
  see?: string
}

/**
 * Adds a property to another schema, creating a new schema.
 */
export const addProperty = (options: AddPropertyOptions) => {
  const newSchema: ObjectSchema = cloneDeep(options.schema)
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

  if (options.isRequired) {
    if (!newSchema.schema.required) {
      newSchema.schema.required = []
    }
    if (Array.isArray(newSchema.schema.required)) {
      newSchema.schema.required.push(options.property)
    }
  }

  if (options.propertyDescription) {
    newProp.description = options.propertyDescription
  }

  if (options.see) {
    newProp.see = options.see
  }

  newSchema.example[options.property] = cloneDeep(options.exampleValue)
  return newSchema
}
