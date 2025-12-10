// backend/src/config-instances/config-instance.types.ts

/**
 * PreparedConfigInstance
 *
 * Internal, enriched representation of a config instance that
 * combines raw persisted JSON with normalized module metadata.
 *
 * NOTE (Step 20):
 * - Types only, no logic.
 * - No imports from loaders or schema processors.
 * - Suitable for MVP, extensible for Premium.
 */
export interface PreparedConfigInstance {
  id: string;
  userId: string;
  moduleName: string;

  // Raw persisted JSON config
  configData: any;

  // Normalized module metadata (from ModuleCatalogEntry)
  moduleMeta: {
    id: string;
    name: string;
    displayName: string;
    version?: string;
    description?: string;
    configFiles: Array<{
      id: string;
      path: string;
      format: string;
      required: boolean;
      metadata?: Record<string, any>;
    }>;
    tags: string[];
    tier?: string;
  };
}
