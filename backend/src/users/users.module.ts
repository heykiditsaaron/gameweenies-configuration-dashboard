// backend/src/users/users.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersModulesController } from "./users.modules.controller";
import { PasswordService } from "./password.service";
import { ModulesService } from "../modules/modules.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, PasswordService, ModulesService],
  controllers: [
    UsersController,
    UsersModulesController, // <-- Added new controller
  ],
  exports: [UsersService],
})
export class UsersModule {}
