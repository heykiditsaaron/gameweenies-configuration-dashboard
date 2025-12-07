/**
 * types.ts
 * ------------------------------------------------------
 * Shared type definitions for the module loader system.
 *
 * NOTE:
 * This file defines the structural types for loaded modules.
 * Runtime behavior is implemented inside module-loader.ts.
 *
 * Phase 2 Requirement:
 *  - The validated schema is produced dynamically by the
 *    validator bridge (Task 3) and is NOT written to disk.
 *  - Modules that fail validation or contain no schema must
 *    continue returning `validatedSchema = null`.
 *
 * Task 4 Update (Approved by Main Brain):
 *  - validatedSchema must now be typed as `SchemaLike | null`
 *    so the default-config generator can type-check safely.
 *  - Import SchemaLike from the config-generator subsystem.
 */

import { SchemaLike } from "../config-generator/types";

/**
 * LoadedModule
 * ------------------------------------------------------
 * Represents a single module discovered and processed by
 * the module loader.
 *
 * A module may be:
 *   - valid: schema loaded + validated
 *   - invalid: schema loaded but failed validation
 *   - missing-schema: schema file not present
 *   - error: unexpected runtime failure occurred
 *
 * IMPORTANT:
 * The loader's runtime behavior must NOT change — this is
 * purely a TypeScript typing refinement.
 */
export interface LoadedModule {
  /**
   * The module's unique ID (usually its folder name).
   */
  id: string;

  /**
   * Absolute path to the module directory.
   */
  path: string;

  /**
   * Status describing the module's schema readiness.
   */
  status: "valid" | "invalid" | "missing-schema" | "error";

  /**
   * Optional version metadata extracted from the module.
   * May be null if the module does not specify a version.
   */
  version: string | null;

  /**
   * Raw schema as loaded from disk (unvalidated).
   * May be null for missing-schema or loader errors.
   */
  rawSchema: any | null;

  /**
   * The fully validated schema produced by Task 3 ("validator bridge").
   *
   * - If validation succeeded: contains a SchemaLike object.
   * - If schema was missing OR validation failed: must be null.
   * - No runtime behavior changes here; this is strictly a type fix.
   *
   * Task 4 Requirement (Approved):
   *   The default config generator depends on this being typed as:
   *       SchemaLike | null
   */
  validatedSchema: SchemaLike | null;

  /**
   * Error object populated if something went wrong while
   * attempting to load or validate the module.
   */
  loadError?: Error;
}
