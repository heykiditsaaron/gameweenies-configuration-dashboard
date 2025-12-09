// backend/src/app.module.ts

import { Module } from "@nestjs/common";
import { ENV_CONFIG } from "./config/environment.token";
import { getEnvironmentConfig } from "./config/environment.config";

import { HealthController } from "./health/health.controller";
import { SftpService } from "./sftp/sftp.service";
import { SftpController } from "./sftp/sftp.controller";
import { SystemConfigService } from "./config/system-config.service";
import { ModuleDiscoveryService } from "./modules/module-discovery.service";
import { ModulesController } from "./modules/modules.controller";
import { ModulesService } from "./modules/modules.service";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { ConfigInstancesModule } from "./config-instances/config-instances.module";

const environmentConfig = getEnvironmentConfig();

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ConfigInstancesModule,
  ],
  controllers: [
    HealthController,
    SftpController,
    ModulesController,
  ],
  providers: [
    {
      provide: ENV_CONFIG,
      useValue: environmentConfig,
    },
    SystemConfigService,
    ModuleDiscoveryService,
    ModulesService,
    SftpService,
  ],
})
export class AppModule {}
