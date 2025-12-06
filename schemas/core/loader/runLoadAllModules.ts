// /schemas/core/loader/tests/runLoadAllModules.ts
// ---------------------------------------------------------
// Manual test: Load all modules under /modules.
// Run with:
//   ts-node schemas/core/loader/tests/runLoadAllModules.ts
// ---------------------------------------------------------

import path from "path";
import { loadAllModules } from "../module-loader";

const modulesRoot = path.resolve("modules");

console.log("=== Running All Modules Loader Test ===");
console.log("Modules Root:", modulesRoot);

const results = loadAllModules(modulesRoot);

console.log("\n=== All Loaded Modules ===");
console.dir(results, { depth: null, colors: true });

console.log("\nTest complete.\n");
