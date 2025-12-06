// /schemas/core/validator/types.ts

// -----------------------------------------------------------
// This file defines common types used by the schema validator.
// -----------------------------------------------------------

// 1. JSON primitive value type.
export type JsonPrimitive = string | number | boolean | null;

// 2. JSON object type (recursive).
export interface JsonObject {
  // Any string key mapped to a JSON value.
  [key: string]: JsonValue;
}

// 3. JSON array type (recursive).
export interface JsonArray extends Array<JsonValue> {}

// 4. JSON value type (string, number, boolean, null, object, array).
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// 5. Validation result when schema is valid.
export interface ValidationResultValid {
  status: 'valid';
}

// 6. Validation result when schema is invalid.
export interface ValidationResultInvalid {
  status: 'invalid';
  // Each error is a human-readable message like:
  // "fields.title.default: default value must be a string"
  errors: string[];
}

// 7. Union type for validation result.
export type ValidationResult = ValidationResultValid | ValidationResultInvalid;

// 8. Minimal JSON Schema type used by the generic validator.
//    NOTE: This is intentionally partial – we only include the
//    keywords we actually use in our MVP validator.
export interface JsonSchema {
  // The JSON type(s) allowed by this schema (e.g., "object", "string").
  type?: string | string[];

  // Object properties specification.
  properties?: {
    [key: string]: JsonSchema;
  };

  // Required property names for objects.
  required?: string[];

  // Items schema for arrays.
  items?: JsonSchema;

  // Enumeration of allowed values.
  enum?: JsonValue[];

  // String pattern (as a regular expression string).
  pattern?: string;

  // Numeric constraints.
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;

  // String length constraints.
  minLength?: number;
  maxLength?: number;

  // Array length constraints.
  minItems?: number;
  maxItems?: number;

  // Description text (not validated semantically here, only type).
  description?: string;

  // Default value (we only type-check it via domain logic).
  default?: JsonValue;

  // Control for properties not listed in "properties".
  // - If boolean, true = allowed, false = disallowed.
  // - If JsonSchema, additional properties must match the schema.
  additionalProperties?: boolean | JsonSchema;

  // Allow any extra keywords without TypeScript errors.
  // This keeps the validator tolerant of additions to schema-format.json.
  [keyword: string]: any;
}
