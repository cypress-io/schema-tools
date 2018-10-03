# @cypress/schema-tools [![CircleCI](https://circleci.com/gh/cypress-io/schema-tools.svg?style=svg&circle-token=aa9b52bab9e9216699ba7258929f727b06b13afe)](https://circleci.com/gh/cypress-io/schema-tools) [![renovate-app badge][renovate-badge]][renovate-app]

> Validate, sanitize and document [JSON schemas][json-schema]

## Motivation

Explicit [JSON schemas][json-schema] describing objects passed around in your system are good!

- they are a living testable documentation instead of manual Wiki editing
- provide examples for tests and integrations
- validate inputs and outputs of the API calls

## TOC

- [Schemas](#schemas)
- [Formats](#formats)
- [API](#api)
- [Debugging](#debugging), [testing](#testing) and [license](#license)

## Schemas

Each individual schema object should have 3 parts: a version, an example and a [JSON schema][json-schema] describing its properties. See [test/example-schemas.ts](test/example-schemas.ts). Start with a single `ObjectSchema` that describes a particular version of an object

```typescript
import { ObjectSchema } from '@cypress/schema-tools'
const person100: ObjectSchema = {
  // has semantic version numbers
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  // JSON schema
  schema: {
    type: 'object',
    title: 'Person',
    description: 'An example schema describing a person',
    properties: {
      name: {
        type: 'string',
        format: 'name',
        description: 'this person needs a name',
      },
      age: {
        type: 'integer',
        minimum: 0,
        description: 'Age in years',
      },
    },
    required: ['name', 'age'],
    // note: you can just use required: true to require all properties
  },
  // has typical example
  example: {
    name: 'Joe',
    age: 10,
  },
}
```

You can have multiple separate versions of the "Person" schema, and then combine them into single object.

```typescript
import {ObjectSchema, VersionedSchema, versionSchemas} from '@cypress/schema-tools'
const person100: ObjectSchema = { ... }
// maybe added another property
const person110: ObjectSchema = { ... }
// some big changes
const person200: ObjectSchema = { ... }
const personVersions: VersionedSchema = versionSchemas(person100, person110, person200)
```

Finally, you probably have "Person" versioned schema, and maybe "Organization" and maybe some other schemas. So put them into a single collection

```typescript
import { SchemaCollection, combineSchemas } from '@cypress/schema-tools'
export const schemas: SchemaCollection = combineSchemas(
  personVersions,
  organizationVersions,
)
```

Now you can use the `schemas` object to validate and sanitize any object.

## Formats

In addition to the [formats included with JSON-schemas](https://spacetelescope.github.io/understanding-json-schema/reference/string.html#built-in-formats) you can define custom formats that will be used to validate values. Start with a single custom format to describe an UUID for example

```typescript
// single custom format
import { CustomFormat, CustomFormats } from '@cypress/schema-tools'
const uuid: CustomFormat = {
  name: 'uuid', // the name
  description: 'GUID used through the system',
  // regular expression to use to validate value
  detect: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  // (optional) replace actual value with this default value
  // when using to sanitize an object
  defaultValue: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
}
// export all custom formats, in our case just 1
export const formats: CustomFormats = { uuid }
```

Now every time you use your schemas, pass the formats too so that the validator knows how to check values from custom formats.

```typescript
// example JSON schema using uuid custom format
const employee100: ObjectSchema = {
  // has semantic version numbers
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  // JSON schema
  schema: {
    type: 'object',
    title: 'Employee',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
    },
  },
  example: {
    id: 'a368dbfd-08e4-4698-b9a3-b2b660a11835',
  },
}
// employee100 goes into "schemas", then
assertSchema(schemas, formats)('Employee', '1.0.0')(someObject)
```

## API

- [hasSchema](#hasschema)
- [documentSchemas](#documentschemas)
- [validate](#validate)
- [assertSchema](#assertschema)
- [trim](#trim)
- [fill](#fill)
- [sanitize](#sanitize)
- [bind](#bind)
- [SchemaError](#schemaerror)
- [addProperty](#addproperty)
- [extend](#extend)
- [oneOfRegex](#oneofregex)

### hasSchema

Returns `true` if the given schema exists in the collection. Curried function.

```typescript
import { hasSchema } from '@cypress/schema-tools'
import { schemas } from './schemas'
hasSchema(schemas, 'Name', '1.0.0') // true
hasSchema(schemas)('FooBarBaz')('1.0.0') // false
```

### documentSchemas

You can document your schemas using provided method. Example code file

```typescript
import { documentSchemas } from '@cypress/schema-tools'
import { schemas } from './schemas'
import { formats } from './formats'
console.log(documentSchemas(schemas, formats))
```

Call it from your NPM scripts

```json
{
  "scripts": {
    "document": "ts-node ./document.ts > schemas.md"
  },
  "devDependencies": {
    "ts-node": "5.0.1",
    "typescript": "2.8.1"
  }
}
```

If you want to tell where a schema is coming from, you can set package name, which will add a note to the output Markdown

```typescript
import { setPackageName, documentSchemas } from '@cypress/schema-tools'
import { schemas } from './schemas'
setPackageName(schemas, 'my-schemas')
console.log(documentSchemas(schemas, formats))
// each schema will have a note that it was defined in "my-schemas"
```

### validate

Checks a given object against a schema and returns list of errors if the object does not pass the schema. Returns `true` if the object passes schema, and a list of strings if there are errors (I know, we should use [Either or Validation](http://folktale.origamitower.com/api/v2.1.0/en/folktale.validation.html)).

```ts
import { validate } from '@cypress/schema-tools'
// see example in ./test/example-schemas.ts
import { schemas } from './my-schemas'
import { formats } from './my-formats'
const validatePerson100 = validate(schemas, formats)('person', '1.0.0')
const result = validatePerson100(someObject)
if (result === true) {
  // all good
} else {
  const errorMessage = result.join('\n')
  console.error(errorMessage)
}
```

Typical validation messages are

```
data.createdAt is required
data.createdAt must be date-time format
```

To stop after finding initial set of errors, pass `greedy = false` flag

```js
const validatePerson100 = validate(schemas, formats, false)('person', '1.0.0')
```

### assertSchema

Checks a given object against schemas (and formats) and throws a [SchemaError](#schemaerror) if the object violates the given schema.

```js
try {
  assertSchema(schemas, formats)('Person', '1.0.0')(object)
} catch (e) {
  console.error(e.message)
  // can also inspect individual fields, see SchemaError
}
```

You can substitute some fields from example object to help with dynamic data. For example, to avoid breaking on invalid `id` value, we can tell `assertSchema` to use `id` value from the example object.

```js
const o = {
  name: 'Mary',
  age: -1,
}
assertSchema(schemas, formats)('Person', '1.0.0', {
  substitutions: ['age'],
})(o)
// everything is good, because the actual object asserted was
// {name: 'Mary', age: 10}
```

You can also limit the error message and omit some properties. Typically the error message with include list of errors, current and example objects, which might create a wall of text. To omit `object` and `example` but leave other fields when forming error message use

```js
const o = {
  name: 'Mary',
  age: -1,
}
assertSchema(schemas, formats)('Person', '1.0.0', {
  omit: {
    object: true,
    example: true,
  },
})(o)
// Error message is much much shorter, only "errors" and label will be there
```

By default the json schema check is [greedy](https://github.com/mafintosh/is-my-json-valid#greedy-mode-tries-to-validate-as-much-as-possible) but you can limit it via an option

```js
assertSchema(schemas, formats)('Person', '1.0.0', { greedy: false })
```

### trim

Often you have an object that has _more_ properties than the schema allows. For example if you have new result that should go to "older" clients, you might want to `trim` the result object and then assert schema.

```js
import { trim } from '@cypress/schema-tools'
const trimPerson = trim(schemas, 'Person', '1.0.0')
const person = ... // some result with lots of properties
const trimmed = trimPerson(person)
// trimmed should be valid Person 1.0.0 object
// if the values are actually matching Person@1.0.0
// all extra properties should have been removed
```

### fill

The opposite of `trim`. Tries to fill missing object properties with explicit default values from the schema. See [test/fill-test.ts](test/fill-test.ts) for example.

### sanitize

If you schema has dynamic data, like timestamps or uuids, it is impossible to compare objects without first deleting some fields, breaking the schema. To solve this you can mark some properties with format and if that format has a default value, you can replace all dynamic values with default ones.

In the example below the `name` property has format called `name` like this

```js
name: {
  type: 'string',
  format: 'name'
}
```

Now we can sanitize any object which will replace `name` value with default value, but will keep other properties unchanged.

```js
import { sanitize, getDefaults } from '@cypress/schema-tools'
const name: CustomFormat = {
  name: 'name',
  description: 'Custom name format',
  detect: /^[A-Z][a-z]+$/,
  defaultValue: 'Buddy',
}
const exampleFormats: CustomFormats = {
  name,
}
const formatDefaults = getDefaults(exampleFormats)
const object = {
  name: 'joe',
  age: 21,
}
const sanitizePerson = sanitize(schemas, formatDefaults)('person', '1.0.0')
// now pass any object with dynamic "name" property
const result = sanitizePerson(object)
// result is {name: 'Buddy', age: 21}
```

For another example see [test/sanitize-test.ts](test/sanitize-test.ts)

### bind

There are multiple methods to validate, assert or sanitize an object against a schema. All take schemas and (optional) formats. But a project using schema tools probably has a single collection of schemas that it wants to use again and again. The `bind` method makes it easy to bind the first argument in each function to a schema collection and just call methods with an object later.

```js
import { schemas } from './my-schemas'
import { formats } from './my-formats'
import { bind } from '@cypress/schema-tools'
const api = bind({ schemas, formats })
api.assertSchema('name', '1.0.0')(someObject)
```

See [test/bind-test.ts](test/bind-test.ts) for examples

### SchemaError

When asserting an object against a schema a custom error is thrown. It is an instance of `Error`, with a very detailed message. It also has additional properties.

- `errors` is the list of strings with individual validation errors
- `object` the object being validated
- `example` example object for the schema
- `schemaName` is the title of the schema, like `Person`
- `schemaVersion` the version like `1.0.0` of the schema violated, if known.

### addProperty

You can easily extend existing schema using included `addProperty` function. See [src/actions.ts](src/actions.ts) and [test/add-property-test.ts](test/add-property-test.ts) for examples.

### extend

Rather than add a single property at a time, you can simply use `extend(existingSchema, newSchemaObj)`.

The `existingSchema` will be deep cloned and have the `newSchemaObj` properties merged in.

If `newSchemaObj.version` is not provided, then the previous schema's semver `minor` property will be bumped by one.

Fields like `required` are automatically unioned.

See [src/actions.ts](src/actions.ts) and [test/extend-schema-test.ts](test/extend-schema-test.ts) for examples.

### oneOfRegex

A little utility function to create a regular expression to match only the given strings.

```js
import { oneOfRegex } from '@cypress/schema-tools'
const r = oneOfRegex('foo', 'bar')
r.test('foo') // true
r.test('bar') // true
r.toString() // "/^(foo|bar)$/"
```

## Debugging

To see log messages from this module, run with `DEBUG=schema-tools`

## Testing

Uses [ava-ts](https://github.com/andywer/ava-ts#readme) to run Ava test runner directly against TypeScript test files. Use `npm t` to build and test everything in the `test` folder.

To run a single test file, use command

```
npx ava-ts test/<file-name.ts>
```

To update snapshots and use verbose reporter (prints test names)

```
npx ava-ts test/<file-name.ts> --verbose -u
```

## License

This project is licensed under the terms of the [MIT license](LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
[json-schema]: http://json-schema.org/
