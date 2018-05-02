import test from 'ava'
import { bind } from '../src/api'
import { schemas as schemasA, exampleFormats } from './example-schemas'
import { schemas as schemasB } from './other-schemas'

const api = bind(
  { schemas: schemasA, formats: exampleFormats },
  { schemas: schemasB },
)

test('bind api to schemas', t => {
  t.plan(0)
  const person = {
    name: 'Joe',
    age: 20,
  }
  api.assertSchema('person', '1.0.0')(person)
})

test('catches names without capital letter (custom name format)', t => {
  t.plan(1)

  const person = {
    name: 'joe',
    age: 20,
  }
  try {
    api.assertSchema('person', '1.0.0')(person)
  } catch (e) {
    t.deepEqual(e.errors, ['data.name must be name format'])
  }
})

test('assert todo item schema', t => {
  t.plan(0)
  const item = {
    caption: 'Write schemas',
    done: true,
  }
  api.assertSchema('todoItem', '1.0.0')(item)
})
