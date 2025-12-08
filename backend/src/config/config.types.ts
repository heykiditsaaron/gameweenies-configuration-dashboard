import type { SftpCredential } from './environment.types';

export interface SystemConfig {
  port: number;
  host: string;
  trustProxy: number | boolean;

  sftp: {
    servers: SftpCredential[];
  };

  env: {
    mode: string;
    isProduction: boolean;
  };
}
