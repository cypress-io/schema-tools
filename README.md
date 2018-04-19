# @cypress/schema-tools [![CircleCI](https://circleci.com/gh/cypress-io/schema-tools.svg?style=svg&circle-token=aa9b52bab9e9216699ba7258929f727b06b13afe)](https://circleci.com/gh/cypress-io/schema-tools) [![renovate-app badge][renovate-badge]][renovate-app]

> Validate, sanitize and document JSON schemas

## Motivation

Explicit JSON schemas describing objects passed around in your system are good!

* they are a living testable documentation instead of manual Wiki editing
* provide examples for tests and integrations
* validate inputs and outputs of the API calls

## Schemas

Each individual schema object should have 3 parts: a version, an example and a JSON schema describing its properties. See [test/example-schemas.ts](test/example-schemas.ts). Start with a single `ObjectSchema` that describes a particular version of an object

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
const personVersions: VersionedSchema = versionSchemas(person100)
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

TODO describe custom formats that can extend the JSON schema built-in ones

## API

* [documentSchemas](#documentSchemas)

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
