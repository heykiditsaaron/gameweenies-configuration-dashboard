// backend/src/modules/modules.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import type { ModuleListResponse } from "./modules.service";

/**
 * ModulesController
 *
 * Read-only HTTP exposure of the Phase 2 module list via the bridge.
 * No validation, no schema logic, no FS or SFTP access.
 */
@Controller("modules")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /**
   * GET /modules
   *
   * Returns:
   * {
   *   modules: any[];
   *   errors: string[];
   * }
   *
   * All logic is delegated to ModulesService and the JSON-only bridge.
   */
  @Get()
  async getModules(): Promise<ModuleListResponse> {
    return this.modulesService.getModuleList();
  }
}
