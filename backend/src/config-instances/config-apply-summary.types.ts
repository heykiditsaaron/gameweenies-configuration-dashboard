// backend/src/config-instances/config-apply-summary.types.ts

/**
 * STEP 25:
 * Consolidated instance-apply summary type.
 *
 * NOTE:
 * - Pure type container.
 * - No schema validation.
 * - No merging.
 * - No business logic.
 * - Values are structurally aggregated from internal steps.
 */
export interface InstanceApplySummary {
  configInstanceId: string;
  moduleName: string;

  // These fields receive the results of:
  // prepareConfigInstance
  // mapConfigFiles
  // buildContentSurface
  // simulateApply
  prepared: any;
  mapping: any;
  surface: any;
  simulated: any;
}
