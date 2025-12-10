// backend/src/config-instances/config-apply-sim.types.ts

/**
 * Represents a structural placeholder for a file that would be applied
 * during a real configuration deployment.
 *
 * STEP 23:
 * - No real content.
 * - No SFTP / filesystem interaction.
 * - simulatedContent MUST always be null.
 */
export interface SimulatedAppliedFile {
  fileId: string;
  path: string;
  format: string;
  required: boolean;
  metadata?: Record<string, any>;
  simulatedContent: any | null; // ALWAYS null in Step 23
}

/**
 * A purely structural placeholder describing the result of a simulated apply
 * operation. No real application occurs.
 */
export interface SimulatedApplyResult {
  configInstanceId: string;
  moduleName: string;
  files: SimulatedAppliedFile[];
  status: "simulated";
  message: string; // e.g. "Apply pipeline stub executed"
}
