// backend/src/config-instances/config-instances.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { ConfigInstancesService } from "./config-instances.service";
import type { ConfigInstanceEntity } from "./config-instance.entity";

interface CreateConfigInstanceBody {
  userId: string;
  moduleName: string;
  configData: any;
}

interface UpdateConfigInstanceBody {
  configData: any;
}

@Controller("config-instances")
export class ConfigInstancesController {
  constructor(
    private readonly configInstances: ConfigInstancesService,
  ) {}

  /**
   * POST /config-instances
   *
   * Creates a new config instance with raw JSON configData.
   */
  @Post()
  async create(
    @Body() body: CreateConfigInstanceBody,
  ): Promise<ConfigInstanceEntity> {
    const { userId, moduleName, configData } = body;

    if (!userId || !moduleName) {
      throw new BadRequestException("userId and moduleName are required");
    }

    return this.configInstances.create(userId, moduleName, configData);
  }

  /**
   * GET /config-instances/:id
   *
   * Returns a single config instance.
   */
  @Get(":id")
  async getOne(
    @Param("id") id: string,
  ): Promise<ConfigInstanceEntity> {
    const instance = await this.configInstances.findById(id);
    if (!instance) {
      throw new NotFoundException("Config instance not found");
    }
    return instance;
  }

  /**
   * STEP 31: Ensure structural mapping endpoint exists.
   *
   * GET /config-instances/:id/files
   *
   * Returns structural file mapping produced by mapConfigFiles().
   */
  @Get(":id/files")
  async getFileMapping(@Param("id") id: string) {
    return this.configInstances.mapConfigFiles(id);
  }

  /**
   * STEP 31: Ensure structural content surface endpoint exists.
   *
   * GET /config-instances/:id/content-surface
   *
   * Returns structural content surface (with content = null) produced
   * by buildContentSurface().
   */
  @Get(":id/content-surface")
  async getContentSurface(@Param("id") id: string) {
    return this.configInstances.buildContentSurface(id);
  }

  /**
   * PATCH /config-instances/:id
   *
   * Updates the raw configData for the instance.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateConfigInstanceBody,
  ): Promise<ConfigInstanceEntity> {
    if (body.configData === undefined) {
      throw new BadRequestException("configData is required");
    }

    const updated = await this.configInstances.update(id, body.configData);
    if (!updated) {
      throw new NotFoundException("Config instance not found");
    }
    return updated;
  }

  /**
   * DELETE /config-instances/:id
   *
   * Deletes a config instance structurally.
   */
  @Delete(":id")
  async delete(
    @Param("id") id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.configInstances.delete(id);
    if (!success) {
      throw new NotFoundException("Config instance not found");
    }
    return { success: true };
  }

  /**
   * POST /config-instances/:id/simulate-apply
   *
   * Exposes the simulated apply pipeline.
   */
  @Post(":id/simulate-apply")
  async simulateApply(@Param("id") id: string) {
    return this.configInstances.simulateApply(id);
  }

  /**
   * GET /config-instances/:id/apply-summary
   *
   * Returns the structural apply summary.
   */
  @Get(":id/apply-summary")
  async getApplySummary(@Param("id") id: string) {
    return this.configInstances.buildApplySummary(id);
  }

  /**
   * GET /config-instances/:id/apply-readiness
   *
   * Returns structural readiness info based on required file presence.
   */
  @Get(":id/apply-readiness")
  async getApplyReadiness(@Param("id") id: string) {
    return this.configInstances.getApplyReadiness(id);
  }

  /**
   * GET /config-instances/:id/apply-pipeline-summary
   *
   * Returns fully aggregated structural apply pipeline summary.
   */
  @Get(":id/apply-pipeline-summary")
  async getFullApplyPipelineSummary(@Param("id") id: string) {
    return this.configInstances.buildFullApplyPipelineSummary(id);
  }
}
