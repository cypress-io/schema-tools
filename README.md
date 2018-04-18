# @cypress/schema-tools [![CircleCI](https://circleci.com/gh/cypress-io/schema-tools.svg?style=svg&circle-token=aa9b52bab9e9216699ba7258929f727b06b13afe)](https://circleci.com/gh/cypress-io/schema-tools)

> Validate, sanitize and document JSON schemas

## Motivation

Explicit JSON schemas describing objects passed in your system are good.

* they are a living testable documentation instead of manual Wiki editing
* provide examples for tests and integrations
* validate inputs and outputs of the API calls

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
