// backend/src/modules/modules.service.ts

import { Injectable } from "@nestjs/common";
import { loadAllModulesBridge } from "./module-loader.bridge";

export interface ModuleListResponse {
  modules: any[];
  errors: string[];
}

/**
 * ModulesService
 *
 * Read-only bridge over the Phase 2 module loader.
 * Delegates to the JSON-only bridge (loadAllModulesBridge) and
 * normalizes errors into simple string messages.
 */
@Injectable()
export class ModulesService {
  async getModuleList(): Promise<ModuleListResponse> {
    const { modules, errors } = await loadAllModulesBridge();

    const modulesArray = Array.isArray(modules) ? modules : [];
    const errorMessages = errors.map((err) => err.message);

    return {
      modules: modulesArray,
      errors: errorMessages,
    };
  }
}
