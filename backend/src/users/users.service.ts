// backend/src/users/users.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import { PasswordService } from "./password.service";
import type { CreateUserDto, UpdateUserDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  findAll(): Promise<UserEntity[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } }) as Promise<UserEntity | null>;
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { email },
    }) as Promise<UserEntity | null>;
  }

  async createUser(data: CreateUserDto): Promise<UserEntity> {
    const passwordHash = await this.passwordService.hashPassword(data.password);

    const entity = this.repo.create({
      email: data.email,
      role: data.role,
      isActive: data.isActive ?? true,
      passwordHash,
    });

    return this.repo.save(entity);
  }

  /**
   * Update user logic:
   * - email updated only if provided
   * - role updated only if provided
   * - password re-hashed only if provided
   * - isActive updated only if provided
   */
  async updateUser(id: string, changes: UpdateUserDto): Promise<UserEntity | null> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;

    if (changes.email !== undefined) user.email = changes.email;
    if (changes.role !== undefined) user.role = changes.role;

    if (changes.password !== undefined && changes.password.length > 0) {
      user.passwordHash = await this.passwordService.hashPassword(changes.password);
    }

    if (changes.isActive !== undefined) {
      user.isActive = changes.isActive;
    }

    return this.repo.save(user);
  }
}
