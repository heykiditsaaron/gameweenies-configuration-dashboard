// backend/src/config-instances/config-instances.controller.ts

import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  NotFoundException,
} from "@nestjs/common";
import { ConfigInstancesService } from "./config-instances.service";

@Controller("config-instances")
export class ConfigInstancesController {
  constructor(private readonly configInstances: ConfigInstancesService) {}

  // Existing endpoints such as POST /config-instances, GET /config-instances/:id, etc.

  /**
   * STEP 24:
   * Public endpoint exposing the simulated apply pipeline.
   *
   * - No request body
   * - No transformations
   * - Direct pass-through to service.simulateApply()
   * - Errors propagate normally (NotFoundException)
   */
  @Post(":id/simulate-apply")
  async simulateApply(@Param("id") id: string) {
    return this.configInstances.simulateApply(id);
  }
}
