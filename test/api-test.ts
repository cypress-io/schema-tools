import test from 'ava'
import * as api from '../src/api'

test('public api', t => {
  const methodNames = Object.keys(api)
  t.snapshot(methodNames)
})
