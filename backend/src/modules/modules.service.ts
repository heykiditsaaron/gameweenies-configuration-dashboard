// backend/src/modules/modules.service.ts

import { Injectable } from "@nestjs/common";
import { ModuleDiscoveryService } from "./module-discovery.service";
import { loadAllModulesBridge } from "./module-loader.bridge";
import type { RawModuleDescriptor } from "./catalog/module-catalog.types";
import type { ModuleCatalog } from "./catalog/module-catalog.types";
import { ModuleCatalogService } from "./catalog/module-catalog.service";

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
    private readonly catalog: ModuleCatalogService,
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
   * STEP 17:
   * Returns the fully normalized ModuleCatalog.
   */
  async listModules(): Promise<ModuleCatalog> {
    const raw = await this.discovery.getRawModules();
    return this.catalog.normalizeCatalog(raw);
  }
}
