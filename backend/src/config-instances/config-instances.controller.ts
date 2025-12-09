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

/**
 * Shape of the POST /config-instances body.
 * configData is raw JSON; no structure enforcement.
 */
interface CreateConfigInstanceBody {
  userId: string;
  moduleName: string;
  configData: any;
}

/**
 * Shape of the PATCH /config-instances/:id body.
 * Only configData is updatable in this step.
 */
interface UpdateConfigInstanceBody {
  configData: any;
}

@Controller()
export class ConfigInstancesController {
  constructor(
    private readonly configInstances: ConfigInstancesService,
  ) {}

  /**
   * POST /config-instances
   *
   * Creates a new configuration instance.
   */
  @Post("config-instances")
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
   * Returns a single configuration instance or 404 if not found.
   */
  @Get("config-instances/:id")
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
   * GET /users/:userId/config-instances
   *
   * Returns all config instances for a given userId.
   */
  @Get("users/:userId/config-instances")
  async getForUser(
    @Param("userId") userId: string,
  ): Promise<ConfigInstanceEntity[]> {
    return this.configInstances.findAllForUser(userId);
  }

  /**
   * PATCH /config-instances/:id
   *
   * Updates the configData for a given config instance.
   */
  @Patch("config-instances/:id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateConfigInstanceBody,
  ): Promise<ConfigInstanceEntity> {
    const { configData } = body;

    if (configData === undefined) {
      throw new BadRequestException("configData is required");
    }

    const updated = await this.configInstances.update(id, configData);
    if (!updated) {
      throw new NotFoundException("Config instance not found");
    }

    return updated;
  }

  /**
   * DELETE /config-instances/:id
   *
   * Deletes a configuration instance.
   * Returns a simple success flag or 404 if not found.
   */
  @Delete("config-instances/:id")
  async delete(
    @Param("id") id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.configInstances.delete(id);
    if (!success) {
      throw new NotFoundException("Config instance not found");
    }
    return { success: true };
  }
}
