import { Module } from '@nestjs/common';

import { AppConfigService } from '../config/app-config.service';
import { MapLayersModule } from './map-layers/map-layers.module';

@Module({
  imports: [MapLayersModule],
  providers: [AppConfigService],
})
export class AppModule {}
