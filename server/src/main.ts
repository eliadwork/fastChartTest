import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppConfigService } from './config/app-config.service';
import { AppModule } from './modules/app.module';

const logger = new Logger('Bootstrap');

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: '*',
  });

  const port = configService.getPort();
  await app.listen(port);
  logger.log(`Map layers server listening on http://localhost:${port}`);
};

void bootstrap();
