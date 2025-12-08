// backend/src/config/system-config.service.ts

import { Inject, Injectable } from "@nestjs/common";
import { ENV_CONFIG } from "./environment.token";
import type { EnvironmentConfig } from "./environment.config";
import type { SftpConfig } from "./sftp/sftp.types";
import { ModuleDiscoveryService } from "../modules/module-discovery.service";
import type { ModuleStatus } from "../modules/module-discovery.service";
import type { ModuleBridgeError } from "../modules/module-loader.bridge";

/**
 * SystemConfigService
 *
 * Canonical, typed access point for backend configuration.
 * Wraps EnvironmentConfig and integrates Phase 2 module discovery.
 */
@Injectable()
export class SystemConfigService {
  constructor(
    @Inject(ENV_CONFIG) private readonly config: EnvironmentConfig,
    private readonly moduleDiscovery: ModuleDiscoveryService
  ) {}

  /** Returns raw NODE_ENV string. */
  getEnv(): string {
    return this.config.app.env;
  }

  /** True if NODE_ENV indicates production. */
  isProduction(): boolean {
    return this.getEnv().toLowerCase() === "production";
  }

  /** Returns the full app configuration block. */
  getAppConfig(): EnvironmentConfig["app"] {
    return this.config.app;
  }

  /** Returns the validated SFTP configuration block. */
  getSftpConfig(): SftpConfig {
    return this.config.sftp;
  }

  /** Returns the configured application port. */
  getPort(): number {
    return this.config.app.port;
  }

  /** Returns trustProxy boolean. */
  getTrustProxy(): boolean {
    return this.config.app.trustProxy;
  }

  /** Returns all loaded modules from the discovery service. */
  getLoadedModules(): unknown[] {
    return this.moduleDiscovery.getModules();
  }

  /** Returns the default config for a given module id, if available. */
  getDefaultConfigForModule(id: string): unknown | undefined {
    return this.moduleDiscovery.getModuleDefaults(id);
  }

  /** Returns status information for a given module id, if available. */
  getModuleStatus(id: string): ModuleStatus | undefined {
    return this.moduleDiscovery.getModuleStatus(id);
  }

  /** Returns all module-related warnings from the discovery process. */
  getModuleWarnings(): ModuleBridgeError[] {
    return this.moduleDiscovery.getWarnings();
  }
}
