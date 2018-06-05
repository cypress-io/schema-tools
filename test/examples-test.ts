import test from 'ava'
import {
  assertSchema,
  getExample,
  getSchemaVersions,
  schemaNames,
} from '../src'
import { schemas } from './example-schemas'

const names = schemaNames(schemas)
const getSchemaExample = getExample(schemas)
const assert = assertSchema(schemas)

test('it has several schema names', t => {
  t.true(Array.isArray(names))
  t.true(names.length > 0)
})

test('getExample is curried', t => {
  t.truthy(getExample(schemas, 'Person', '1.0.0'), 'all arguments together')
  t.truthy(
    getExample(schemas)('Person', '1.0.0'),
    'schemas then name and version',
  )
  t.truthy(getExample(schemas)('Person')('1.0.0'), 'curried version')
})

// TODO factor out these functions into API to check that every schema has an example
// function hasVersions(name: string) {}

// function hasExample(name: string) {}

names.forEach((name: string) => {
  const versions = getSchemaVersions(schemas)(name)

  test(`schema ${name} has versions`, t => {
    t.true(Array.isArray(versions))
    t.true(versions.length > 0)
  })

  versions.forEach(version => {
    test(`${name}@${version} has example`, t => {
      const example = getSchemaExample(name)(version)
      t.is(typeof example, 'object')
    })

    test(`${name}@${version} example is valid`, t => {
      t.plan(0)
      const example = getSchemaExample(name)(version)
      if (example) {
        assert(name, version)(example)
      }
    })
  })
})
