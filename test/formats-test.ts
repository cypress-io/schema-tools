import { getDefaults, CustomFormats, CustomFormat } from '../src/formats'
import test from 'ava'

test('defaults by name', t => {
  const bar: CustomFormat = {
    name: 'bar',
    detect: /bar/,
    description: 'custom format named "bar"',
    defaultValue: 'my-value',
  }
  const formats: CustomFormats = {
    foo: bar,
  }
  const defaults = getDefaults(formats)
  t.is(defaults.foo, undefined, 'no default under key foo')
  t.is(defaults.bar, bar.defaultValue, 'but there is one under name bar')
})
