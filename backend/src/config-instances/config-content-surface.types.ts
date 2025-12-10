// backend/src/config-instances/config-content-surface.types.ts

/**
 * Structural representation of module config-file content bindings.
 *
 * STEP 22:
 * - `content` MUST always be `null`.
 * - No file reading, no validation, no merging.
 * - This prepares the backend for later content operations.
 */
export interface ConfigFileContentSurface {
  fileId: string;        // Same ID from config-file mapping
  path: string;          // Same path as the module config file descriptor
  format: string;        // e.g. "json", "yaml"
  required: boolean;     // Whether the config file is required by the module
  content: any | null;   // ALWAYS null in Step 22
  metadata?: Record<string, any>;
}

/**
 * Represents the content surface for a config instance:
 * a list of config-file bindings with placeholder `null` content.
 */
export interface InstanceContentSurface {
  configInstanceId: string;
  moduleName: string;
  files: ConfigFileContentSurface[];
}
