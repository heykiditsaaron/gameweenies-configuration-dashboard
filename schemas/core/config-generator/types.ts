// /schemas/core/config-generator/types.ts

/**
 * ---------------------------------------------------------------------------
 * TYPES SHARED BY THE DEFAULT CONFIGURATION GENERATOR
 * ---------------------------------------------------------------------------
 *
 * Designed to be tolerant, flexible, and future-proof.
 */

/* ===========================================================================
 *  FIELD & SCHEMA SHAPES
 * =========================================================================== */

export type ConfigFieldType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "object"
  | (string & {}); // allow unknown future types

export interface SchemaFieldLike {
  id?: string;
  key?: string;
  type?: ConfigFieldType;

  default?: unknown;
  options?: unknown[];
  fields?: SchemaFieldLike[];
  items?: SchemaFieldLike;

  [key: string]: unknown;
}

export interface SchemaLike {
  fields?: SchemaFieldLike[];

  [key: string]: unknown;
}

/* ===========================================================================
 *  WARNINGS & RESULT
 * =========================================================================== */

export interface DefaultConfigWarning {
  path: string;
  message: string;
  fieldMeta?: unknown;
}

export interface DefaultConfigResult<ConfigShape = any> {
  config: ConfigShape;
  warnings: DefaultConfigWarning[];
}

/* ===========================================================================
 *  FUTURE HOOK ARGUMENT TYPES (not implemented in MVP)
 * =========================================================================== */

export interface PlaceholderInferenceArgs {
  field: SchemaFieldLike;
  path: string;
  parentValue: unknown;
}

export interface UIAwareDefaultArgs {
  field: SchemaFieldLike;
  path: string;
  uiContext?: unknown;
}

export interface ConditionalDefaultArgs {
  field: SchemaFieldLike;
  path: string;
  currentParentValue: unknown;
}

export interface ArrayTemplateDefaultArgs {
  field: SchemaFieldLike;
  path: string;
}

/* ===========================================================================
 *  HOOK INTERFACE (all no-ops in MVP)
 * =========================================================================== */

export interface DefaultConfigHooks {
  inferPlaceholder(args: PlaceholderInferenceArgs): unknown | undefined;
  uiAwareDefault(args: UIAwareDefaultArgs): unknown | undefined;
  conditionalDefault(args: ConditionalDefaultArgs): unknown | undefined;
  arrayTemplateDefault(
    args: ArrayTemplateDefaultArgs
  ): unknown | undefined;
}

/* ===========================================================================
 *  GENERATOR OPTIONS & INTERNAL CONTEXT
 * =========================================================================== */

export interface GenerateDefaultConfigOptions {
  hooks?: Partial<DefaultConfigHooks>;
  uiContext?: unknown;
}

export interface InternalGeneratorContext {
  warnings: DefaultConfigWarning[];
  hooks: DefaultConfigHooks;
  uiContext?: unknown;
}