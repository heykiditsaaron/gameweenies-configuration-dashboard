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
import type {
  SimulatedAppliedFile,
  SimulatedApplyResult,
} from "./config-apply-sim.types";
import type { InstanceApplySummary } from "./config-apply-summary.types";
import type { ApplyReadinessResult } from "./config-apply-readiness.types";

import { ModulesService } from "../modules/modules.service";
import type { ModuleCatalogEntry } from "../modules/catalog/module-catalog.types";

export interface FormattedConfigInstanceItem {
  id: string;
  moduleName: string;
  createdAt: string;
  updatedAt: string;
}

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
  // CRUD
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

  async update(id: string, configData: any): Promise<ConfigInstanceEntity | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
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
  // FORMATTED LIST (Step 14)
  // ---------------------------

  async findAllForUserFormatted(
    userId: string,
  ): Promise<FormattedConfigInstanceResult> {
    const list = await this.findAllForUser(userId);

    const items = list.map((ci) => ({
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
  // PREPARED INSTANCE (Step 20)
  // ---------------------------

  async prepareConfigInstance(id: string): Promise<PreparedConfigInstance> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const moduleEntry = catalog.find((m) => m.name === instance.moduleName);

    if (!moduleEntry) throw new NotFoundException("Module not found");

    return {
      id: instance.id,
      userId: instance.userId,
      moduleName: instance.moduleName,
      configData: instance.configData,
      moduleMeta: {
        id: moduleEntry.id,
        name: moduleEntry.name,
        displayName: moduleEntry.displayName,
        version: moduleEntry.version,
        description: moduleEntry.description,
        tags: moduleEntry.tags,
        tier: moduleEntry.tier,
        configFiles: moduleEntry.configFiles.map((cf) => ({
          id: cf.id,
          path: cf.path,
          format: cf.format,
          required: cf.required,
          metadata: cf.metadata as Record<string, any> | undefined,
        })),
      },
    };
  }

  // ---------------------------
  // FILE MAPPING (Step 21)
  // ---------------------------

  async mapConfigFiles(id: string): Promise<InstanceFileMapping> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const moduleEntry = catalog.find((m) => m.name === instance.moduleName);

    if (!moduleEntry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files: moduleEntry.configFiles.map((cf) => ({
        fileId: cf.id,
        path: cf.path,
        format: cf.format,
        required: cf.required,
        metadata: cf.metadata as Record<string, any> | undefined,
      })),
    };
  }

  // ---------------------------
  // CONTENT SURFACE (Step 22)
  // ---------------------------

  async buildContentSurface(id: string): Promise<InstanceContentSurface> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const moduleEntry = catalog.find((m) => m.name === instance.moduleName);

    if (!moduleEntry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files: moduleEntry.configFiles.map((cf) => ({
        fileId: cf.id,
        path: cf.path,
        format: cf.format,
        required: cf.required,
        metadata: cf.metadata as Record<string, any> | undefined,
        content: null,
      })),
    };
  }

  // ---------------------------
  // SIMULATED APPLY (Step 23)
  // ---------------------------

  async simulateApply(id: string): Promise<SimulatedApplyResult> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const moduleEntry = catalog.find((m) => m.name === instance.moduleName);

    if (!moduleEntry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      status: "simulated",
      message: "Apply pipeline stub executed",
      files: moduleEntry.configFiles.map((cf) => ({
        fileId: cf.id,
        path: cf.path,
        format: cf.format,
        required: cf.required,
        metadata: cf.metadata as Record<string, any> | undefined,
        simulatedContent: null,
      })),
    };
  }

  // ---------------------------
  // APPLY SUMMARY (Step 25)
  // ---------------------------

  async buildApplySummary(id: string): Promise<InstanceApplySummary> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    return {
      configInstanceId: id,
      moduleName: instance.moduleName,
      prepared: await this.prepareConfigInstance(id),
      mapping: await this.mapConfigFiles(id),
      surface: await this.buildContentSurface(id),
      simulated: await this.simulateApply(id),
    };
  }

  // ---------------------------
  // APPLY READINESS (Step 26)
  // ---------------------------

  async getApplyReadiness(id: string): Promise<ApplyReadinessResult> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const mapping = await this.mapConfigFiles(id);

    const catalog = await this.modulesService.listModules();
    const moduleEntry = catalog.find((m) => m.name === instance.moduleName);
    if (!moduleEntry) throw new NotFoundException("Module not found");

    const mappedIds = new Set(mapping.files.map((f) => f.fileId));
    const missingRequiredFiles = moduleEntry.configFiles
      .filter((cf) => cf.required && !mappedIds.has(cf.id))
      .map((cf) => cf.id);

    return {
      configInstanceId: id,
      moduleName: instance.moduleName,
      ready: missingRequiredFiles.length === 0,
      missingRequiredFiles,
    };
  }
}
