import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Quick Certify API')
    .setDescription('The Quick Certify API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // This will serve Swagger at /docs

  // Force sync all models
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ force: true });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📝 Swagger documentation is available at: http://localhost:${port}/docs`
  );
}

bootstrap();