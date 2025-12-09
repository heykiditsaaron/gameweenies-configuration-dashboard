// backend/src/modules/modules.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import type { RawModuleDescriptor } from "./catalog/module-catalog.types";

@Controller("modules")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  async listModules() {
    return this.modulesService.getModuleList();
  }

  /**
   * NEW IN STEP 16:
   * Temporary debug endpoint returning raw loader output.
   *
   * GET /modules/raw
   *
   * This will be removed once normalized catalog endpoints
   * are introduced in Step 18/19.
   */
  @Get("raw")
  async listRaw(): Promise<RawModuleDescriptor[]> {
    return this.modulesService.listRawModules();
  }
}
