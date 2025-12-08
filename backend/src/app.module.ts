import { Module } from '@nestjs/common';

import { getEnvironmentConfig } from './config/environment.config';
import { SystemConfig } from './config/config.types';

import { SftpService } from './sftp/sftp.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const systemConfig: SystemConfig = getEnvironmentConfig();

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    SftpService,
    {
      provide: 'SYSTEM_CONFIG',
      useValue: systemConfig,
    },
  ],
})
export class AppModule {}
