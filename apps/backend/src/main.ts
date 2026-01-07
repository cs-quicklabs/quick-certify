/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import morgan from 'morgan';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { Request } from 'express';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { validationOptions } from './commons/utils';
import { ExceptionResponseFilter } from './commons/filters';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Adding checks if the req.ip has valid ipv4 otherwiseit checks for
  // x-forwarded-for and if it doesn't exists it will check for connection.remoteAddress
  morgan.token('client-ip', (req: Request) => {
    // Safely extract client IP, supporting various headers and properties
    const ip =
      (typeof req.ip === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(req.ip) && req.ip) ||
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : undefined) ||
      (req.connection && req.connection.remoteAddress) ||
      (typeof req.headers['x-client-ip'] === 'string' && req.headers['x-client-ip']) ||
      undefined;

    return ip;
  });

  // adding request logger to the application
  app.use(
    morgan(
      ':client-ip :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms',
    ),
  );

  // Added helment for the response headers.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'"],
          frameSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // adding cookie parser
  app.use(cookieParser.default());

  const configService = app.get(ConfigService<AllConfigType>);

  const frontendURL = configService.getOrThrow('app.frontendDomain', {
    infer: true,
  });

  // enabling CORS for frontend consumption
  app.enableCors({
    origin: [frontendURL],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // global prefix
  const globalPrefix = configService.getOrThrow('app.apiPrefix', { infer: true }) || 'api';
  app.setGlobalPrefix(globalPrefix);

  // enanbling API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // setting up swagger
  setupSwagger(app, globalPrefix);

  // Global Validations
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // Global Filters
  app.useGlobalFilters(new ExceptionResponseFilter());

  // starting the server
  const port = configService.getOrThrow('app.port', { infer: true });

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`,
  );
}

bootstrap();
