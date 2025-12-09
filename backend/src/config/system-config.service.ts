// backend/src/config/system-config.service.ts

import { Inject, Injectable } from "@nestjs/common";
import { ENV_CONFIG } from "./environment.token";
import type { EnvironmentConfig } from "./environment.config";
import type { SftpConfig } from "./sftp/sftp.types";
import { ModuleDiscoveryService } from "../modules/module-discovery.service";

/**
 * SystemConfigService
 *
 * Provides typed access to environment configuration and integrates
 * Phase 3.3 module discovery (raw loader output only).
 *
 * MVP NOTE:
 * - EnvironmentConfig does NOT contain tier/version fields yet.
 * - Tier will later come from a separate config source (GCD_TIER).
 */
@Injectable()
export class SystemConfigService {
  constructor(
    @Inject(ENV_CONFIG)
    private readonly envConfig: EnvironmentConfig,

    private readonly moduleDiscovery: ModuleDiscoveryService,
  ) {}

  /**
   * Deployment tier (MVP = always "mvp").
   * Future-phase logic will replace this with env-based tier resolution.
   */
  getDeploymentTier(): string {
    return "mvp";
  }

  /** Full environment config, unmodified. */
  getEnvironmentConfig(): EnvironmentConfig {
    return this.envConfig;
  }

  /** App-level configuration block. */
  getAppConfig() {
    return this.envConfig.app;
  }

  /** SFTP configuration block. */
  getSftpConfig(): SftpConfig {
    return this.envConfig.sftp;
  }

  /** Database configuration block. */
  getDatabaseConfig() {
    return this.envConfig.database;
  }

  /**
   * Returns raw module metadata as discovered by the loader.
   * No normalization, no validation, no tier logic.
   */
  async getRawDiscoveredModules() {
    return this.moduleDiscovery.getRawModules();
  }

  /**
   * Diagnostic info for internal health checks.
   * Minimal for MVP — only reports what we truly know.
   */
  getDiagnosticInfo() {
    return {
      appEnv: this.envConfig.app.env,
      host: this.envConfig.app.host,
      port: this.envConfig.app.port,
      trustProxy: this.envConfig.app.trustProxy,
      hasSftp: !!this.envConfig.sftp,
      dbHost: this.envConfig.database.host,
      dbName: this.envConfig.database.database,
      tier: "mvp",
    };
  }
}
