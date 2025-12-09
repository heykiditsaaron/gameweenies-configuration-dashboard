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
import { ConfigInstancesService } from "../config-instances/config-instances.service";

/**
 * UsersModulesController
 *
 * Step 12 originally: GET /users/:id/modules (module list)
 * Step 14 adds new refinement for:
 *
 *    GET /users/:id/config-instances
 *
 * providing a normalized response shape for stored user config instances.
 */
@Controller()
export class UsersModulesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly modulesService: ModulesService,
    private readonly configInstancesService: ConfigInstancesService,
  ) {}

  // -----------------------------------------
  // (Existing Step 12 Route)
  // GET /users/:id/modules
  // -----------------------------------------
  @Get("users/:id/modules")
  async getUserModules(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException({ error: "User not found" });
    }

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

  // -----------------------------------------
  // NEW IN STEP 14:
  // GET /users/:id/config-instances
  // -----------------------------------------
  @Get("users/:id/config-instances")
  async getUserConfigInstances(@Param("id") id: string) {
    // 1. Ensure the user exists
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 2. Return normalized list from the service
    return this.configInstancesService.findAllForUserFormatted(id);
  }
}
