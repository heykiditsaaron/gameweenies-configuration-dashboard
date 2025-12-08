import { Injectable, Inject } from '@nestjs/common';

import type { SystemConfig } from '../config/config.types';
import type { SftpCredential } from '../config/environment.types';

@Injectable()
export class SftpService {
  constructor(
    @Inject('SYSTEM_CONFIG')
    private readonly systemConfig: SystemConfig
  ) {}

  getServers(): SftpCredential[] {
    return this.systemConfig.sftp.servers ?? [];
  }
}
