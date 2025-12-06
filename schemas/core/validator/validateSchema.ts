// /schemas/core/validator/validateSchema.ts

// -----------------------------------------------------------
// This file contains the main validation logic.
// It has TWO layers:
//
// 1) Generic JSON Schema-style validation
//    - Uses /schemas/core/schema-format.json as a meta-schema.
//
// 2) Domain-specific GCD module schema validation
//    - Checks things like:
//      * field types
//      * required keys (id, version, fields)
//      * nested objects / arrays
//      * enums
//      * validation rules (regex, min/max, required)
//      * defaults
//      * description/help text
//      * UI hints
//
// NOTE:
// - This file does NOT perform any file I/O.
// - The caller must pass in the already-loaded schema-format JSON.
// -----------------------------------------------------------

import { ErrorCollector, joinPath } from './errors';
import { JsonSchema, ValidationResult, JsonValue, JsonObject } from './types';

// -----------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------

/**
 * Validate a module schema object against:
 *  1) The provided schema-format JSON schema (generic structure)
 *  2) Domain-specific GCD rules for fields, enums, defaults, etc.
 *
 * @param moduleSchema - The module schema to validate (e.g., /modules/mockmod/schema.json parsed as JS object).
 * @param schemaFormat - The GCD schema format meta-schema (e.g., /schemas/core/schema-format.json parsed as JS object).
 * @returns ValidationResult - { status: 'valid' } or { status: 'invalid', errors: [...] }.
 */
export function validateModuleSchema(
  moduleSchema: unknown,
  schemaFormat: JsonSchema
): ValidationResult {
  // 1. Create an error collector.
  const errors = new ErrorCollector();

  // 2. Run generic JSON Schema-style validation.
  validateAgainstJsonSchema(moduleSchema as JsonValue, schemaFormat, '', errors);

  // 3. Run domain-specific GCD validation logic.
  validateDomainSpecificModuleSchema(moduleSchema, errors);

  // 4. Return final result.
  return errors.toValidationResult();
}

// -----------------------------------------------------------
// GENERIC JSON-SCHEMA STYLE VALIDATION
// -----------------------------------------------------------

/**
 * Recursively validate a value against a JsonSchema.
 *
 * This is a minimal subset of JSON Schema, supporting:
 *  - type
 *  - properties / required
 *  - items
 *  - enum
 *  - pattern
 *  - minimum / maximum / exclusiveMinimum / exclusiveMaximum
 *  - minLength / maxLength
 *  - minItems / maxItems
 *  - additionalProperties (boolean or schema)
 *
 * @param value - The value to validate.
 * @param schema - The schema constraints.
 * @param path - A string representing where we are in the object tree.
 * @param errors - Collector for validation errors.
 */
function validateAgainstJsonSchema(
  value: JsonValue,
  schema: JsonSchema,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: Validate "type" constraint.
  if (schema.type !== undefined) {
    // Normalize type to an array for simpler checks.
    const allowedTypes = Array.isArray(schema.type)
      ? schema.type
      : [schema.type];

    const actualType = inferJsonType(value);

    if (!allowedTypes.includes(actualType)) {
      errors.add(
        path,
        `type mismatch: expected ${allowedTypes.join(
          ' | '
        )}, got ${actualType}`
      );
      // If type is wrong, we stop validating this node to avoid noisy errors.
      return;
    }
  }

  // Step 2: Validate "enum" constraint.
  if (schema.enum) {
    const isAllowed = schema.enum.some((enumValue) =>
      deepEqual(enumValue, value)
    );
    if (!isAllowed) {
      errors.add(path, `value is not in enum: ${JSON.stringify(schema.enum)}`);
      // We can continue, but usually enum is final; still, the rest might catch other issues.
    }
  }

  // Step 3: Type-specific constraints.
  const inferredType = inferJsonType(value);

  // 3a. If value is a string, validate string-related constraints.
  if (inferredType === 'string') {
    validateStringNode(value as string, schema, path, errors);
  }

  // 3b. If value is a number, validate number-related constraints.
  if (inferredType === 'number' || inferredType === 'integer') {
    validateNumberNode(value as number, schema, path, errors);
  }

  // 3c. If value is an array, validate array-related constraints and items.
  if (inferredType === 'array') {
    validateArrayNode(value as JsonValue[], schema, path, errors);
  }

  // 3d. If value is an object, validate properties and required keys.
  if (inferredType === 'object') {
    validateObjectNode(value as JsonObject, schema, path, errors);
  }

  // Note: For boolean and null, there are no extra constraints in this MVP.
}

/**
 * Infer a JSON Schema-like type name from a JsonValue.
 *  - "string"
 *  - "number"
 *  - "integer"
 *  - "boolean"
 *  - "null"
 *  - "object"
 *  - "array"
 */
function inferJsonType(value: JsonValue): string {
  // Null check must come first, because typeof null === "object".
  if (value === null) {
    return 'null';
  }

  // Arrays must be checked before generic object.
  if (Array.isArray(value)) {
    return 'array';
  }

  const jsType = typeof value;

  if (jsType === 'string') {
    return 'string';
  }

  if (jsType === 'number') {
    // Distinguish integers vs floats for extra precision.
    return Number.isInteger(value) ? 'integer' : 'number';
  }

  if (jsType === 'boolean') {
    return 'boolean';
  }

  if (jsType === 'object') {
    return 'object';
  }

  // Fallback (should never happen for proper JsonValue).
  return jsType;
}

/**
 * Compare two JsonValue instances for deep equality.
 */
function deepEqual(a: JsonValue, b: JsonValue): boolean {
  // Strict equality handles primitives directly.
  if (a === b) {
    return true;
  }

  // If either is null, we already handled equality above.
  if (a === null || b === null) {
    return false;
  }

  // Compare arrays.
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i] as JsonValue, b[i] as JsonValue)) {
        return false;
      }
    }
    return true;
  }

  // If one is array and the other is not, they differ.
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Compare objects.
  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as JsonObject;
    const bObj = b as JsonObject;

    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(bObj, key)) {
        return false;
      }
      if (!deepEqual(aObj[key], bObj[key])) {
        return false;
      }
    }

    return true;
  }

  // Fallback: they are not equal.
  return false;
}

/**
 * Validate a string node against relevant schema constraints.
 */
function validateStringNode(
  value: string,
  schema: JsonSchema,
  path: string,
  errors: ErrorCollector
): void {
  // 1. pattern
  if (schema.pattern !== undefined) {
    try {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.add(path, `string does not match pattern: ${schema.pattern}`);
      }
    } catch {
      errors.add(
        path,
        `invalid pattern in schema: ${JSON.stringify(schema.pattern)}`
      );
    }
  }

  // 2. minLength
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.add(
      path,
      `string length ${value.length} is less than minLength ${schema.minLength}`
    );
  }

  // 3. maxLength
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.add(
      path,
      `string length ${value.length} is greater than maxLength ${schema.maxLength}`
    );
  }
}

/**
 * Validate a number node against numeric constraints.
 */
function validateNumberNode(
  value: number,
  schema: JsonSchema,
  path: string,
  errors: ErrorCollector
): void {
  // 1. minimum
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.add(
      path,
      `number ${value} is less than minimum ${schema.minimum}`
    );
  }

  // 2. maximum
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.add(
      path,
      `number ${value} is greater than maximum ${schema.maximum}`
    );
  }

  // 3. exclusiveMinimum
  if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
    errors.add(
      path,
      `number ${value} is less than or equal to exclusiveMinimum ${schema.exclusiveMinimum}`
    );
  }

  // 4. exclusiveMaximum
  if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
    errors.add(
      path,
      `number ${value} is greater than or equal to exclusiveMaximum ${schema.exclusiveMaximum}`
    );
  }
}

/**
 * Validate an array node, including item schemas and length constraints.
 */
function validateArrayNode(
  value: JsonValue[],
  schema: JsonSchema,
  path: string,
  errors: ErrorCollector
): void {
  // 1. minItems
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.add(
      path,
      `array length ${value.length} is less than minItems ${schema.minItems}`
    );
  }

  // 2. maxItems
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.add(
      path,
      `array length ${value.length} is greater than maxItems ${schema.maxItems}`
    );
  }

  // 3. items schema
  if (schema.items) {
    for (let i = 0; i < value.length; i += 1) {
      const itemPath = `${path}[${i}]`;
      // Recursively validate each item.
      validateAgainstJsonSchema(
        value[i] as JsonValue,
        schema.items,
        itemPath,
        errors
      );
    }
  }
}

/**
 * Validate an object node, including properties, required keys, and additionalProperties.
 */
function validateObjectNode(
  value: JsonObject,
  schema: JsonSchema,
  path: string,
  errors: ErrorCollector
): void {
  // 1. required properties
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredKey of schema.required) {
      if (!Object.prototype.hasOwnProperty.call(value, requiredKey)) {
        const missingPath = joinPath(path, requiredKey);
        errors.add(missingPath, 'missing required property');
      }
    }
  }

  // 2. validate known properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (Object.prototype.hasOwnProperty.call(value, propName)) {
        const childPath = joinPath(path, propName);
        const childValue = value[propName] as JsonValue;
        validateAgainstJsonSchema(childValue, propSchema, childPath, errors);
      }
    }
  }

  // 3. handle additionalProperties
  const additionalPropsSpec = schema.additionalProperties;

  // If additionalProperties is undefined or true, extra keys are allowed without further checks.
  if (additionalPropsSpec === undefined || additionalPropsSpec === true) {
    return;
  }

  // If additionalProperties is false, extra keys are not allowed.
  if (additionalPropsSpec === false) {
    const allowedKeys = new Set(Object.keys(schema.properties || {}));
    for (const key of Object.keys(value)) {
      if (!allowedKeys.has(key)) {
        const extraPath = joinPath(path, key);
        errors.add(extraPath, 'additional property is not allowed');
      }
    }
    return;
  }

  // If additionalProperties is a JsonSchema, validate extra keys against that schema.
  const allowedKeys = new Set(Object.keys(schema.properties || {}));
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      const extraPath = joinPath(path, key);
      const extraValue = value[key] as JsonValue;
      validateAgainstJsonSchema(extraValue, additionalPropsSpec, extraPath, errors);
    }
  }
}

// -----------------------------------------------------------
// DOMAIN-SPECIFIC GCD MODULE SCHEMA VALIDATION
// -----------------------------------------------------------

/**
 * Validate domain-specific rules for GCD module schemas.
 *
 * This function assumes a common GCD schema structure:
 *  - Root-level keys:
 *      * id: string (required)
 *      * version: string (required)
 *      * fields: object mapping field IDs to definitions (required)
 *
 *  - Each field definition commonly has:
 *      * type: string (required, e.g., "string", "number", "boolean", "enum", "object", "array")
 *      * description: string (optional)
 *      * help: string (optional)
 *      * default: any (optional, validated against "type")
 *      * validation: object (optional)
 *      * ui: object (optional)
 *
 *  - For "enum" fields:
 *      * options: array of allowed values (required)
 *
 *  - For "object" fields:
 *      * fields or properties: nested field definitions (optional but recommended)
 *
 *  - For "array" fields:
 *      * items: nested field definition (required)
 *
 * The exact schema is defined in /schemas/core/schema-format.json.
 * This function implements a reasonable, conservative interpretation
 * that should match the MVP requirements.
 */
function validateDomainSpecificModuleSchema(
  moduleSchema: unknown,
  errors: ErrorCollector
): void {
  // Step 1: Ensure root is an object.
  if (moduleSchema === null || typeof moduleSchema !== 'object' || Array.isArray(moduleSchema)) {
    errors.add('', 'module schema must be a JSON object at the root');
    return;
  }

  const root = moduleSchema as JsonObject;

  // Step 2: Validate root-level required keys: id, version, fields.
  // 2a. id
  if (!Object.prototype.hasOwnProperty.call(root, 'id')) {
    errors.add('id', 'missing required key "id"');
  } else if (typeof root.id !== 'string') {
    errors.add('id', 'id must be a string');
  }

  // 2b. version
  if (!Object.prototype.hasOwnProperty.call(root, 'version')) {
    errors.add('version', 'missing required key "version"');
  } else if (typeof root.version !== 'string') {
    errors.add('version', 'version must be a string');
  }

  // 2c. fields
  if (!Object.prototype.hasOwnProperty.call(root, 'fields')) {
    errors.add('fields', 'missing required key "fields"');
  } else {
    validateFieldsObject(root.fields, 'fields', errors);
  }
}

/**
 * Validate the "fields" object, which maps field IDs to field definitions.
 */
function validateFieldsObject(
  fields: unknown,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: Ensure fields is an object (not null, not array).
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    errors.add(path, 'fields must be an object mapping field IDs to field definitions');
    return;
  }

  const fieldsObj = fields as JsonObject;

  // Step 2: Validate each field definition.
  for (const [fieldId, fieldDef] of Object.entries(fieldsObj)) {
    const fieldPath = joinPath(path, fieldId);
    validateFieldDefinition(fieldDef, fieldPath, errors);
  }
}

/**
 * Validate an individual field definition.
 */
function validateFieldDefinition(
  fieldDef: unknown,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: Field definition must be an object.
  if (fieldDef === null || typeof fieldDef !== 'object' || Array.isArray(fieldDef)) {
    errors.add(path, 'field definition must be an object');
    return;
  }

  const def = fieldDef as JsonObject;

  // Step 2: Validate "type" property (required).
  const typeValue = def.type;
  if (typeof typeValue !== 'string') {
    errors.add(path, 'missing or invalid "type"; expected a string');
    return;
  }

  // Allowed field types for this MVP.
  const allowedFieldTypes = [
    'string',
    'number',
    'boolean',
    'enum',
    'object',
    'array',
  ];

  if (!allowedFieldTypes.includes(typeValue)) {
    errors.add(path, `unknown field type "${typeValue}"`);
  }

  // Step 3: Validate description / help text (if present).
  if (def.description !== undefined && typeof def.description !== 'string') {
    errors.add(joinPath(path, 'description'), 'description must be a string');
  }

  if (def.help !== undefined && typeof def.help !== 'string') {
    errors.add(joinPath(path, 'help'), 'help must be a string');
  }

  // Step 4: Validate default (if present) against type.
  if (Object.prototype.hasOwnProperty.call(def, 'default')) {
    validateDefaultForFieldType(def.default as JsonValue, typeValue, def, joinPath(path, 'default'), errors);
  }

  // Step 5: Validate validation rules (if present).
  if (def.validation !== undefined) {
    validateValidationRules(def.validation, typeValue, joinPath(path, 'validation'), errors);
  }

  // Step 6: Validate UI hints (if present).
  if (def.ui !== undefined) {
    validateUiHints(def.ui, joinPath(path, 'ui'), errors);
  }

  // Step 7: Type-specific structural checks.
  if (typeValue === 'enum') {
    validateEnumField(def, path, errors);
  }

  if (typeValue === 'object') {
    validateObjectField(def, path, errors);
  }

  if (typeValue === 'array') {
    validateArrayField(def, path, errors);
  }
}

/**
 * Validate that a default value matches the field's declared type.
 */
function validateDefaultForFieldType(
  defaultValue: JsonValue,
  fieldType: string,
  fieldDef: JsonObject,
  path: string,
  errors: ErrorCollector
): void {
  // Handle basic scalar types directly.
  if (fieldType === 'string') {
    if (typeof defaultValue !== 'string') {
      errors.add(path, 'default value must be a string');
    }
    return;
  }

  if (fieldType === 'number') {
    if (typeof defaultValue !== 'number' || Number.isNaN(defaultValue)) {
      errors.add(path, 'default value must be a number');
    }
    return;
  }

  if (fieldType === 'boolean') {
    if (typeof defaultValue !== 'boolean') {
      errors.add(path, 'default value must be a boolean');
    }
    return;
  }

  if (fieldType === 'enum') {
    // For enums, default must be one of the options.
    const options = fieldDef.options;
    if (!Array.isArray(options)) {
      errors.add(path, 'enum field must define "options" as an array');
      return;
    }

    const isAllowed = options.some((option) => deepEqual(option as JsonValue, defaultValue));
    if (!isAllowed) {
      errors.add(path, 'default value must be one of the enum "options"');
    }
    return;
  }

  if (fieldType === 'object') {
    if (
      defaultValue === null ||
      typeof defaultValue !== 'object' ||
      Array.isArray(defaultValue)
    ) {
      errors.add(path, 'default value for object field must be an object');
    }
    return;
  }

  if (fieldType === 'array') {
    if (!Array.isArray(defaultValue)) {
      errors.add(path, 'default value for array field must be an array');
    }
    return;
  }

  // Unknown field types already reported earlier, but we guard here.
  errors.add(path, `default value validation not implemented for field type "${fieldType}"`);
}

/**
 * Validate a field's "validation" rules object.
 *
 * For this MVP, we support:
 *  - regex: string (for string fields)
 *  - min: number (for number fields or length/size)
 *  - max: number (for number fields or length/size)
 *  - required: boolean
 */
function validateValidationRules(
  validation: unknown,
  fieldType: string,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: validation must be an object.
  if (validation === null || typeof validation !== 'object' || Array.isArray(validation)) {
    errors.add(path, 'validation must be an object');
    return;
  }

  const rules = validation as JsonObject;

  // Step 2: regex (string).
  if (rules.regex !== undefined) {
    if (typeof rules.regex !== 'string') {
      errors.add(joinPath(path, 'regex'), 'regex must be a string');
    } else if (fieldType !== 'string') {
      errors.add(joinPath(path, 'regex'), 'regex validation is only applicable to string fields');
    } else {
      // Try to construct the RegExp to ensure it is valid.
      try {
        // Even if flags are not provided, this checks pattern validity.
        // If your schema splits pattern/flags, you can adjust accordingly.
        // Here, we treat the whole string as the pattern.
        // eslint-disable-next-line no-new
        new RegExp(rules.regex);
      } catch {
        errors.add(joinPath(path, 'regex'), 'regex is not a valid regular expression');
      }
    }
  }

  // Step 3: min / max (numbers).
  if (rules.min !== undefined && typeof rules.min !== 'number') {
    errors.add(joinPath(path, 'min'), 'min must be a number');
  }

  if (rules.max !== undefined && typeof rules.max !== 'number') {
    errors.add(joinPath(path, 'max'), 'max must be a number');
  }

  // Step 4: required (boolean).
  if (rules.required !== undefined && typeof rules.required !== 'boolean') {
    errors.add(joinPath(path, 'required'), 'required must be a boolean');
  }

  // Note: This MVP does not yet perform cross-checks like:
  //  - min <= max
  //  - validating that min/max make sense for the chosen field type.
  // Those can be added incrementally if desired.
}

/**
 * Validate UI hints for a field.
 *
 * For this MVP:
 *  - ui must be an object.
 *  - All values should be primitives (string | number | boolean | null).
 *    (We disallow nested objects/arrays in the MVP to keep hints simple.)
 */
function validateUiHints(
  ui: unknown,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: ui must be an object (not null, not array).
  if (ui === null || typeof ui !== 'object' || Array.isArray(ui)) {
    errors.add(path, 'ui must be an object of UI hint key-value pairs');
    return;
  }

  const uiObj = ui as JsonObject;

  // Step 2: ensure all values are primitives.
  for (const [key, value] of Object.entries(uiObj)) {
    const valueType = typeof value;
    const isPrimitive =
      value === null ||
      valueType === 'string' ||
      valueType === 'number' ||
      valueType === 'boolean';

    if (!isPrimitive) {
      errors.add(joinPath(path, key), 'UI hint values must be primitive (string, number, boolean, or null)');
    }
  }
}

/**
 * Validate an enum field definition.
 *
 * Requirements:
 *  - options: array (required)
 *  - options should not be empty
 *  - Ideally, options are primitives (string/number/boolean), though we do not strictly enforce in MVP.
 */
function validateEnumField(
  fieldDef: JsonObject,
  path: string,
  errors: ErrorCollector
): void {
  const options = fieldDef.options;

  // Step 1: options must exist and be an array.
  if (!Array.isArray(options)) {
    errors.add(path, 'enum field must define "options" as an array');
    return;
  }

  // Step 2: options should not be empty.
  if (options.length === 0) {
    errors.add(path, 'enum "options" array must not be empty');
  }

  // Step 3: basic primitive check (not strictly required, but a good MVP guard).
  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];
    const optType = typeof opt;
    const isPrimitive =
      opt === null ||
      optType === 'string' ||
      optType === 'number' ||
      optType === 'boolean';

    if (!isPrimitive) {
      errors.add(
        `${path}.options[${i}]`,
        'enum option should be a primitive value (string, number, boolean, or null)'
      );
    }
  }
}

/**
 * Validate an object field definition.
 *
 * For this MVP:
 *  - We look for nested "fields" or "properties" to represent nested objects.
 *  - If found, we recursively validate them as field definitions.
 */
function validateObjectField(
  fieldDef: JsonObject,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: Determine where nested definitions live.
  // Priority: "fields", but fall back to "properties" if needed.
  const nested =
    fieldDef.fields !== undefined
      ? fieldDef.fields
      : fieldDef.properties !== undefined
      ? fieldDef.properties
      : undefined;

  // Step 2: If no nested definitions, we do not hard-fail, but we can warn.
  if (nested === undefined) {
    // Not necessarily an error in all designs, so treat as informational.
    // For MVP, we don't add an error here.
    return;
  }

  // Step 3: Validate nested fields.
  const nestedPath =
    fieldDef.fields !== undefined ? joinPath(path, 'fields') : joinPath(path, 'properties');

  validateFieldsObject(nested, nestedPath, errors);
}

/**
 * Validate an array field definition.
 *
 * Requirements:
 *  - items: field definition describing array elements (required)
 */
function validateArrayField(
  fieldDef: JsonObject,
  path: string,
  errors: ErrorCollector
): void {
  // Step 1: items must be defined.
  if (fieldDef.items === undefined) {
    errors.add(path, 'array field must define "items" schema');
    return;
  }

  // Step 2: Validate the items definition as a field definition.
  const itemsPath = joinPath(path, 'items');
  validateFieldDefinition(fieldDef.items, itemsPath, errors);
}
