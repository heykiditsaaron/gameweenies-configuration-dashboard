// backend/src/app.module.ts

import { Module } from "@nestjs/common";

// existing imports...
import { SystemModule } from "./system/system.module";

@Module({
  imports: [
    // ...existing modules
    SystemModule,
  ],
  controllers: [
    // existing controllers
  ],
  providers: [
    // existing providers
  ],
})
export class AppModule {}
