import { ExceptionsFilter } from './filters/exceptions.filter';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  app.use(json({limit: '50mb'}));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalInterceptors(new LoggerInterceptor());  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionsFilter());
  app.setGlobalPrefix('v3');
  app.enableCors();

  const options = new DocumentBuilder()
      .setTitle('Asset Manager API') 
      .setDescription('API endpoints for Xend Assset Management and Order Matching Platform')
      .setVersion('1.0.0')
      .addTag('asset-manager')      
      .addApiKey({
        type: 'apiKey', // this should be apiKey
        name: 'api-key', // this is the name of the key you expect in header
        in: 'header',
      }, 'api-key') 
      .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT);
}

bootstrap();
