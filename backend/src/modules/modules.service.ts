// backend/src/modules/modules.service.ts

import { Injectable } from "@nestjs/common";
import { ModuleDiscoveryService } from "./module-discovery.service";
import { loadAllModulesBridge } from "./module-loader.bridge";
import type { RawModuleDescriptor } from "./catalog/module-catalog.types";

export interface ModuleListResponse {
  modules: any[];
  errors: string[];
}

export interface ModuleListResult {
  modules: any[];
  error: string | null;
}

@Injectable()
export class ModulesService {
  constructor(
    private readonly discovery: ModuleDiscoveryService,
  ) {}

  async getModuleList(): Promise<ModuleListResponse> {
    const { modules, errors } = await loadAllModulesBridge();

    const modulesArray = Array.isArray(modules) ? modules : [];
    const errorMessages = errors.map((err) => err.message);

    return {
      modules: modulesArray,
      errors: errorMessages,
    };
  }

  async getAllModules(): Promise<ModuleListResult> {
    const { modules, errors } = await loadAllModulesBridge();

    if (errors.length > 0) {
      return {
        modules: [],
        error: errors.map((e) => e.message).join("; "),
      };
    }

    return {
      modules: Array.isArray(modules) ? modules : [],
      error: null,
    };
  }

  /**
   * NEW IN STEP 16:
   *
   * Direct passthrough to ModuleDiscoveryService.getRawModules().
   * No filtering, no transformations — returns raw loader objects.
   */
  async listRawModules(): Promise<RawModuleDescriptor[]> {
    return this.discovery.getRawModules();
  }
}
