// backend/src/config-instances/config-instances.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigInstanceEntity } from "./config-instance.entity";

/**
 * ConfigInstancesService
 *
 * Basic CRUD persistence for configuration instances.
 * No validation, merging, or remote application logic is performed here.
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
}
