// /schemas/core/loader/fs-utils.ts
// ------------------------------------------------------
// Filesystem helper utilities for the Module Loader (MVP).
//
// These helpers keep all low-level FS operations in one place,
// so the rest of the loader logic remains clean and focused on
// module semantics instead of Node filesystem details.
// ------------------------------------------------------

import * as fs from "fs";
import * as path from "path";

// ------------------------------------------------------
// 1. listModuleDirectories(modulesRootPath)
// ------------------------------------------------------
// Scans the modules root directory and returns the absolute
// paths of all subdirectories (each is considered a module).
//
// Example:
//   Input:  "modules"
//   Output: [ "/project/modules/mockmod", "/project/modules/foo" ]
//
// If the root path does not exist, this function throws—
// the caller should handle this as a fatal error.
// ------------------------------------------------------
export function listModuleDirectories(modulesRootPath: string): string[] {
  // Resolve to an absolute path for consistency.
  const absoluteRoot = path.resolve(modulesRootPath);

  // Confirm that the modules root exists.
  if (!fs.existsSync(absoluteRoot)) {
    throw new Error(
      `Module root does not exist: ${absoluteRoot} — cannot scan for modules.`
    );
  }

  // Read all entries in the directory.
  const entries = fs.readdirSync(absoluteRoot, { withFileTypes: true });

  // Filter for directories only.
  const moduleDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(absoluteRoot, entry.name));

  return moduleDirs;
}

// ------------------------------------------------------
// 2. schemaFileExists(moduleDirPath)
// ------------------------------------------------------
// Returns true if a file named "schema.json" exists inside
// the module directory. We do NOT check readability here;
// the loader will attempt to read it later and handle errors.
//
// Example:
//   schemaFileExists("/project/modules/mockmod") === true
// ------------------------------------------------------
export function schemaFileExists(moduleDirPath: string): boolean {
  const schemaPath = path.join(moduleDirPath, "schema.json");
  return fs.existsSync(schemaPath) && fs.statSync(schemaPath).isFile();
}

// ------------------------------------------------------
// 3. readSchemaFile(moduleDirPath)
// ------------------------------------------------------
// Attempts to read and parse the module's schema.json file.
//
// Returns:
//   {
//     rawText: string | null,
//     rawJSON: unknown | null,
//     error: string | null
//   }
//
// Behavior:
//   - If schema.json does not exist, returns an "error" message.
//   - If file read fails, returns an "error".
//   - If JSON.parse fails, returns an "error" and rawText.
//
// The loader will take this information and map it to a LoadedModule.
//
// Note: We deliberately do NOT throw in this function —
//       module-level failures should be isolated and not crash
//       the overall loader.
// ------------------------------------------------------
export function readSchemaFile(moduleDirPath: string): {
  rawText: string | null;
  rawJSON: unknown | null;
  error: string | null;
} {
  const schemaPath = path.join(moduleDirPath, "schema.json");

  // If missing, return an error message.
  if (!fs.existsSync(schemaPath)) {
    return {
      rawText: null,
      rawJSON: null,
      error: `schema.json not found at path: ${schemaPath}`,
    };
  }

  // Try reading the file.
  let text: string;
  try {
    text = fs.readFileSync(schemaPath, "utf-8");
  } catch (err: any) {
    return {
      rawText: null,
      rawJSON: null,
      error: `Failed to read schema.json: ${err?.message ?? String(err)}`,
    };
  }

  // Try parsing JSON.
  try {
    const parsed = JSON.parse(text);
    return {
      rawText: text,
      rawJSON: parsed,
      error: null,
    };
  } catch (err: any) {
    return {
      rawText: text, // Keep raw text for debugging.
      rawJSON: null,
      error: `Invalid JSON in schema.json: ${err?.message ?? String(err)}`,
    };
  }
}
