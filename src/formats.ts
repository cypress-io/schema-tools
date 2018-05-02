/**
 * Describes our custom formats like "uuid" and "projectId"
 */
export type CustomFormat = {
  name: string
  description: string
  detect: RegExp
  /**
   * If the value is highly dynamic, here is its replacement for sanitize
   *
   * @type {(string | number)}
   */
  defaultValue?: string | number
  example?: string | number
}

/**
 * A collection of custom formats by name
 */
export type CustomFormats = {
  [key: string]: CustomFormat
}

/**
 * Collection of regular expressions to use to validate custom formats
 */
export type JsonSchemaFormats = {
  [key: string]: RegExp
}

/**
 * Returns object of regular expressions used to detect custom formats
 */
export const detectors = (formats: CustomFormats) => {
  const result: JsonSchemaFormats = {}
  Object.keys(formats).forEach(name => {
    result[name] = formats[name].detect
  })
  return result
}

/**
 * Strips out leading and trailing "/" characters so that regular expression
 * can be used as a string key in "patternProperties" in JSON schema
 * @param r Regular express
 * @example regexAsPatternKey(formats.uuid)
 */
export const regexAsPatternKey = (r: RegExp): string => {
  const s = r.toString()
  // something like /^....$/
  // remove first and last "/" characters
  const middle = s.substr(1, s.length - 2)
  return middle
}

/**
 * An object with default values for custom properties
 */
export type FormatDefaults = {
  [key: string]: string | number
}

/**
 * Given an object of custom formats returns all default values (if any)
 */
export const getDefaults = (formats: CustomFormats) => {
  const result: FormatDefaults = {}
  Object.keys(formats).forEach(key => {
    const format: CustomFormat = formats[key]
    if (typeof format.defaultValue !== 'undefined') {
      // store values under name, not under original key
      result[format.name] = format.defaultValue
    }
  })
  return result
}
