// backend/src/config-instances/config-apply-readiness.types.ts

export interface ApplyReadinessResult {
  configInstanceId: string;
  moduleName: string;
  ready: boolean;
  missingRequiredFiles: string[];
}
