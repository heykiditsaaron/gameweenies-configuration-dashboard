// backend/src/database/database.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ENV_CONFIG } from "../config/environment.token";
import type { EnvironmentConfig } from "../config/environment.config";
import { UserEntity } from "../users/user.entity";
import { ConfigInstanceEntity } from "../config-instances/config-instance.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ENV_CONFIG],
      useFactory: (config: EnvironmentConfig) => {
        const db = config.database;

        return {
          type: "postgres",
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: [UserEntity, ConfigInstanceEntity],
          synchronize: false,
          autoLoadEntities: false,
          migrations: [],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
