// backend/src/sftp/sftp.service.ts

import { Inject, Injectable } from "@nestjs/common";
import { ENV_CONFIG } from "../config/environment.token";
import type { EnvironmentConfig } from "../config/environment.config";
import { SftpCredential } from "../config/sftp/sftp.types";

@Injectable()
export class SftpService {
  private readonly servers: SftpCredential[];

  constructor(@Inject(ENV_CONFIG) config: EnvironmentConfig) {
    this.servers = [...config.sftp.servers];
  }

  getServers(): SftpCredential[] {
    return [...this.servers];
  }
}
