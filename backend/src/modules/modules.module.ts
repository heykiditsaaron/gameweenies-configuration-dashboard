// backend/src/modules/modules.module.ts

import { Module } from "@nestjs/common";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";
import { ModuleDiscoveryService } from "./module-discovery.service";
import { ModuleCatalogService } from "./catalog/module-catalog.service";

/**
 * ModulesModule
 *
 * STEP 19:
 * - No debug controllers remain.
 * - No wiring changes beyond ensuring ModulesController is still registered.
 */
@Module({
  imports: [],
  controllers: [ModulesController],
  providers: [
    ModulesService,
    ModuleDiscoveryService,
    ModuleCatalogService,
  ],
  exports: [
    ModulesService,
    ModuleDiscoveryService,
    ModuleCatalogService,
  ],
})
export class ModulesModule {}
