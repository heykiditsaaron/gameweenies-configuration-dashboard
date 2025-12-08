// backend/src/config/sftp/sftp.validate.ts

import type { SftpCredential, SftpConfig, SftpValidationResult } from "./sftp.types";

/**
 * Validate a single SFTP credential object.
 */
function validateSingleCredential(raw: any): SftpValidationResult {
  const errors: string[] = [];

  const id = typeof raw?.id === "string" ? raw.id : null;
  const host = typeof raw?.host === "string" ? raw.host : null;
  const port = raw?.port;
  const username = typeof raw?.username === "string" ? raw.username : null;
  const authMode = typeof raw?.authMode === "string" ? raw.authMode : null;

  if (!id) errors.push("Missing or invalid 'id'.");
  if (!host) errors.push("Missing or invalid 'host'.");
  if (!username) errors.push("Missing or invalid 'username'.");
  if (!authMode) errors.push("Missing or invalid 'authMode'.");

  // SAFER PORT VALIDATION — no more TS null warnings
  const numeric = Number(port ?? NaN);
  if (isNaN(numeric) || numeric < 1 || numeric > 65535) {
    errors.push("Port must be a number between 1–65535.");
  }

  return {
    id: id ?? "unknown",
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate the full SFTP_SERVERS environment variable.
 */
export function validateSftpConfig(envValue: string | undefined): SftpConfig {
  if (!envValue || envValue.trim() === "") {
    return {
      servers: [],
      validation: { hasErrors: false, results: [] },
    };
  }

  let parsed: any;

  try {
    parsed = JSON.parse(envValue);
  } catch (err: any) {
    return {
      servers: [],
      validation: {
        hasErrors: true,
        results: [
          {
            id: "invalid-json",
            valid: false,
            errors: [`Invalid JSON: ${err.message}`],
          },
        ],
      },
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      servers: [],
      validation: {
        hasErrors: true,
        results: [
          {
            id: "invalid-format",
            valid: false,
            errors: ["SFTP_SERVERS must be a JSON array."],
          },
        ],
      },
    };
  }

  const results: SftpValidationResult[] = [];
  const servers: SftpCredential[] = [];

  for (const raw of parsed) {
    const result = validateSingleCredential(raw);

    results.push(result);

    if (result.valid) {
      servers.push(raw as SftpCredential);
    }
  }

  return {
    servers,
    validation: {
      hasErrors: results.some((r) => !r.valid),
      results,
    },
  };
}
