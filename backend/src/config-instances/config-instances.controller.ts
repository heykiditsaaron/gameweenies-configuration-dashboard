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

  // ... existing CRUD, simulate-apply, apply-summary, apply-readiness endpoints ...

  /**
   * STEP 28:
   * PUBLIC ENDPOINT — Full Apply Pipeline Summary.
   *
   * GET /config-instances/:id/apply-pipeline-summary
   *
   * NOTE:
   * - No body
   * - No DTO
   * - Pass-through only
   * - No wrapping or transformation of output
   * - Errors propagate unchanged
   */
  @Get(":id/apply-pipeline-summary")
  async getFullApplyPipelineSummary(@Param("id") id: string) {
    return this.configInstances.buildFullApplyPipelineSummary(id);
  }
}
