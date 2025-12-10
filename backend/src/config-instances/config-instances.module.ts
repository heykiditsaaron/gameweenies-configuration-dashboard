// backend/src/config-instances/config-instances.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ConfigInstanceEntity } from "./config-instance.entity";
import { ConfigInstancesService } from "./config-instances.service";
import { ConfigInstancesController } from "./config-instances.controller";
import { ModulesModule } from "../modules/modules.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfigInstanceEntity]),
    ModulesModule,
  ],
  controllers: [ConfigInstancesController],
  providers: [ConfigInstancesService],
  exports: [ConfigInstancesService],
})
export class ConfigInstancesModule {}
