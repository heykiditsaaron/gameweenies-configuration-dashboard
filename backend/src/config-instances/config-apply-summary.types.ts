// backend/src/config-instances/config-apply-summary.types.ts

export interface InstanceApplySummary {
  configInstanceId: string;
  moduleName: string;

  prepared: any;
  mapping: any;
  surface: any;
  simulated: any;

  readiness: any;
}
