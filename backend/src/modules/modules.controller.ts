// backend/src/modules/modules.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import type { ModuleCatalog } from "./catalog/module-catalog.types";
import type { RawModuleDescriptor } from "./catalog/module-catalog.types";

/**
 * ModulesController
 *
 * STEP 18:
 *  - GET /modules now returns the *normalized catalog*
 *    produced by ModulesService.listModules().
 *
 * NOTE:
 *  - GET /modules/raw remains intact for debugging
 *    until Step 19 instructs us to remove it.
 */
@Controller("modules")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /**
   * NEW IN STEP 18
   *
   * Returns the normalized ModuleCatalog:
   *   raw → ModuleCatalogService.normalizeCatalog(raw)
   *
   * This is now the primary public module listing endpoint.
   */
  @Get()
  async listCatalog(): Promise<ModuleCatalog> {
    return this.modulesService.listModules();
  }

  /**
   * DEBUG ENDPOINT (kept temporarily until Step 19)
   *
   * Returns raw loader output exactly as produced by the bridge.
   * No normalization or processing.
   */
  @Get("raw")
  async listRaw(): Promise<RawModuleDescriptor[]> {
    return this.modulesService.listRawModules();
  }
}
