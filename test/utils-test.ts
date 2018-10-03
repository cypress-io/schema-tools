import test from 'ava'
import R from 'ramda'
import { oneOfRegex } from '../src'

const isRegExp = R.is(RegExp)

test('oneOfRegex', t => {
  t.is(typeof oneOfRegex, 'function')
  const r = oneOfRegex('foo', 'bar')
  t.true(isRegExp(r))
  t.true(r.test('foo'))
  t.true(r.test('bar'))
  t.false(r.test('baz'))
  t.false(r.test('Foo'))
  t.false(r.test('FOO'))
  t.snapshot(`generated regex: ${r.toString()}`)
})
