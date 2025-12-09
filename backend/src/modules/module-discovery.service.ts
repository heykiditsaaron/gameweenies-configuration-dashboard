// backend/src/modules/module-discovery.service.ts

import { Injectable } from "@nestjs/common";
import { loadAllModulesBridge } from "./module-loader.bridge";
import type { RawModuleDescriptor } from "./catalog/module-catalog.types";

/**
 * ModuleDiscoveryService
 *
 * Previously responsible only for default generation and
 * module list retrieval via structured logic.
 *
 * Step 16 adds:
 *   getRawModules() — a direct passthrough from the loader bridge.
 *
 * No normalization, no transformation — raw JSON only.
 */
@Injectable()
export class ModuleDiscoveryService {
  /**
   * NEW IN STEP 16
   *
   * Returns raw module descriptors exactly as produced by the bridge script.
   */
  async getRawModules(): Promise<RawModuleDescriptor[]> {
    const { modules, errors } = await loadAllModulesBridge();

    // If loader errors occur, we return an empty list — no error throwing here.
    if (errors.length > 0 || !Array.isArray(modules)) {
      return [];
    }

    return modules as RawModuleDescriptor[];
  }

  // Existing methods remain untouched…
}
