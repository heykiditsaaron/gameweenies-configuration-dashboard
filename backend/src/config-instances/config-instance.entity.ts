// backend/src/config-instances/config-instance.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * ConfigInstanceEntity
 *
 * Represents a stored configuration instance for a given user and module.
 * No schema validation or module existence checks are performed here.
 */
@Entity("config_instances")
export class ConfigInstanceEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  userId!: string;

  @Column({ type: "varchar" })
  moduleName!: string;

  @Column({ type: "jsonb" })
  configData!: Record<string, any>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
