import cloneDeep from 'lodash.clonedeep'
import { JsonPropertyTypes, ObjectSchema } from './objects'

//
// different actions that produce new schema from existing one
//

/**
 * Adds a property to another schema, creating a new schema.
 */
export const addProperty = (
  objectSchema: ObjectSchema,
  title: string,
  description: string,
  property: string,
  propertyType: JsonPropertyTypes,
  propertyFormat: string | null,
  exampleValue: any,
  isRequired?: boolean,
  propertyDescription?: string,
  see?: string,
) => {
  const newSchema: ObjectSchema = cloneDeep(objectSchema)
  newSchema.schema.description = description
  newSchema.schema.title = title

  if (!newSchema.schema.properties) {
    newSchema.schema.properties = {}
  }

  newSchema.schema.properties[property] = {
    type: propertyType,
  }
  const newProp = newSchema.schema.properties[property]

  // refine new property
  if (propertyFormat) {
    newProp.format = propertyFormat
  }

  if (isRequired) {
    if (!newSchema.schema.required) {
      newSchema.schema.required = []
    }
    if (Array.isArray(newSchema.schema.required)) {
      newSchema.schema.required.push(property)
    }
  }

  if (propertyDescription) {
    newProp.description = propertyDescription
  }

  if (see) {
    newProp.see = see
  }

  newSchema.example[property] = cloneDeep(exampleValue)
  return newSchema
}
