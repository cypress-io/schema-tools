# @cypress/schema-tools [![CircleCI](https://circleci.com/gh/cypress-io/schema-tools.svg?style=svg&circle-token=aa9b52bab9e9216699ba7258929f727b06b13afe)](https://circleci.com/gh/cypress-io/schema-tools) [![renovate-app badge][renovate-badge]][renovate-app]

> Validate, sanitize and document [JSON schemas][json-schema]

## Motivation

Explicit [JSON schemas][json-schema] describing objects passed around in your system are good!

* they are a living testable documentation instead of manual Wiki editing
* provide examples for tests and integrations
* validate inputs and outputs of the API calls

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
    properties: {
      id: {
        type: 'string,
        format: 'uuid
      }
    }
  },
  example: {
    id: 'a368dbfd-08e4-4698-b9a3-b2b660a11835'
  }
}
// person100 goes into "schemas", then
assertSchema(schemas, formats)('person', '1.0.0')(someObject)
```

## API

* [documentSchemas](#documentSchemas)
* [validate](#validate)
* [assertSchema](#assertSchema)
* [SchemaError](#schemaerror)

TODO describe current API

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

### SchemaError

When asserting an object against a schema a custom error is thrown. It is an instance of `Error`, with a very detailed message. It also has additional properties.

* `errors` is the list of strings with individual validation errors
* `object` the object being validated
* `example` example object for the schema

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
