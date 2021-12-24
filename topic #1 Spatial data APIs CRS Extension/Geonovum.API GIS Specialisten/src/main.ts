import { json } from 'express';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(json({ limit: '50mb' }));
    app.enableCors();

    const config = new DocumentBuilder().setTitle('GIS Specialisten OGC API: CRS').setDescription('GIS Specialisten\'s implementation of the OGC API with the addition of custom CRS support').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.APP_PORT || 3001;
    await app.listen(port);
    console.log('App listening on port: ', port);
}
bootstrap();
