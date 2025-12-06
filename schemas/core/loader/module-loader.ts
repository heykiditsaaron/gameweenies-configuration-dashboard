// /schemas/core/loader/module-loader.ts
// ------------------------------------------------------
// Core Module Loader for GCD (Phase 2 Task 3 - MVP)
//
// Responsibilities:
//  - Discover modules under a directory
//  - Load schema.json for each module
//  - Validate schema via runSchemaValidation()
//  - Produce canonical LoadedModule objects
//  - Never crash due to bad modules
// ------------------------------------------------------

import * as fs from "fs";
import * as path from "path";

import {
  LoadedModule,
  ModuleStatus,
  ValidationError
} from "./types";

import {
  listModuleDirectories,
  readSchemaFile,
  schemaFileExists
} from "./fs-utils";

import { runSchemaValidation } from "./validator-bridge";

// ------------------------------------------------------
// loadSingleModule(moduleDirPath)
// ------------------------------------------------------
// Loads exactly one module directory and returns a LoadedModule
// describing raw schema, validated schema, warnings, and errors.
// ------------------------------------------------------
export function loadSingleModule(moduleDirPath: string): LoadedModule {
  const absolutePath = path.resolve(moduleDirPath);
  const exists = fs.existsSync(absolutePath);

  // Directory missing? Hard-invalid.
  if (!exists) {
    return {
      name: path.basename(absolutePath),
      path: absolutePath,
      rawSchema: null,
      validatedSchema: null,
      status: "invalid",
      validationErrors: [
        { message: `Module directory does not exist: ${absolutePath}` }
      ],
      warnings: [],
      moduleDirExists: false
    };
  }

  const moduleName = path.basename(absolutePath);

  // ------------------------------------------------------
  // Missing schema.json → "missing-schema"
  // ------------------------------------------------------
  if (!schemaFileExists(absolutePath)) {
    return {
      name: moduleName,
      path: absolutePath,
      rawSchema: null,
      validatedSchema: null,
      status: "missing-schema",
      validationErrors: [],
      warnings: [`schema.json not found in module: ${moduleName}`],
      moduleDirExists: true
    };
  }

  // ------------------------------------------------------
  // Read schema.json
  // ------------------------------------------------------
  const schemaResult = readSchemaFile(absolutePath);

  if (schemaResult.error) {
    return {
      name: moduleName,
      path: absolutePath,
      rawSchema: schemaResult.rawText,
      validatedSchema: null,
      status: "invalid",
      validationErrors: [{ message: schemaResult.error }],
      warnings: [],
      moduleDirExists: true
    };
  }

  // ------------------------------------------------------
  // Validate schema
  // ------------------------------------------------------
  const validation = runSchemaValidation(schemaResult.rawJSON);
  const status: ModuleStatus = validation.isValid ? "valid" : "invalid";

  return {
    name: moduleName,
    path: absolutePath,
    rawSchema: schemaResult.rawJSON,
    validatedSchema: validation.validatedSchema,
    status,
    validationErrors: validation.errors ?? [],
    warnings: [],
    moduleDirExists: true
  };
}

// ------------------------------------------------------
// loadAllModules(modulesRootPath)
// ------------------------------------------------------
// Scans directory for modules and loads each one individually.
// ------------------------------------------------------
export function loadAllModules(modulesRootPath: string): LoadedModule[] {
  const absoluteRoot = path.resolve(modulesRootPath);

  if (!fs.existsSync(absoluteRoot)) {
    throw new Error(`Modules root directory does not exist: ${absoluteRoot}`);
  }

  const moduleDirs = listModuleDirectories(absoluteRoot);

  return moduleDirs.map((dir) => loadSingleModule(dir));
}
