// backend/src/system/system.controller.ts

import { Controller, Get } from "@nestjs/common";
import { SystemConfigService } from "../config/system-config.service";
import { ModulesService } from "../modules/modules.service";

@Controller("system")
export class SystemController {
  constructor(
    private readonly systemConfig: SystemConfigService,
    private readonly modulesService: ModulesService,
  ) {}

  /**
   * STEP 29:
   * Returns basic system info drawn from existing configuration.
   *
   * No validation, no SFTP, no schema loader, no IO.
   */
  @Get("info")
  async getSystemInfo() {
    const env = this.systemConfig.getEnvironmentConfig();

    const tier = this.systemConfig.getDeploymentTier(); // always "mvp" for now
    const nodeEnv = env.app.env;
    const sftpServerCount = Array.isArray(env.sftp?.servers)
      ? env.sftp.servers.length
      : 0;

    // Count normalized modules via ModulesService (allowed)
    const modules = await this.modulesService.listModules();
    const moduleCount = modules.length;

    return {
      version: "0.0.1", // placeholder until we wire in real versioning
      tier,
      nodeEnv,
      moduleCount,
      sftpServerCount,
      build: "dev", // static placeholder per Task 5 rules
    };
  }
}
