// backend/src/modules/module-loader.bridge.ts

import { execFile } from "child_process";
import * as path from "path";

export interface ModuleBridgeError {
  message: string;
  stack?: string;
  cause?: unknown;
}

/**
 * Result shape for the module loader bridge.
 *
 * - modules: whatever the schema helper script outputs as JSON.
 * - errors: normalized errors from process execution / parsing.
 */
export interface ModuleLoaderBridgeResult {
  modules: unknown;
  errors: ModuleBridgeError[];
}

/**
 * Helper to normalize any unknown error into a structured ModuleBridgeError.
 */
function normalizeError(error: unknown): ModuleBridgeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      cause: error,
    };
  }

  return {
    message: "Unknown error while loading modules.",
    cause: error,
  };
}

/**
 * Resolves the path to the external schema loader helper script.
 *
 * IMPORTANT:
 * - This script is expected to live under the /schemas tree.
 * - It must print a JSON representation of all modules to stdout.
 * - It must not require importing TypeScript into the backend Nest app.
 *
 * The exact relative traversal assumes:
 *   project-root/
 *     backend/
 *       dist/...
 *     schemas/
 *       bridge/load-all-modules.cjs
 *
 * Adjust the segments here if the final layout differs.
 */
function getSchemaLoaderScriptPath(): string {
  // __dirname → e.g. backend/dist/modules
  //   ".."    → backend/dist
  //   ".."    → backend
  //   ".."    → project root
  return path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "schemas",
    "bridge",
    "load-all-modules.cjs",
  );
}

/**
 * Executes the external schema loader helper using a child Node process.
 *
 * The helper script must:
 * - print a JSON array/object of modules to stdout
 * - exit with code 0 on success
 *
 * This function:
 * - Never imports TS directly from /schemas
 * - Returns the parsed JSON as `unknown`
 * - Rejects on process or parsing errors
 */
function runSchemaLoaderProcess(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const scriptPath = getSchemaLoaderScriptPath();

    execFile("node", [scriptPath], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        // Attach stderr when available to aid debugging.
        const err = new Error(
          `Schema loader process failed: ${error.message}${
            stderr ? ` | stderr: ${stderr}` : ""
          }`,
        );
        err.stack = error.stack;
        return reject(err);
      }

      const output = stdout.trim();

      if (!output) {
        return reject(
          new Error(
            "Schema loader script produced empty output; expected JSON.",
          ),
        );
      }

      try {
        const parsed = JSON.parse(output);
        resolve(parsed);
      } catch (parseError) {
        const err = new Error(
          `Failed to parse schema loader JSON output: ${
            parseError instanceof Error ? parseError.message : String(parseError)
          }`,
        );
        return reject(err);
      }
    });
  });
}

/**
 * Bridge wrapper around the schema loader helper script.
 *
 * - Does not transform the data produced by the helper (other than JSON.parse).
 * - Normalizes any process / parsing errors into ModuleBridgeError entries.
 */
export async function loadAllModulesBridge(): Promise<ModuleLoaderBridgeResult> {
  try {
    const modules = await runSchemaLoaderProcess();

    return {
      modules,
      errors: [],
    };
  } catch (error) {
    return {
      modules: [],
      errors: [normalizeError(error)],
    };
  }
}
