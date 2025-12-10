// backend/src/config-instances/config-instances.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigInstanceEntity } from "./config-instance.entity";

import type { PreparedConfigInstance } from "./config-instance.types";
import { ModulesService } from "../modules/modules.service";
import type { ModuleCatalogEntry } from "../modules/catalog/module-catalog.types";

/**
 * Formatted list item for user-facing config-instance overviews.
 */
export interface FormattedConfigInstanceItem {
  id: string;
  moduleName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Formatted result for user config instances.
 */
export interface FormattedConfigInstanceResult {
  userId: string;
  count: number;
  items: FormattedConfigInstanceItem[];
}

/**
 * ConfigInstancesService
 *
 * CRUD persistence for configuration instances.
 * Step 14 added: findAllForUserFormatted().
 * Step 20 adds: prepareConfigInstance() for structural enrichment.
 */
@Injectable()
export class ConfigInstancesService {
  constructor(
    @InjectRepository(ConfigInstanceEntity)
    private readonly repo: Repository<ConfigInstanceEntity>,
    private readonly modulesService: ModulesService,
  ) {}

  async create(
    userId: string,
    moduleName: string,
    configData: any,
  ): Promise<ConfigInstanceEntity> {
    const entity = this.repo.create({
      userId,
      moduleName,
      configData,
    });

    return this.repo.save(entity);
  }

  async update(
    id: string,
    configData: any,
  ): Promise<ConfigInstanceEntity | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    existing.configData = configData;
    return this.repo.save(existing);
  }

  findById(id: string): Promise<ConfigInstanceEntity | null> {
    return this.repo.findOne({ where: { id } }) as Promise<ConfigInstanceEntity | null>;
  }

  findAllForUser(userId: string): Promise<ConfigInstanceEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Returns a formatted representation of config instances for the user.
   * No configData is exposed.
   */
  async findAllForUserFormatted(
    userId: string,
  ): Promise<FormattedConfigInstanceResult> {
    const list = await this.findAllForUser(userId);

    const items: FormattedConfigInstanceItem[] = list.map((ci) => ({
      id: ci.id,
      moduleName: ci.moduleName,
      createdAt: ci.createdAt.toISOString(),
      updatedAt: ci.updatedAt.toISOString(),
    }));

    return {
      userId,
      count: items.length,
      items,
    };
  }

  /**
   * NEW IN STEP 20:
   *
   * prepareConfigInstance()
   *
   * Structural enrichment only:
   *  - Loads a ConfigInstance by id.
   *  - Loads the normalized module catalog via ModulesService.listModules().
   *  - Finds the module whose name matches configInstance.moduleName.
   *  - Returns a PreparedConfigInstance combining both.
   *
   * Rules:
   *  - Throws NotFoundException("Config instance not found") if instance is missing.
   *  - Throws NotFoundException("Module not found") if catalog has no matching module.
   *  - Does NOT modify configData.
   *  - Does NOT validate or merge configData.
   *  - Does NOT perform any SFTP or schema loader operations.
   */
  async prepareConfigInstance(id: string): Promise<PreparedConfigInstance> {
    // 1. Load the config instance
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    // 2. Load the normalized module catalog
    const catalog = await this.modulesService.listModules();

    // 3. Find the module whose name matches the instance.moduleName
    const matchedModule: ModuleCatalogEntry | undefined = catalog.find(
      (entry) => entry.name === instance.moduleName,
    );

    if (!matchedModule) {
      throw new NotFoundException("Module not found");
    }

    // 4. Map matchedModule into the moduleMeta shape required by PreparedConfigInstance
    const moduleMeta: PreparedConfigInstance["moduleMeta"] = {
      id: matchedModule.id,
      name: matchedModule.name,
      displayName: matchedModule.displayName,
      version: matchedModule.version,
      description: matchedModule.description,
      configFiles: matchedModule.configFiles.map((file) => ({
        id: file.id,
        path: file.path,
        format: file.format,
        required: file.required,
        metadata: file.metadata as Record<string, any> | undefined,
      })),
      tags: matchedModule.tags,
      tier: matchedModule.tier,
    };

    // 5. Construct the prepared configuration instance
    const prepared: PreparedConfigInstance = {
      id: instance.id,
      userId: instance.userId,
      moduleName: instance.moduleName,
      configData: instance.configData,
      moduleMeta,
    };

    return prepared;
  }
}
