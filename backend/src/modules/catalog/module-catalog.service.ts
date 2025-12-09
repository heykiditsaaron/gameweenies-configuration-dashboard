// backend/src/modules/catalog/module-catalog.service.ts

import { Injectable } from "@nestjs/common";
import type {
  DeploymentTier,
  ModuleCatalog,
  ModuleCatalogEntry,
  ModuleConfigFileDescriptor,
  RawModuleConfigFile,
  RawModuleDescriptor,
} from "./module-catalog.types";

/**
 * ModuleCatalogService
 *
 * Structural normalization layer that converts raw loader module data into
 * the canonical ModuleCatalogEntry format.
 *
 * NOTE (Step 15):
 * - No loader bridge calls.
 * - No filesystem or database access.
 * - No HTTP endpoints.
 * - No tier gating or filtering logic.
 * - Pure structural mapping only.
 */
@Injectable()
export class ModuleCatalogService {
  /**
   * Normalizes an array of raw modules into a ModuleCatalog.
   */
  normalizeCatalog(rawModules: RawModuleDescriptor[]): ModuleCatalog {
    return rawModules.map((raw) => this.normalizeModule(raw));
  }

  /**
   * Normalizes a single raw module descriptor into a ModuleCatalogEntry.
   */
  normalizeModule(raw: RawModuleDescriptor): ModuleCatalogEntry {
    const displayName = raw.displayName ?? raw.name;
    const tags = Array.isArray(raw.tags) ? raw.tags.slice() : [];
    const tier = this.normalizeTier(raw.tier);
    const configFiles = this.normalizeConfigFiles(raw.id, raw.configFiles ?? []);

    return {
      id: raw.id,
      name: raw.name,
      displayName,
      description: raw.description,
      version: raw.version,
      tier,
      configFiles,
      tags,
      raw,
    };
  }

  /**
   * Normalizes the list of config files for a module.
   *
   * This performs only simple structural mapping, with no validation or
   * schema awareness.
   */
  normalizeConfigFiles(
    moduleId: string,
    rawFiles: RawModuleConfigFile[],
  ): ModuleConfigFileDescriptor[] {
    return rawFiles.map((file, index) => {
      const id = `${moduleId}:config:${index.toString(10)}`;

      const descriptor: ModuleConfigFileDescriptor = {
        id,
        path: file.path,
        format: file.format,
        required: file.required === true,
        description: file.description,
        metadata: file.metadata,
      };

      return descriptor;
    });
  }

  /**
   * Internal helper: normalize tier strings into a DeploymentTier.
   *
   * No gating or filtering is performed; unknown values are treated as "mvp"
   * by default for now, keeping behavior simple.
   */
  private normalizeTier(tier: string | undefined): DeploymentTier {
    if (tier === "premium") {
      return "premium";
    }
    return "mvp";
  }
}
