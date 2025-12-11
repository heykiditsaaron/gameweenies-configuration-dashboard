// backend/src/system/system.module.ts

import { Module } from "@nestjs/common";
import { SystemController } from "./system.controller";
import { SystemConfigService } from "../config/system-config.service";
import { ModulesModule } from "../modules/modules.module";

/**
 * SystemModule
 *
 * Provides system-level read-only diagnostics and metadata endpoints.
 * Wiring only — no business logic here.
 */
@Module({
  imports: [
    // Import ModulesModule so SystemController can inject ModulesService
    ModulesModule,
  ],
  controllers: [SystemController],
  providers: [
    // Provide SystemConfigService in this module so it can be injected
    SystemConfigService,
  ],
})
export class SystemModule {}
