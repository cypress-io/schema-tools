import quote from 'quote'
import { CustomFormats } from '../formats'
import { checkMark, emptyMark, findUsedColumns } from './utils'

const ticks = quote({ quotes: '`' })

/**
 * Replaces "|" character in code block with unicode pipe symbol
 * @param s
 */
const escapedCode = (s: string) => ticks(s.replace(/\|/g, '`&#124;`'))

export const documentCustomFormats = (formats: CustomFormats) => {
  const headers = [
    'name',
    'regular expression',
    'dynamic',
    'example',
    'default',
  ]
  const rows = Object.keys(formats).map(name => {
    const format = formats[name]
    const formatName = format.name
    const r = format.detect.toString()
    const escaped = escapedCode(r)
    const dynamic = 'defaultValue' in format ? checkMark : emptyMark
    const example =
      'example' in format
        ? escapedCode(JSON.stringify(format.example))
        : emptyMark
    const defaultValue =
      'defaultValue' in format
        ? ticks(JSON.stringify(format.defaultValue))
        : emptyMark

    return {
      name: formatName,
      'regular expression': escaped,
      dynamic,
      default: defaultValue,
      example,
    }
  })
  const usedHeaders = findUsedColumns(headers, rows)

  return [
    { h2: 'formats' },
    { p: 'Custom formats defined to better represent our data.' },
    {
      table: {
        headers: usedHeaders,
        rows,
      },
    },
  ]
}
