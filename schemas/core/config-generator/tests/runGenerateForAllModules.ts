/**
 * Manual Test Runner: runGenerateForAllModules.ts
 * ------------------------------------------------------------
 * Purpose:
 *   - Load ALL modules under /modules.
 *   - For each module with a valid validatedSchema:
 *       • run the default configuration generator,
 *       • print module name,
 *       • print generated config,
 *       • print any warnings.
 *
 * Requirements:
 *   - Script MUST NOT throw.
 *   - Must be runnable via ts-node.
 *   - Handles invalid/missing schema modules gracefully.
 */

import path from "path";

// Module loader
import { loadAllModules } from "../../loader/module-loader";

// Generator API
import { generateDefaultConfig } from "../generate-default-config";

function main() {
  try {
    const modulesRoot = path.join(__dirname, "../../../modules");

    console.log("Scanning modules in:", modulesRoot);

    const modules = loadAllModules(modulesRoot);

    modules.forEach((mod) => {
      console.log("\n==============================================");
      console.log(`Module: ${mod.id}`);
      console.log(`Status: ${mod.status}`);

      if (!mod.validatedSchema) {
        console.log("No validated schema — skipping.");
        return;
      }

      // Run generator for each module
      const result = generateDefaultConfig(mod.validatedSchema);

      console.log("Generated Config:");
      console.log(JSON.stringify(result.config, null, 2));

      console.log("Warnings:");
      if (result.warnings.length === 0) {
        console.log("(none)");
      } else {
        result.warnings.forEach((w) =>
          console.log(`- [${w.path}] ${w.message}`)
        );
      }
    });

    console.log("\n=== Complete ===");
  } catch (err) {
    console.error("Unexpected error during all-modules test run:", err);
  }
}

main();
