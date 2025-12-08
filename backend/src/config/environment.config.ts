// backend/src/config/environment.config.ts

import * as dotenv from "dotenv";
import * as process from "process";
import { SftpConfig } from "./sftp/sftp.types";
import { validateSftpConfig } from "./sftp/sftp.validate";

dotenv.config();

/** Parses a boolean-like string into a boolean */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

/** Parses a number safely */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const n = Number(value);
  return isNaN(n) ? defaultValue : n;
}

/** Base environment config interface */
export interface EnvironmentConfig {
  app: {
    env: string;
    host: string;
    port: number;
    trustProxy: boolean;
  };

  sftp: SftpConfig;
}

/** Loads environment variables + safe defaults */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV ?? "development";
  const host = process.env.HOST ?? "0.0.0.0";
  const port = parseNumber(process.env.PORT, 3000);
  const trustProxy = parseBoolean(process.env.TRUST_PROXY, false);

  /**
   * SFTP configuration:
   * - Reads SFTP_SERVERS as a JSON array of credentials.
   * - Missing / empty → treated as "no SFTP configured".
   * - Invalid JSON / malformed entries → reported via validation, never thrown.
   */
  const sftpEnv = process.env.SFTP_SERVERS;
  const sftp: SftpConfig = validateSftpConfig(sftpEnv);

  return {
    app: { env, host, port, trustProxy },
    sftp,
  };
}

/** True if running in production */
export function isProduction(): boolean {
  return (process.env.NODE_ENV ?? "").toLowerCase() === "production";
}
