// backend/src/main.ts

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { getEnvironmentConfig } from "./config/environment.config";

async function bootstrap() {
  const env = getEnvironmentConfig();

  // Create NestJS app in Express mode
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Reverse proxy support
  if (env.app.trustProxy) {
    app.set("trust proxy", true);
  }

  await app.listen(env.app.port, env.app.host);
  console.log(
    `Backend running at http://${env.app.host}:${env.app.port} (env: ${env.app.env})`
  );
}

bootstrap();
