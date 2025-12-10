// backend/src/config-instances/config-file-mapping.types.ts

/**
 * Internal structural representation of a module config file binding.
 *
 * NOTE (Step 21):
 * - Types only, no logic.
 * - These do NOT represent file contents, only structural descriptors.
 */
export interface ConfigFileBinding {
  fileId: string; // from moduleCatalog.configFiles.id
  path: string;
  format: string;
  required: boolean;
  metadata?: Record<string, any>;
}

/**
 * Represents the full config-file mapping between a ConfigInstance
 * and its module’s declared config files.
 */
export interface InstanceFileMapping {
  configInstanceId: string;
  moduleName: string;
  files: ConfigFileBinding[];
}
