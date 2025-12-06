// /schemas/core/validator/tests/mockmod.test.ts

import { validateModuleSchema, JsonSchema, ValidationResultInvalid } from '../index';

// NOTE: Requires resolveJsonModule in tsconfig.json
import schemaFormatJson from '../../schema-format.json';
import mockmodSchemaJson from '../../../../modules/mockmod/schema.json';

const schemaFormat = schemaFormatJson as JsonSchema;
const mockmodSchema = mockmodSchemaJson as unknown;

// Run test
function runTest(): void {
  const result = validateModuleSchema(mockmodSchema, schemaFormat);

  if (result.status === 'valid') {
    console.log('✅ mockmod schema is VALID according to GCD rules.');
    return;
  }

  const invalid = result as ValidationResultInvalid;
  console.log('❌ mockmod schema is INVALID. Errors:');
  for (const err of invalid.errors) console.log(' -', err);
}

runTest();
