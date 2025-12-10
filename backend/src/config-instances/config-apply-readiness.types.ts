// backend/src/config-instances/config-apply-readiness.types.ts

/**
 * STEP 26:
 * Structural apply-readiness result.
 *
 * Only checks whether all required config files defined by the module
 * are present in the structural mapping. No content, schema, IO, or SFTP checks.
 */
export interface ApplyReadinessResult {
  configInstanceId: string;
  moduleName: string;
  ready: boolean;
  missingRequiredFiles: string[];
}
