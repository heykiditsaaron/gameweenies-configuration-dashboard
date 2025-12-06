// /schemas/core/validator/index.ts

// -----------------------------------------------------------
// Entry point for the schema validator.
//
// This file simply re-exports the public API used by callers.
// -----------------------------------------------------------

export { validateModuleSchema } from './validateSchema';
export type {
  JsonPrimitive,
  JsonObject,
  JsonArray,
  JsonValue,
  JsonSchema,
  ValidationResult,
  ValidationResultValid,
  ValidationResultInvalid,
} from './types';
