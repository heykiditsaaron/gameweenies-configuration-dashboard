// backend/src/config-instances/config-instances.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigInstanceEntity } from "./config-instance.entity";

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

/**
 * ConfigInstancesService
 *
 * CRUD persistence for configuration instances.
 * Step 14 adds: findAllForUserFormatted() for response normalization.
 */
@Injectable()
export class ConfigInstancesService {
  constructor(
    @InjectRepository(ConfigInstanceEntity)
    private readonly repo: Repository<ConfigInstanceEntity>,
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
   * NEW IN STEP 14:
   * Returns a formatted representation of config instances for the user.
   * No configData is exposed.
   */
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
}
