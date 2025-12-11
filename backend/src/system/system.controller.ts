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
   * /system/info
   *
   * Basic system metadata, structurally derived from SystemConfigService
   * and the normalized module catalog.
   */
  @Get("info")
  async getSystemInfo() {
    const env = this.systemConfig.getEnvironmentConfig();
    const app = this.systemConfig.getAppConfig();
    const sftp = this.systemConfig.getSftpConfig();
    const modules = await this.modulesService.listModules();

    return {
      // Version: structural, falls back to a safe default if not present
      version: (app as any).version ?? "0.0.0-dev",
      tier: this.systemConfig.getDeploymentTier(),
      nodeEnv: env.app.env,
      moduleCount: modules.length,
      sftpServerCount: sftp.servers.length,
      // Static build identifier for Phase 3
      build: "dev",
    };
  }

  /**
   * /system/health/full
   *
   * Deep structural health/status info — NOT a liveness probe.
   * No I/O, no SFTP, no schema validation, no DB queries.
   */
  @Get("health/full")
  async getFullSystemHealth() {
    // 1. Environment + SFTP info
    const env = this.systemConfig.getEnvironmentConfig();
    const sftp = this.systemConfig.getSftpConfig();
    const tier = this.systemConfig.getDeploymentTier();
    const diagnostics = this.systemConfig.getDiagnosticInfo();

    // 2. Normalized module catalog count
    const modules = await this.modulesService.listModules();
    const moduleCount = modules.length;

    // 3. Structural DB config presence
    const databaseConfigPresent = !!this.systemConfig.getDatabaseConfig();

    // 4. Raw module discovery presence
    const raw = await this.systemConfig.getRawDiscoveredModules();
    const hasRawModules = Array.isArray(raw) && raw.length > 0;

    return {
      tier,
      nodeEnv: env.app.env,
      moduleCount,
      sftpServerCount: sftp.servers.length,
      databaseConfigPresent,
      hasRawModules,
      diagnostics,
    };
  }
}
