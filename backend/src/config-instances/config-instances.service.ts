// backend/src/config-instances/config-instances.service.ts

import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ConfigInstanceEntity } from "./config-instance.entity";

import type { PreparedConfigInstance } from "./config-instance.types";
import type { InstanceFileMapping } from "./config-file-mapping.types";
import type { InstanceContentSurface } from "./config-content-surface.types";
import type { SimulatedApplyResult } from "./config-apply-sim.types";
import type { InstanceApplySummary } from "./config-apply-summary.types";
import type { ApplyReadinessResult } from "./config-apply-readiness.types";

import { ModulesService } from "../modules/modules.service";
import type { ModuleCatalogEntry } from "../modules/catalog/module-catalog.types";

@Injectable()
export class ConfigInstancesService {
  constructor(
    @InjectRepository(ConfigInstanceEntity)
    private readonly repo: Repository<ConfigInstanceEntity>,
    private readonly modulesService: ModulesService,
  ) {}

  // ---------------------------------------------------------
  // BASIC CRUD
  // ---------------------------------------------------------

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
    if (!existing) return null;

    existing.configData = configData;
    return this.repo.save(existing);
  }

  findById(id: string): Promise<ConfigInstanceEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAllForUser(userId: string): Promise<ConfigInstanceEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // ---------------------------------------------------------
  // FORMATTED LISTING (Step 14)
  // ---------------------------------------------------------

  async findAllForUserFormatted(userId: string): Promise<{
    userId: string;
    count: number;
    items: Array<{
      id: string;
      moduleName: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }> {
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

  // ---------------------------------------------------------
  // prepareConfigInstance (Step 20)
  // ---------------------------------------------------------

  async prepareConfigInstance(id: string): Promise<PreparedConfigInstance> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    const catalog = await this.modulesService.listModules();

    const entry: ModuleCatalogEntry | undefined = catalog.find(
      (m) => m.name === instance.moduleName,
    );

    if (!entry) {
      throw new NotFoundException("Module not found");
    }

    const moduleMeta: PreparedConfigInstance["moduleMeta"] = {
      id: entry.id,
      name: entry.name,
      displayName: entry.displayName,
      version: entry.version,
      description: entry.description,
      tags: entry.tags,
      tier: entry.tier,
      configFiles: entry.configFiles.map((f) => ({
        id: f.id,
        path: f.path,
        format: f.format,
        required: f.required,
        metadata: f.metadata as Record<string, any> | undefined,
      })),
    };

    return {
      id: instance.id,
      userId: instance.userId,
      moduleName: instance.moduleName,
      configData: instance.configData,
      moduleMeta,
    };
  }

  // ---------------------------------------------------------
  // mapConfigFiles (Step 21)
  // ---------------------------------------------------------

  async mapConfigFiles(id: string): Promise<InstanceFileMapping> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();

    const entry = catalog.find((m) => m.name === instance.moduleName);
    if (!entry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files: entry.configFiles.map((f) => ({
        fileId: f.id,
        path: f.path,
        format: f.format,
        required: f.required,
        metadata: f.metadata as Record<string, any> | undefined,
      })),
    };
  }

  // ---------------------------------------------------------
  // buildContentSurface (Step 22)
  // ---------------------------------------------------------

  async buildContentSurface(id: string): Promise<InstanceContentSurface> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const entry = catalog.find((m) => m.name === instance.moduleName);
    if (!entry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      files: entry.configFiles.map((f) => ({
        fileId: f.id,
        path: f.path,
        format: f.format,
        required: f.required,
        metadata: f.metadata as Record<string, any> | undefined,
        content: null,
      })),
    };
  }

  // ---------------------------------------------------------
  // simulateApply (Step 23)
  // ---------------------------------------------------------

  async simulateApply(id: string): Promise<SimulatedApplyResult> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const catalog = await this.modulesService.listModules();
    const entry = catalog.find((m) => m.name === instance.moduleName);
    if (!entry) throw new NotFoundException("Module not found");

    return {
      configInstanceId: instance.id,
      moduleName: instance.moduleName,
      status: "simulated",
      message: "Apply pipeline stub executed",
      files: entry.configFiles.map((f) => ({
        fileId: f.id,
        path: f.path,
        format: f.format,
        required: f.required,
        metadata: f.metadata as Record<string, any> | undefined,
        simulatedContent: null,
      })),
    };
  }

  // ---------------------------------------------------------
  // buildApplySummary (Step 25)
  // ---------------------------------------------------------

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
      readiness: await this.getApplyReadiness(id),
    };
  }

  // ---------------------------------------------------------
  // getApplyReadiness (Step 26)
  // ---------------------------------------------------------

  async getApplyReadiness(id: string): Promise<ApplyReadinessResult> {
    const instance = await this.findById(id);
    if (!instance) throw new NotFoundException("Config instance not found");

    const mapping = await this.mapConfigFiles(id);
    const catalog = await this.modulesService.listModules();

    const entry = catalog.find((m) => m.name === instance.moduleName);
    if (!entry) throw new NotFoundException("Module not found");

    const mappedIds = new Set(mapping.files.map((f) => f.fileId));

    const missingRequiredFiles = entry.configFiles
      .filter((cf) => cf.required && !mappedIds.has(cf.id))
      .map((cf) => cf.id);

    return {
      configInstanceId: id,
      moduleName: instance.moduleName,
      ready: missingRequiredFiles.length === 0,
      missingRequiredFiles,
    };
  }

  // ---------------------------------------------------------
  // STEP 27 — FINAL PIPELINE SUMMARY
  // ---------------------------------------------------------

  async buildFullApplyPipelineSummary(id: string): Promise<{
    configInstanceId: string;
    moduleName: string;
    prepared: any;
    mapping: any;
    surface: any;
    simulated: any;
    readiness: any;
  }> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }

    return {
      configInstanceId: id,
      moduleName: instance.moduleName,
      prepared: await this.prepareConfigInstance(id),
      mapping: await this.mapConfigFiles(id),
      surface: await this.buildContentSurface(id),
      simulated: await this.simulateApply(id),
      readiness: await this.getApplyReadiness(id),
    };
  }
}
