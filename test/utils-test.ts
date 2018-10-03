import test from 'ava'
import R from 'ramda'
import { oneOfRegex, Semver, stringToSemver } from '../src'

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

test('stringToSemver', t => {
  const r: Semver = stringToSemver('1.2.3')
  t.deepEqual(r, {
    major: 1,
    minor: 2,
    patch: 3,
  })
})
