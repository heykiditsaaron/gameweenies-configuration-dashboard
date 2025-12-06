# GCD Schema Validator (MVP)

This folder contains the minimal schema validator for GameWeenies Configuration Dashboard (GCD), implemented in Phase 2 Task 2.

The validator checks:
- Field types  
- Required keys  
- Nested objects  
- Arrays  
- Enums  
- Validation rules (regex, min/max, required)  
- Defaults  
- Description / help text  
- UI hints  

It validates a module schema (e.g., `/modules/mockmod/schema.json`) against the canonical GCD schema-format:

`/schemas/core/schema-format.json`

---

## Running the Validator Manually

### 1. Ensure TypeScript can import JSON
Add to tsconfig.json:

```
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

---

### 2. Run any test manually

```
ts-node schemas/core/validator/tests/mockmod.test.ts
```

Or compiled:

```
node dist/schemas/core/validator/tests/mockmod.test.js
```

---

### 3. Test with provided sample data

Use:

```
/schemas/core/validator/test-data/valid/sample-valid.json
/schemas/core/validator/test-data/invalid/sample-invalid.json
```

Example:

```ts
import { validateModuleSchema } from '../index';
import schemaFormat from '../../schema-format.json';
import sampleValid from '../test-data/valid/sample-valid.json';
import sampleInvalid from '../test-data/invalid/sample-invalid.json';

console.log(validateModuleSchema(sampleValid, schemaFormat));
console.log(validateModuleSchema(sampleInvalid, schemaFormat));
```

---

## Folder Structure

```
validator/
  ├── index.ts
  ├── types.ts
  ├── errors.ts
  ├── validateSchema.ts
  ├── README.md
  ├── tests/
  │     ├── mockmod.test.ts
  │     └── sampleErrors.test.ts
  └── test-data/
        ├── valid/
        │     └── sample-valid.json
        └── invalid/
              └── sample-invalid.json
```
ℹ Notes

These tests intentionally do not use Jest, Vitest, or any test framework yet.

Later phases will integrate automated test runners and CI workflows.