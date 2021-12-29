import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LandingController } from './landing/landing.controller';
import { LandingService } from './landing/landing.service';
import { CollectionsController } from './collections/collections.controller';
import { CollectionsService } from './collections/collections.service';
import { ConformanceController } from './conformance/conformance.controller';
import { ConformanceService } from './conformance/conformance.service';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: process.env.DATABASE_TYPE as any,
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT as any,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_DB,
            entities: [],
            synchronize: process.env.DATABASE_SYNCHRONIZE as any,
        }),
    ],
    controllers: [AppController, LandingController, CollectionsController, ConformanceController],
    providers: [AppService, LandingService, CollectionsService, ConformanceService],
})
export class AppModule {}
