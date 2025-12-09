// backend/src/modules/modules.service.ts

import { Injectable } from "@nestjs/common";
import { loadAllModulesBridge } from "./module-loader.bridge";

export interface ModuleListResponse {
  modules: any[];
  errors: string[];
}

/**
 * Extended result for getAllModules() — includes an error string instead of array.
 */
export interface ModuleListResult {
  modules: any[];
  error: string | null;
}

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

  /**
   * Stable method used by the new UsersModulesController.
   * Returns:
   *   { modules, error: null } on success
   *   { modules: [], error } on failure
   */
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
}
