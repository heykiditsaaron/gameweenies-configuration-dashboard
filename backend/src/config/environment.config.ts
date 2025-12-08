// backend/src/config/environment.config.ts
import { SystemConfig, SftpCredential, SftpValidationResult } from "./config.types";

/**
 * Safe integer parser with fallback.
 */
function parseNumber(val: string | undefined, fallback: number): number {
  if (!val) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Boolean parser accepting "true", "1", "yes".
 */
function parseBoolean(val: string | undefined, fallback: boolean): boolean {
  if (!val) return fallback;
  return ["true", "1", "yes"].includes(val.toLowerCase());
}

/**
 * Validates an SFTP credential object.
 */
function validateSftpCredential(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!obj) {
    return { valid: false, errors: ["Entry is null or undefined"] };
  }

  if (typeof obj.host !== "string") errors.push("host must be a string");
  if (typeof obj.port !== "number") errors.push("port must be a number");
  if (typeof obj.username !== "string") errors.push("username must be a string");

  if (obj.authMode !== "password" && obj.authMode !== "privateKey") {
    errors.push("authMode must be 'password' or 'privateKey'");
  }

  if (obj.authMode === "password" && typeof obj.password !== "string") {
    errors.push("password must be provided for password auth");
  }

  if (obj.authMode === "privateKey") {
    if (!obj.privateKey && !obj.privateKeyPath) {
      errors.push("privateKey or privateKeyPath must be provided for privateKey auth");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parse SFTP_SERVERS JSON safely.
 */
function loadSftpConfig(): {
  servers: SftpCredential[];
  validation: SftpValidationResult;
} {
  const raw = process.env.SFTP_SERVERS;
  if (!raw) {
    return {
      servers: [],
      validation: { valid: true, errors: [] },
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        servers: [],
        validation: { valid: false, errors: ["SFTP_SERVERS must be an array"] },
      };
    }

    const servers: SftpCredential[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const r = validateSftpCredential(parsed[i]);
      if (!r.valid) {
        errors.push(`Entry #${i}: ${r.errors.join(", ")}`);
      } else {
        servers.push(parsed[i]);
      }
    }

    return {
      servers,
      validation: {
        valid: errors.length === 0,
        errors,
      },
    };
  } catch (err: any) {
    return {
      servers: [],
      validation: {
        valid: false,
        errors: ["Invalid JSON in SFTP_SERVERS: " + err.message],
      },
    };
  }
}

/**
 * Final environment loader.
 * Produces a fully typed SystemConfig.
 */
export function getEnvironmentConfig(): SystemConfig {
  const sftp = loadSftpConfig();

  return {
    port: parseNumber(process.env.PORT, 3000),
    host: process.env.HOST || "127.0.0.1",
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
    nodeEnv: process.env.NODE_ENV || "development",

    sftp,
  };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
