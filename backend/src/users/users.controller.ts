// backend/src/users/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import type { CreateUserDto, UpdateUserDto } from "./users.dto";
import type { UserEntity } from "./user.entity";

/**
 * Convert a UserEntity into a public-safe representation.
 * NEVER include passwordHash.
 */
function toPublicUser(user: UserEntity) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --------------------------------------
  // POST /users - Create user
  // --------------------------------------
  @Post()
  async create(@Body() dto: CreateUserDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException("email and password are required");
    }

    const user = await this.usersService.createUser(dto);
    return toPublicUser(user);
  }

  // --------------------------------------
  // GET /users - List all users (public-safe)
  // --------------------------------------
  @Get()
  async list() {
    const users = await this.usersService.findAll();
    return users.map(toPublicUser);
  }

  // --------------------------------------
  // GET /users/:id - Get user by ID
  // --------------------------------------
  @Get(":id")
  async getOne(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return toPublicUser(user);
  }

  // --------------------------------------
  // PATCH /users/:id - Update user
  // --------------------------------------
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.updateUser(id, dto);
    if (!updated) throw new NotFoundException("User not found");
    return toPublicUser(updated);
  }

  // --------------------------------------
  // DELETE /users/:id - Soft delete (isActive = false)
  // --------------------------------------
  @Delete(":id")
  async softDelete(@Param("id") id: string) {
    const updated = await this.usersService.updateUser(id, { isActive: false });
    if (!updated) throw new NotFoundException("User not found");
    return toPublicUser(updated);
  }
}
