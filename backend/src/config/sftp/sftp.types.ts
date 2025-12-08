// backend/src/config/sftp/sftp.types.ts

/**
 * A single SFTP server credential.
 * These values come from parsed JSON in SFTP_SERVERS.
 */
export interface SftpCredential {
  id: string;
  host: string;
  port: number;
  username: string;
  authMode: "password" | "privateKey";
  password?: string;
  privateKey?: string;
  privateKeyPath?: string;
  passphrase?: string;
}

/**
 * Validation result for a single SFTP credential.
 *
 * Must match what sftp.validate.ts produces.
 */
export interface SftpValidationResult {
  /** The server ID or a fallback such as "invalid-json" */
  id: string;

  /** True when no validation errors were found */
  valid: boolean;

  /** List of validation error messages */
  errors: string[];
}

/**
 * Final validated SFTP configuration returned by validateSftpConfig().
 *
 * This structure is used inside EnvironmentConfig.
 */
export interface SftpConfig {
  /** Only valid server entries appear here */
  servers: SftpCredential[];

  /** Full validation summary for all entries */
  validation: {
    hasErrors: boolean;
    results: SftpValidationResult[];
  };
}
