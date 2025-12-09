// backend/src/users/user.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type UserRole = "deployer" | "admin" | "user";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: false })
  passwordHash!: string;

  @Column({ type: "varchar" })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  isActive!: boolean; // <-- Added per Main Brain decision (OPTION A)

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
