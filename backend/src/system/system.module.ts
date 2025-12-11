import { Module } from "@nestjs/common";
import { SystemController } from "./system.controller";
import { SystemConfigService } from "../config/system-config.service";
import { ModulesService } from "../modules/modules.service";
import { ModulesModule } from "../modules/modules.module";

@Module({
  imports: [ModulesModule],
  controllers: [SystemController],
  providers: [SystemConfigService],
  exports: [],
})
export class SystemModule {}
