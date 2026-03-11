import { Module } from '@nestjs/common';

import { MapLayersController } from './map-layers.controller';
import { MapLayersRepository } from './map-layers.repository';
import { MapLayersService } from './map-layers.service';

@Module({
  controllers: [MapLayersController],
  providers: [MapLayersService, MapLayersRepository],
})
export class MapLayersModule {}
