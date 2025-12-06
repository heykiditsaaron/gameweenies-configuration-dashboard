// /schemas/core/loader/types.ts
// ------------------------------------------------------
// Core type definitions used by the Module Loader (MVP).
// ------------------------------------------------------

// -------------
// ModuleStatus
// -------------
//
// Represents the high-level health/validation state of a module.
// This is what the loader will set after it attempts to find and
// validate schema.json for a given module directory.
//
export type ModuleStatus =
  // The module has a schema.json, it was parsed successfully,
  // and the schema passed validation.
  | "valid"
  // The module has a schema.json, but something went wrong:
  //  - file could not be read
  //  - JSON was invalid
  //  - validator rejected the schema
  | "invalid"
  // The module directory exists, but no schema.json was found.
  // This is treated as a warning, not a hard crash for the loader.
  | "missing-schema";

// -----------------
// ValidationError
// -----------------
//
// Represents a single validation problem. These can come from
// different sources:
//  - the schema validator itself
//  - the loader when it encounters file/JSON issues
//
// The goal is to provide human-readable information that can be
// surfaced in logs, CLI output, or a future UI.
//
export interface ValidationError {
  // Human-readable description of what went wrong.
  message: string;

  // Optional JSON path / location (if available).
  // Example: "fields[0].id" or "$.meta.name"
  path?: string;

  // Optional error code or short identifier (if available).
  // Example: "REQUIRED_FIELD_MISSING"
  code?: string;

  // Allow additional properties from the underlying validator output
  // without breaking type-checking. This keeps us flexible if the
  // validator returns richer error objects.
  // Example: validator might add "severity", "schemaKeyword", etc.
  [key: string]: unknown;
}

// ------------------------
// SchemaValidationResult
// ------------------------
//
// This interface describes the *shape* of the result we expect from
// the existing schema validator. We do NOT modify the validator;
// we simply define a type that matches its current behavior. If the
// real validator returns additional properties, those will still be
// allowed via the index signature.
//
// The loader will consume this type and convert it into a LoadedModule.
//
export interface SchemaValidationResult {
  // true  => validation succeeded
  // false => validation failed
  isValid: boolean;

  // If validation fails, this should contain one or more errors.
  // If validation succeeds, this should be empty or undefined.
  errors?: ValidationError[];

  // When validation succeeds, the validator may provide a canonical
  // "clean" version of the schema that matches schema-format.json.
  //
  // When validation fails, this will usually be undefined or null.
  validatedSchema?: unknown;

  // Allow extra properties without forcing the validator to exactly
  // match this interface. This keeps the loader decoupled from any
  // internal details of the validator.
  [key: string]: unknown;
}

// ---------------
// LoadedModule
// ---------------
//
// This is the canonical in-memory representation of a single module,
// as seen by the loader. Phase 3 (backend) and Phase 4 (UI) can
// consume this structure without worrying about filesystem or
// validation details.
//
// Every discovered module directory will produce one LoadedModule,
// even if schema.json is missing or invalid.
//
export interface LoadedModule {
  // The module's directory name.
  // Example: "mockmod", "quests", "inventory-system"
  name: string;

  // The module's directory path.
  // This can be absolute or project-relative, depending on how the
  // loader is called.
  // Example: "modules/mockmod" or "/full/path/to/modules/mockmod"
  path: string;

  // The raw schema *before* validation.
  // - If schema.json is found and JSON.parse succeeds, this is the
  //   parsed JSON object.
  // - If parsing fails or schema.json is missing, this will be null.
  rawSchema: unknown | null;

  // The validated, canonical schema returned by the schema validator.
  // - Present only when validation succeeds.
  // - Null when validation fails or there is no schema.
  validatedSchema: unknown | null;

  // Overall health/validation status of the module.
  // See ModuleStatus for possible values.
  status: ModuleStatus;

  // List of validation errors associated with this module.
  // - Empty when the module is valid.
  // - Populated when schema is invalid, JSON is broken, or the
  //   loader encounters read/parse issues.
  validationErrors: ValidationError[];

  // Non-fatal issues that the loader wants to surface.
  // Example:
  //  - "schema.json not found"
  //  - "schema.json is readable but empty"
  warnings: string[];

  // Indicates whether the module directory actually exists on disk.
  // For modules discovered via directory scanning, this will normally
  // be true. If a caller explicitly asks the loader to load a module
  // from a path that does not exist, this will be false and the
  // status will reflect an invalid/missing condition.
  moduleDirExists: boolean;
}
