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
   * Basic system info endpoint.
   */
  @Get("info")
  async getSystemInfo() {
    const env = this.systemConfig.getEnvironmentConfig();

    const tier = this.systemConfig.getDeploymentTier(); // always "mvp" in Phase 3
    const nodeEnv = env.app.env;
    const sftpServerCount = Array.isArray(env.sftp?.servers)
      ? env.sftp.servers.length
      : 0;

    // Normalized module catalog
    const modules = await this.modulesService.listModules();
    const moduleCount = modules.length;

    return {
      version: "0.0.1",
      tier,
      nodeEnv,
      moduleCount,
      sftpServerCount,
      build: "dev",
    };
  }

  /**
   * STEP 30:
   * Full deep structural health endpoint.
   */
  @Get("health/full")
  async getFullHealth() {
    const env = this.systemConfig.getEnvironmentConfig();

    const tier = this.systemConfig.getDeploymentTier();
    const nodeEnv = env.app.env;

    const sftpServerCount = Array.isArray(env.sftp?.servers)
      ? env.sftp.servers.length
      : 0;

    const modules = await this.modulesService.listModules();
    const moduleCount = modules.length;

    const dbConfigPresent = !!this.systemConfig.getDatabaseConfig();

    const raw = await this.systemConfig.getRawDiscoveredModules();
    const hasRawModules = Array.isArray(raw) && raw.length > 0;

    const diagnostics = this.systemConfig.getDiagnosticInfo();

    return {
      tier,
      nodeEnv,
      moduleCount,
      sftpServerCount,
      databaseConfigPresent: dbConfigPresent,
      hasRawModules,
      diagnostics,
    };
  }
}
