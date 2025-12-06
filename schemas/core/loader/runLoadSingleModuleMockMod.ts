// /schemas/core/loader/tests/runLoadSingleModuleMockMod.ts
// ---------------------------------------------------------
// Manual test: Load a single test module (mockmod).
// Run with:
//   ts-node schemas/core/loader/tests/runLoadSingleModuleMockMod.ts
// ---------------------------------------------------------

import path from "path";
import { loadSingleModule } from "../module-loader";

// Point to modules/mockmod/
const modulePath = path.resolve("modules/mockmod");

console.log("=== Running Single Module Loader Test ===");
console.log("Module Path:", modulePath);

const result = loadSingleModule(modulePath);

console.log("\n=== Loaded Module Result ===");
console.dir(result, { depth: null, colors: true });

console.log("\nTest complete.\n");
