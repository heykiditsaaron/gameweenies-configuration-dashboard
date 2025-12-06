// /schemas/core/validator/tests/sampleErrors.test.ts

import { validateModuleSchema, JsonSchema, ValidationResultInvalid } from '../index';

// Minimal schema-format (fake) used for illustrating invalid cases
const minimalSchemaFormat: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    version: { type: 'string' },
    fields: { type: 'object' }
  },
  required: ['id', 'version', 'fields']
};

const invalidModuleSchema = {
  id: 123,
  fields: {
    noTypeField: { description: 42 },
    badField: {
      type: 'potato',
      default: 10,
      validation: {
        regex: '[unclosed',
        min: 'low',
        max: 5,
        required: 'yes'
      },
      ui: { component: { not: 'primitive' } }
    },
    brokenEnum: {
      type: 'enum',
      options: [],
      default: 'missing'
    },
    listWithoutItems: {
      type: 'array',
      default: 'not-an-array'
    },
    nestedObject: {
      type: 'object',
      fields: {
        inner: {
          type: 'string',
          default: 999
        }
      }
    }
  }
};

function runTest(): void {
  const result = validateModuleSchema(invalidModuleSchema, minimalSchemaFormat);

  if (result.status === 'valid') {
    console.log('❌ sampleErrors: expected INVALID but got VALID');
    return;
  }

  const invalid = result as ValidationResultInvalid;

  console.log('✅ sampleErrors: invalid schema correctly detected. Errors:');
  for (const err of invalid.errors) console.log(' -', err);
}

runTest();
