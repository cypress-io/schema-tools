import test from 'ava'
import * as methods from '../src/api'

test('public api', t => {
  const methodNames = Object.keys(methods)
  t.snapshot(methodNames)
})
