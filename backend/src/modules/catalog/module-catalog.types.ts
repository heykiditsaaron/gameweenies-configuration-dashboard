// backend/src/modules/catalog/module-catalog.types.ts

/**
 * Deployment tier for modules.
 *
 * - "mvp"     → available in the base tier
 * - "premium" → available only in premium tier (metadata-only at this stage)
 */
export type DeploymentTier = "mvp" | "premium";

/**
 * Raw representation of a module config file as produced by the loader layer.
 *
 * This mirrors the shape coming from Phase 2 / the schema loader,
 * and may contain loader-specific details. It is NOT normalized and
 * may differ across loader implementations.
 */
export interface RawModuleConfigFile {
  /** Path relative to the module root, e.g. "config/default.json" */
  path: string;

  /** Optional human-readable description. */
  description?: string;

  /** Format identifier, e.g. "json", "yaml", etc. */
  format: string;

  /** Optional flag indicating if this file is required by the module. */
  required?: boolean;

  /** Arbitrary metadata passed through from the loader. */
  metadata?: Record<string, unknown>;
}

/**
 * Raw representation of a module descriptor as produced by the loader layer.
 *
 * This is the direct contract from Phase 2 to Phase 3 before normalization.
 */
export interface RawModuleDescriptor {
  /** Unique identifier for the module within the loader ecosystem. */
  id: string;

  /** Canonical module name (may be the same as id). */
  name: string;

  /** Optional human-friendly display name. */
  displayName?: string;

  /** Optional description copy. */
  description?: string;

  /** Optional semver-like version string. */
  version?: string;

  /** Optional tier identifier, passthrough from loader. */
  tier?: string;

  /** Optional list of tags or keywords. */
  tags?: string[];

  /** Raw config file descriptors, straight from the loader. */
  configFiles?: RawModuleConfigFile[];

  /** Loader-specific metadata, kept opaque to the catalog. */
  metadata?: Record<string, unknown>;
}

/**
 * Normalized representation of a single configuration file for a module.
 *
 * This type is the internal, backend-facing view of a config file,
 * derived from RawModuleConfigFile.
 */
export interface ModuleConfigFileDescriptor {
  /** Stable identifier for this config file within the module. */
  id: string;

  /** Path relative to the module root, e.g. "config/default.json". */
  path: string;

  /** Format identifier, e.g. "json", "yaml", etc. */
  format: string;

  /** True if this file is required for the module to function. */
  required: boolean;

  /** Optional human-readable description. */
  description?: string;

  /** Opaque metadata carried over from the raw descriptor. */
  metadata?: Record<string, unknown>;
}

/**
 * Canonical catalog entry for a single module within the backend.
 *
 * This is the primary type the rest of the backend should consume when
 * working with modules (listing, selection, etc.).
 */
export interface ModuleCatalogEntry {
  /** Stable module identifier. */
  id: string;

  /** Canonical module name. */
  name: string;

  /** Human-facing display name (falls back to name if missing). */
  displayName: string;

  /** Optional description describing the module. */
  description?: string;

  /** Optional version string. */
  version?: string;

  /** Deployment tier for this module. */
  tier: DeploymentTier;

  /** Normalized config files associated with this module. */
  configFiles: ModuleConfigFileDescriptor[];

  /** Optional tags or keywords. */
  tags: string[];

  /**
   * The original raw descriptor as produced by the loader layer.
   * Kept for debugging and advanced use cases.
   */
  raw: RawModuleDescriptor;
}

/**
 * A module catalog is simply a list of modules.
 */
export type ModuleCatalog = ModuleCatalogEntry[];
