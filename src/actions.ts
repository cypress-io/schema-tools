import { clone, equals, mergeDeepRight, reject } from 'ramda'
import {
  DefaultValue,
  JsonProperties,
  JsonPropertyTypes,
  ObjectSchema,
} from './objects'
import { normalizeRequiredProperties } from './utils'

//
// different actions that produce new schema from existing one
//

type NewSchemaOptions = {
  schema: ObjectSchema
  title?: string
  description: string
}

type AddPropertyOptions = {
  property: string
  propertyType: JsonPropertyTypes
  propertyFormat: string | null
  exampleValue: any
  isRequired?: boolean
  propertyDescription?: string
  defaultValue?: DefaultValue
  see?: string | ObjectSchema
}

/**
 * Adds a property to another schema, creating a new schema.
 */
const addProperty = (
  from: NewSchemaOptions,
  ...newProperties: AddPropertyOptions[]
) => {
  const newSchema: ObjectSchema = clone(from.schema)
  newSchema.schema.description = from.description
  if (from.title) {
    newSchema.schema.title = from.title
  } else {
    // copying title from previous schema BUT
    // incrementing "minor" version because we are extending schema
    newSchema.version.minor += 1
  }

  if (!newSchema.schema.properties) {
    newSchema.schema.properties = {}
  }

  newProperties.forEach((options: AddPropertyOptions) => {
    const newProperties = newSchema.schema.properties as JsonProperties
    newProperties[options.property] = {
      type: options.propertyType,
    }
    const newProp = newProperties[options.property]

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
  })

  return newSchema
}

const extend = (from: ObjectSchema, schemaObj) => {
  const newSchema: ObjectSchema = mergeDeepRight(clone(from), schemaObj)

  // bump the minor version if it was not given
  if (!equals(schemaObj.version, newSchema.version)) {
    newSchema.version.minor += 1
  }

  normalizeRequiredProperties(newSchema.schema)

  return newSchema
}

export { extend, addProperty }
