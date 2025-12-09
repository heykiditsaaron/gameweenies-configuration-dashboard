// backend/src/users/users.modules.controller.ts

import {
  Controller,
  Get,
  Param,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ModulesService } from "../modules/modules.service";

/**
 * UsersModulesController
 *
 * MVP placeholder for user → module associations.
 * No persistence; always returns the full module list for any existing user.
 */
@Controller("users/:id/modules")
export class UsersModulesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly modulesService: ModulesService,
  ) {}

  @Get()
  async getUserModules(@Param("id") id: string) {
    // 1. Validate user exists
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException({ error: "User not found" });
    }

    // 2. Load modules via ModulesService
    const result = await this.modulesService.getAllModules();

    if (result.error) {
      throw new InternalServerErrorException({
        error: "Module listing unavailable",
      });
    }

    return {
      userId: id,
      modules: result.modules,
    };
  }
}
