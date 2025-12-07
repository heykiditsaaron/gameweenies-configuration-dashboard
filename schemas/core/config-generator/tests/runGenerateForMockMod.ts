/**
 * Manual Test Runner: runGenerateForMockMod.ts
 * ------------------------------------------------------------
 * Purpose:
 *   - Load the "mockmod" module using the module loader.
 *   - Retrieve its validated schema (if available).
 *   - Run the default configuration generator.
 *   - Print the resulting config and warnings.
 *
 * Notes:
 *   - This script MUST NOT throw.
 *   - It is designed for manual testing only (ts-node friendly).
 *   - If mockmod is missing or invalid, it reports gracefully.
 */

import path from "path";

// Module loader
import { loadSingleModule } from "../../loader/module-loader";

// Generator API
import { generateDefaultConfig } from "../generate-default-config";

function main() {
  try {
    // Compute absolute path to modules/mockmod
    const mockmodPath = path.join(__dirname, "../../../modules/mockmod");

    console.log("Loading mockmod from:", mockmodPath);

    const loaded = loadSingleModule(mockmodPath);

    console.log("Load result:", loaded.status);

    // If no validated schema exists, abort safely
    if (!loaded.validatedSchema) {
      console.warn("No validated schema found for mockmod.");
      return;
    }

    // Run the generator
    const result = generateDefaultConfig(loaded.validatedSchema);

    console.log("\n=== Generated Default Config (mockmod) ===");
    console.log(JSON.stringify(result.config, null, 2));

    console.log("\n=== Warnings ===");
    if (result.warnings.length === 0) {
      console.log("(none)");
    } else {
      result.warnings.forEach((w) =>
        console.log(`- [${w.path}] ${w.message}`)
      );
    }
  } catch (err) {
    // Absolutely no throwing — just report the issue
    console.error("Unexpected error during test run:", err);
  }
}

main();
