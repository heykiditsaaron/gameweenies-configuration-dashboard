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

  // ... existing endpoints: CRUD, simulate-apply, apply-summary, apply-readiness ...

  /**
   * STEP 27:
   * Full apply-pipeline summary (structural only).
   *
   * GET /config-instances/:id/apply-pipeline-summary
   *
   * - No body
   * - No DTO
   * - Returns fully aggregated structural information
   * - NotFoundException propagates unchanged
   */
  @Get(":id/apply-pipeline-summary")
  async getFullApplyPipelineSummary(@Param("id") id: string) {
    return this.configInstances.buildFullApplyPipelineSummary(id);
  }
}
