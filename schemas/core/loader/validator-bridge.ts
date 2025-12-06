// /schemas/core/loader/validator-bridge.ts
// ------------------------------------------------------
// Bridge between the Module Loader and the Phase 2 schema validator.
// Normalizes the validator output into SchemaValidationResult.
// ------------------------------------------------------

import { SchemaValidationResult } from "./types";
import { validateModuleSchema } from "../validator";   // Correct entrypoint
import schemaFormat from "../schema-format.json";      // Correct path

export function runSchemaValidation(rawSchema: unknown): SchemaValidationResult {
  try {
    // Correct call signature:
    // validateModuleSchema(moduleSchema, schemaFormat)
    const result: any = validateModuleSchema(rawSchema as any, schemaFormat as any);

    const isValid = result?.status === "valid";
    const errors = Array.isArray(result?.errors) ? result.errors : [];

    // Pick a normalized schema if provided by validator
    const validatedSchema =
      isValid
        ? result.validatedSchema ??
          result.schema ??
          result.normalizedSchema ??
          rawSchema
        : null;

    return {
      isValid,
      errors,
      validatedSchema,
      originalResult: result,
    };
  } catch (err: any) {
    return {
      isValid: false,
      errors: [
        {
          message:
            "Schema validator threw an error: " +
            (err?.message ?? String(err)),
        },
      ],
      validatedSchema: null,
    };
  }
}
