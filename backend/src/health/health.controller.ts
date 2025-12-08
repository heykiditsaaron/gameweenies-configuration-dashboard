// backend/src/health.controller.ts

/**
 * Simple health check controller.
 *
 * Returns:
 *   { status: "ok" }
 *
 * More fields may be added during future observability tasks.
 */

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: Date.now(),
    };
  }
}
