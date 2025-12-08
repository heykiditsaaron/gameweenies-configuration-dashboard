// backend/src/modules/module-discovery.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  loadAllModulesBridge,
  type ModuleBridgeError,
} from "./module-loader.bridge";
import { generateDefaultConfigBridge } from "./module-defaults.bridge";

export interface ModuleStatus {
  id: string;
  hasDefaultConfig: boolean;
  errors: ModuleBridgeError[];
}

@Injectable()
export class ModuleDiscoveryService implements OnModuleInit {
  private readonly modules: unknown[] = [];
  private readonly defaultsById = new Map<string, unknown>();
  private readonly statusById = new Map<string, ModuleStatus>();
  private readonly warnings: ModuleBridgeError[] = [];

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const loadResult = await loadAllModulesBridge();

    if (loadResult.errors.length > 0) {
      this.warnings.push(...loadResult.errors);
    }

    const rawModules = loadResult.modules;
    const modulesArray: unknown[] = Array.isArray(rawModules) ? rawModules : [];

    for (const moduleDef of modulesArray) {
      const idValue = (moduleDef as { id?: unknown }).id;

      if (typeof idValue !== "string" || idValue.trim() === "") {
        this.warnings.push({
          message: "Encountered module without a valid 'id' property; skipping.",
          stack: undefined,
          cause: moduleDef,
        });
        continue;
      }

      const id = idValue.trim();
      this.modules.push(moduleDef);

      const defaultsResult = await generateDefaultConfigBridge(moduleDef);

      if (defaultsResult.errors.length > 0) {
        this.warnings.push(
          ...defaultsResult.errors.map((error) => ({
            ...error,
            message: `[${id}] ${error.message}`,
          }))
        );
      }

      const hasDefaultConfig =
        defaultsResult.config !== null && defaultsResult.config !== undefined;

      const status: ModuleStatus = {
        id,
        hasDefaultConfig,
        errors: defaultsResult.errors,
      };

      this.statusById.set(id, status);

      if (hasDefaultConfig) {
        this.defaultsById.set(id, defaultsResult.config as unknown);
      }
    }
  }

  getModules(): unknown[] {
    return [...this.modules];
  }

  getModuleDefaults(id: string): unknown | undefined {
    return this.defaultsById.get(id);
  }

  getModuleStatus(id: string): ModuleStatus | undefined {
    return this.statusById.get(id);
  }

  getWarnings(): ModuleBridgeError[] {
    return [...this.warnings];
  }
}
