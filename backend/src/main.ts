// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Load environment config utilities
import { getEnvironmentConfig } from './config/environment.config';

// Correct import path for SftpService
import { SftpService } from './sftp/sftp.service';

async function bootstrap() {
    // Load validated environment config
    const env = getEnvironmentConfig();

    const app = await NestFactory.create(AppModule);

    /**
     * ---------------------------
     * Step 3: Lightweight Logger
     * ---------------------------
     */
    app.use((req, res, next) => {
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl || req.url} → ${duration}ms`);
        });

        next();
    });

    /**
     * ---------------------------
     * Step 3: Reverse Proxy Support
     * ---------------------------
     */
    if (typeof (app as any).set === 'function') {
        (app as any).set('trust proxy', env.trustProxy ? 1 : 0);
    }

    /**
     * ---------------------------
     * Step 3: CORS
     * ---------------------------
     */
    app.enableCors({
        origin: true,
        credentials: true,
    });

    /**
     * ---------------------------
     * Step 4: (Optional) Debug print
     * ---------------------------
     * Ensures SFTP config loads without error.
     */
    const sftp = app.get(SftpService);
    console.log('Loaded SFTP servers:', sftp.getServers());

    /**
     * ---------------------------
     * Start server
     * ---------------------------
     */
    await app.listen(env.port, env.host);
    console.log(`Backend running at http://${env.host}:${env.port}`);
}

bootstrap();
