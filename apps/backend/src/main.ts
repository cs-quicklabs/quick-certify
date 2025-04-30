import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import validationOptions from './utils/validation-options';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // adding cookie parser
  app.use(cookieParser());

  const globalPrefix = process.env.API_PREFIX ?? '';
  app.setGlobalPrefix(globalPrefix);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Quick Certify API')
    .setDescription('The Quick Certify API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.enableVersioning({ type: VersioningType.URI });

  // to ensure smooth function while application shutdown
  app.enableShutdownHooks();

  // Global Validations
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // This will serve Swagger at /docs
  Logger.log(
    `📝 Swagger documentation is available at: http://localhost:${port}/docs`
  );
}

bootstrap();
