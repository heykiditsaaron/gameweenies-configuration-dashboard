/**
 * System-wide configuration shape consumed by services.
 * This is the typed, normalized output of environment.config.ts
 */

export interface SystemConfig {
  app: {
    port: number;
    host: string;
    trustProxy: number | boolean;
    nodeEnv: "development" | "production" | "test";
  };

  // SFTP configuration block introduced in Task 3.1 Step 4
  sftp: {
    servers: SftpCredential[];
    validation: {
      valid: boolean;
      errors: string[];
    };
  };
}

/**
 * The SFTP credential structure defined in Step 4
 */
export interface SftpCredential {
  host: string;
  port: number;
  username: string;
  authMode: "password" | "privateKey";
  password?: string;
  privateKey?: string;
  privateKeyPath?: string;
  passphrase?: string;
}
