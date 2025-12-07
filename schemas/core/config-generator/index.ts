/**
 * config-generator/index.ts
 * --------------------------------------------------------------
 * Public API surface for the Default Configuration Generator.
 *
 * This file provides a clean and stable entry point for all
 * consumers of the config generator, while keeping internal
 * implementation details encapsulated inside this folder.
 *
 * Consumers can now import with:
 *
 *    import { generateDefaultConfig } from "../config-generator";
 *
 * Everything exposed here is intentional and safe to use.
 * No internal, private, or experimental functions are exported.
 */

// Core generator function (public API)
export { generateDefaultConfig } from "./generate-default-config";

// Types for schema + results
export type {
  SchemaLike,
  SchemaFieldLike,
  DefaultConfigResult,
  DefaultConfigWarning,
  ConfigFieldType,
} from "./types";

// Public-facing hook interfaces (future-proof)
export type {
  DefaultConfigHooks,
  ArrayTemplateDefaultArgs,
  GenerateDefaultConfigOptions,
  InternalGeneratorContext, // exposed for extension, though not typically used directly
} from "./types";
