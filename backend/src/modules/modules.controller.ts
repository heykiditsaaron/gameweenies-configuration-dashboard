// backend/src/modules/modules.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import type { ModuleCatalog } from "./catalog/module-catalog.types";

/**
 * ModulesController
 *
 * STEP 19:
 *  - Debug endpoint `/modules/raw` has been removed.
 *  - Only the production-grade normalized endpoint remains:
 *        GET /modules
 */
@Controller("modules")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /**
   * GET /modules
   * Returns normalized module catalog.
   */
  @Get()
  async listCatalog(): Promise<ModuleCatalog> {
    return this.modulesService.listModules();
  }
}
