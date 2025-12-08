// backend/src/system.config.ts

/**
 * SystemConfig provides globally accessible runtime configuration
 * derived from the validated environment configuration.
 *
 * This decouples other backend services from reading process.env directly.
 */

import { EnvironmentConfig, SftpCredential } from './config/environment.config';

export interface SystemConfig {
  /**
   * Full environment configuration returned by getEnvironmentConfig().
   */
  env: EnvironmentConfig;

  /**
   * Convenience accessor for validated SFTP servers.
   *
   * These are guaranteed to be structurally valid already.
   */
  sftpServers: SftpCredential[];
}

/**
 * Build a SystemConfig object from EnvironmentConfig.
 *
 * This function is pure and does not touch network, FS, or perform I/O.
 */
export function createSystemConfig(env: EnvironmentConfig): SystemConfig {
  return {
    env,
    sftpServers: env.sftp.servers, // already validated in Step 4
  };
}
