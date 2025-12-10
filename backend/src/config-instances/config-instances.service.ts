// backend/src/config-instances/config-instances.service.ts

import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ConfigInstanceEntity } from "./config-instance.entity";

import type { PreparedConfigInstance } from "./config-instance.types";
import type {
  ConfigFileBinding,
  InstanceFileMapping,
} from "./config-file-mapping.types";
import type {
  ConfigFileContentSurface,
  InstanceContentSurface,
} from "./config-content-surface.types";

import { ModulesService } from "../modules/modules.service";
import type { ModuleCatalogEntry } from "../modules/catalog/module-catalog.types";

/**
 * Public-facing list item (Step 14)
 */
export interface FormattedConfigInstanceItem {
  id: string;
  moduleName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public-facing formatted result (Step 14)
 */
export interface FormattedConfigInstanceResult {
  userId: string;
  count: number;
  items: FormattedConfigInstanceItem[];
}

@Injectable()
export class ConfigInstancesService {
  constructor(
    @InjectRepository(ConfigInstanceEntity)
    private readonly repo: Repository<ConfigInstanceEntity>,
    private readonly modulesService: ModulesService,
  ) {}

  // ---------------------------
  // CRUD OPERATIONS
  // ---------------------------

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

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  findById(id: string): Promise<ConfigInstanceEntity | null> {
    return this.repo.findOne({ where: { id } }) as Promise<ConfigInstanceEntity | null>;
  }

  findAllForUser(userId: string): Promise<ConfigInstanceEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  // ---------------------------
  // FORMATTED LIST OUTPUT (Step 14)
  // ---------------------------

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

  // ---------------------------
  // PREPARED CONFIG INSTANCE (Step 20)
  // ---------------------------

  async prepareConfigInstance(id: string): Promise<PreparedConfigInstance> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    const catalog = await this.modulesService.listModules();

    const matchedModule: ModuleCatalogEntry | undefined = catalog.find(
      (entry) => entry.name === instance.moduleName,
    );

    if (!matchedModule) {
      throw new NotFoundException("Module not found");
    }

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

    return {
      id: instance.id,
      userId: instance.userId,
      moduleName: instance.moduleName,
      configData: instance.configData,
      moduleMeta,
    };
  }

  // ---------------------------
  // FILE MAPPING (Step 21)
  // ---------------------------

  async mapConfigFiles(id: string): Promise<InstanceFileMapping> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    const catalog = await this.modulesService.listModules();

    const moduleEntry: ModuleCatalogEntry | undefined = catalog.find(
      (m) => m.name === instance.moduleName,
    );

    if (!moduleEntry) {
      throw new NotFoundException("Module not found");
    }

    const files: ConfigFileBinding[] = moduleEntry.configFiles.map((cf) => ({
      fileId: cf.id,
      path: cf.path,
      format: cf.format,
      required: cf.required,
      metadata: cf.metadata as Record<string, any> | undefined,
    }));

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files,
    };
  }

  // ---------------------------
  // CONTENT SURFACE (Step 22)
  // ---------------------------

  async buildContentSurface(id: string): Promise<InstanceContentSurface> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    const catalog = await this.modulesService.listModules();

    const moduleEntry: ModuleCatalogEntry | undefined = catalog.find(
      (m) => m.name === instance.moduleName,
    );

    if (!moduleEntry) {
      throw new NotFoundException("Module not found");
    }

    const files: ConfigFileContentSurface[] = moduleEntry.configFiles.map((cf) => ({
      fileId: cf.id,
      path: cf.path,
      format: cf.format,
      required: cf.required,
      metadata: cf.metadata as Record<string, any> | undefined,
      content: null, // ALWAYS null in Step 22
    }));

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files,
    };
  }
}
