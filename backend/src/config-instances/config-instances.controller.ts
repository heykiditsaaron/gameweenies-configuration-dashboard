// backend/src/config-instances/config-instances.controller.ts

import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
} from "@nestjs/common";

import { ConfigInstancesService } from "./config-instances.service";

@Controller("config-instances")
export class ConfigInstancesController {
  constructor(private readonly configInstances: ConfigInstancesService) {}

  // ... existing CRUD & simulate-apply endpoints ...

  /**
   * STEP 25:
   * Consolidated read-only apply summary endpoint.
   *
   * GET /config-instances/:id/apply-summary
   *
   * - No request body.
   * - Returns structural aggregation from service.
   * - Errors propagate normally (NotFoundException).
   */
  @Get(":id/apply-summary")
  async getApplySummary(@Param("id") id: string) {
    return this.configInstances.buildApplySummary(id);
  }
}
