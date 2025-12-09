// backend/src/modules/modules.module.ts

import { Module } from "@nestjs/common";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";
import { ModuleDiscoveryService } from "./module-discovery.service";
import { ModuleCatalogService } from "./catalog/module-catalog.service";

@Module({
  imports: [],
  controllers: [ModulesController],
  providers: [
    ModulesService,
    ModuleDiscoveryService,
    ModuleCatalogService, // <-- required for DI in ModulesService
  ],
  exports: [
    ModulesService,
    ModuleDiscoveryService,
    ModuleCatalogService,
  ],
})
export class ModulesModule {}
