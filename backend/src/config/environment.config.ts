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

export interface DatabaseConfig {
  type: "postgres";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
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

  database: DatabaseConfig;
}

/** Loads environment variables + safe defaults */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV ?? "development";
  const host = process.env.HOST ?? "0.0.0.0";
  const port = parseNumber(process.env.PORT, 3000);
  const trustProxy = parseBoolean(process.env.TRUST_PROXY, false);

  // --- SFTP ---
  const sftpEnv = process.env.SFTP_SERVERS;
  const sftp: SftpConfig = validateSftpConfig(sftpEnv);

  // --- DATABASE (safe defaults, never throw) ---
  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = parseNumber(process.env.DB_PORT, 5432);
  const dbUser = process.env.DB_USER ?? "postgres";
  const dbPass = process.env.DB_PASSWORD ?? "";
  const dbName = process.env.DB_NAME ?? "appdb";

  const database: DatabaseConfig = {
    type: "postgres",
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPass,
    database: dbName,
  };

  return {
    app: { env, host, port, trustProxy },
    sftp,
    database,
  };
}

/** True if running in production */
export function isProduction(): boolean {
  return (process.env.NODE_ENV ?? "").toLowerCase() === "production";
}
