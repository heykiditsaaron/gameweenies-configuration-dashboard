// backend/src/modules/module-defaults.bridge.ts

import { generateDefaultConfig } from "../../../schemas/core/config-generator";
import type { ModuleBridgeError } from "./module-loader.bridge";

export interface ModuleDefaultsBridgeResult {
  config: unknown | null;
  errors: ModuleBridgeError[];
}

function normalizeError(error: unknown): ModuleBridgeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      cause: error,
    };
  }

  return {
    message: "Unknown error while generating default config.",
    cause: error,
  };
}

/**
 * Bridge wrapper around Phase 2 generateDefaultConfig.
 *
 * - Does not transform the config returned by generateDefaultConfig.
 * - Normalizes errors into a structured ModuleDefaultsBridgeResult.
 */
export async function generateDefaultConfigBridge(
  moduleDef: unknown
): Promise<ModuleDefaultsBridgeResult> {
  try {
    const config = await generateDefaultConfig(moduleDef as any);
    return {
      config,
      errors: [],
    };
  } catch (error) {
    return {
      config: null,
      errors: [normalizeError(error)],
    };
  }
}
