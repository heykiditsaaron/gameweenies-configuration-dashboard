// backend/src/modules/modules.module.ts

import { Module } from "@nestjs/common";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";
import { ModuleDiscoveryService } from "./module-discovery.service";
import { ModuleCatalogService } from "./catalog/module-catalog.service";

/**
 * ModulesModule
 *
 * Aggregates services and controllers related to module discovery,
 * catalog normalization, and module listing.
 *
 * NOTE (Step 15):
 * - ModuleCatalogService is registered as a provider and exported.
 * - No loader bridge or DB wiring is added here.
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
