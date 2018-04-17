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

// TODO needs documentation
export type CustomFormats = {
  [key: string]: CustomFormat
}

// TODO needs documentation
export type JsonSchemaFormats = {
  [key: string]: RegExp
}

// TODO needs documentation
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

// TODO needs documentation
export type FormatDefaults = {
  [key: string]: string | number
}

// TODO needs documentation
export const getDefaults = (formats: CustomFormats) => {
  const result: FormatDefaults = {}
  Object.keys(formats).forEach(key => {
    const format: CustomFormat = formats[key]
    if (typeof format.defaultValue !== 'undefined') {
      result[key] = format.defaultValue
    }
  })
  return result
}
