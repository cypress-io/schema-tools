import * as sanitizers from './sanitize'
import * as api from './api'

// TODO is there a better way to export all API methods?
// in our case we need to expose methods that expect schemas first
// and the rest of methods are probably ok as is
export const normalizeName = api.normalizeName
export const getObjectSchema = api.getObjectSchema
export const schemaNames = api.schemaNames
export const getSchemaVersions = api.getSchemaVersions
export const getExample = api.getExample
export const validate = api.validate
export const assertSchema = api.assertSchema
export const assertBySchema = api.assertBySchema
export const validateBySchema = api.validateBySchema

export const sanitize = sanitizers.sanitize
export const sanitizeBySchema = sanitizers.sanitizeBySchema
