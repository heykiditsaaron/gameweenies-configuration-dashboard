// /schemas/core/config-generator/generate-default-config.ts

/**
 * Default Configuration Generator (MVP + Future-Proof Hooks)
 * ----------------------------------------------------------
 *
 * Responsibilities:
 *  - Accept a validated schema (SchemaLike).
 *  - Produce a full default configuration object.
 *  - Accumulate warnings instead of ever throwing.
 *  - Always return:
 *        { config: <object>, warnings: <array> }
 *
 * MVP Default Rules:
 *  - explicit default → use it
 *  - otherwise:
 *      string  → ""
 *      number  → 0
 *      boolean → false
 *      enum    → first element
 *      array   → []
 *      object  → recursively generate
 *
 * Future Hooks are present but inactive:
 *  - inferPlaceholder
 *  - uiAwareDefault
 *  - conditionalDefault
 *  - arrayTemplateDefault
 *
 * Architectural Guarantees:
 *  - Output warnings is ALWAYS an array (never undefined).
 *  - Generator is PURE and STATELESS — no shared globals.
 *  - Never throws — fully defensive.
 */

import {
  SchemaLike,
  SchemaFieldLike,
  DefaultConfigResult,
  DefaultConfigWarning,
  GenerateDefaultConfigOptions,
  InternalGeneratorContext,
  DefaultConfigHooks,
  ArrayTemplateDefaultArgs,
  ConfigFieldType,
} from "./types";

/* ===========================================================================
 * INTERNAL: HOOK INFRASTRUCTURE (NO-OP FOR MVP)
 * ======================================================================== */

const DEFAULT_HOOKS: DefaultConfigHooks = {
  inferPlaceholder: () => undefined,
  uiAwareDefault: () => undefined,
  conditionalDefault: () => undefined,
  arrayTemplateDefault: (_args: ArrayTemplateDefaultArgs) => undefined,
};

/**
 * Builds an isolated hook set for each run.
 * Ensures no internal state is shared across invocations.
 */
function buildHookSet(
  partial?: Partial<DefaultConfigHooks>
): DefaultConfigHooks {
  return { ...DEFAULT_HOOKS, ...(partial ?? {}) };
}

/* ===========================================================================
 * PUBLIC API (Step 7 — Warnings Aggregation Finalized)
 * ======================================================================== */

/**
 * Generate a default config for a validated schema.
 * WARNING:
 *  - This function must NEVER throw.
 *  - All errors or schema inconsistencies MUST become warnings.
 *
 * @returns DefaultConfigResult<{}>
 */
export function generateDefaultConfig(
  schema: SchemaLike,
  options?: GenerateDefaultConfigOptions
): DefaultConfigResult<Record<string, unknown>> {
  // This warnings array belongs to THIS run only.
  // No external references → generator remains 100% stateless.
  const warnings: DefaultConfigWarning[] = [];

  // Internal context for recursion; safe & isolated per call
  const context: InternalGeneratorContext = {
    warnings,
    hooks: buildHookSet(options?.hooks),
    uiContext: options?.uiContext,
  };

  // Ensure schema structure is valid
  if (!schema || typeof schema !== "object") {
    warnings.push({
      path: "",
      message:
        "Schema is missing or not an object; returning empty config fallback.",
      fieldMeta: schema,
    });

    return { config: {}, warnings };
  }

  // Ensure root fields are present
  const rootFields = Array.isArray(schema.fields) ? schema.fields : [];
  if (rootFields.length === 0) {
    warnings.push({
      path: "",
      message: "Schema contains no fields; returning empty config.",
      fieldMeta: schema,
    });

    return { config: {}, warnings };
  }

  const config: Record<string, unknown> = {};

  // Walk top-level fields
  rootFields.forEach((field, index) => {
    const id = getFieldId(field, index);
    const path = id;

    try {
      config[id] = generateValueForField(field, path, context);
    } catch {
      // Step 7 guarantees: NEVER throw → convert to warning
      warnings.push({
        path,
        message: `Exception generating field '${id}'. Using null fallback.`,
        fieldMeta: field,
      });

      config[id] = null;
    }
  });

  /**
   * Step 7 Requirement:
   * Ensure warnings array is ALWAYS present, even if empty.
   * (Already satisfied because warnings is initialized above.)
   */

  return {
    config,
    warnings, // flat list accumulated across recursion
  };
}

/* ===========================================================================
 * CORE FIELD DISPATCHER
 * ======================================================================== */

/**
 * Distills all field generation into a single entry point.
 * Must remain total and non-throwing.
 */
function generateValueForField(
  field: SchemaFieldLike,
  path: string,
  context: InternalGeneratorContext
): unknown {
  // Explicit default overrides everything (even null)
  if ("default" in field && field.default !== undefined) {
    return field.default;
  }

  const type = resolveFieldType(field);

  switch (type) {
    case "string":
      return generateStringDefault();
    case "number":
      return generateNumberDefault();
    case "boolean":
      return generateBooleanDefault();
    case "enum":
      return generateEnumDefault(field, path, context);
    case "array":
      return generateArrayDefault(field, path, context);
    case "object":
      return generateObjectDefault(field, path, context);
    default:
      return generateFallbackPlaceholder(field, path, context);
  }
}

/* ===========================================================================
 * TYPE-SPECIFIC HELPERS
 * ======================================================================== */

function generateStringDefault(): string {
  return "";
}

function generateNumberDefault(): number {
  return 0;
}

function generateBooleanDefault(): boolean {
  return false;
}

/**
 * Step 6 — Enum Default Logic (Reconfirmed for Step 7)
 */
function generateEnumDefault(
  field: SchemaFieldLike,
  path: string,
  context: InternalGeneratorContext
): unknown {
  if ("default" in field && field.default !== undefined) {
    return field.default;
  }

  const options = Array.isArray(field.options) ? field.options : [];
  if (options.length > 0) return options[0];

  context.warnings.push({
    path,
    message: "Enum/select field has no valid options; using null fallback.",
    fieldMeta: field,
  });

  return null;
}

/**
 * Step 5 — Array Logic (Shallow-copy explicit default; else [])
 */
function generateArrayDefault(
  field: SchemaFieldLike,
  path: string,
  context: InternalGeneratorContext
): unknown[] {
  if ("default" in field) {
    const d = field.default;

    if (Array.isArray(d)) return [...d];

    if (d !== undefined) {
      context.warnings.push({
        path,
        message:
          "Field.default exists but is not an array; using empty array instead.",
        fieldMeta: field,
      });
      return [];
    }
  }

  return [];
}

/**
 * Step 4 — Fully Recursive Object Handling
 */
function generateObjectDefault(
  field: SchemaFieldLike,
  path: string,
  context: InternalGeneratorContext
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  if (field.fields !== undefined && !Array.isArray(field.fields)) {
    context.warnings.push({
      path,
      message:
        "Object field has non-array 'fields' metadata; using {} fallback.",
      fieldMeta: field,
    });
    return output;
  }

  const children = Array.isArray(field.fields) ? field.fields : [];
  if (children.length === 0) return output;

  children.forEach((child, index) => {
    const id = getFieldId(child, index);
    const childPath = `${path}.${id}`;

    try {
      output[id] = generateValueForField(child, childPath, context);
    } catch {
      context.warnings.push({
        path: childPath,
        message: `Exception generating nested field '${id}'. Using null fallback.`,
        fieldMeta: child,
      });
      output[id] = null;
    }
  });

  return output;
}

/**
 * Fallback field handler for unknown types.
 */
function generateFallbackPlaceholder(
  field: SchemaFieldLike,
  path: string,
  context: InternalGeneratorContext
): unknown {
  context.warnings.push({
    path,
    message:
      "Unknown or unsupported field type; using null placeholder.",
    fieldMeta: field,
  });

  return null;
}

/* ===========================================================================
 * UTILITY HELPERS
 * ======================================================================== */

function getFieldId(field: SchemaFieldLike, index: number): string {
  if (typeof field.id === "string" && field.id.trim()) return field.id;
  if (typeof field.key === "string" && field.key.trim()) return field.key;
  return `_field_${index}`;
}

function resolveFieldType(field: SchemaFieldLike): ConfigFieldType {
  const raw = typeof field.type === "string" ? field.type.toLowerCase() : "";

  if (
    raw === "string" ||
    raw === "number" ||
    raw === "boolean" ||
    raw === "enum" ||
    raw === "array" ||
    raw === "object"
  ) {
    return raw;
  }

  if (Array.isArray(field.fields)) return "object";
  if (field.items) return "array";
  if (Array.isArray(field.options)) return "enum";

  return "string";
}
