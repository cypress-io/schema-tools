# @cypress/schema-tools

> Validate, sanitize and document JSON schemas

## Motivation

* living testable documentation instead of manual Wiki editing
* source of examples for tests and integrations
* validating input and outputs from API calls

## API

TODO describe current API

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
