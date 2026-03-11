import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import {
  BatchDeleteShapesRequestDto,
  CopyNodeRequestDto,
  CreateLayerRequestDto,
  CreateShapeRequestDto,
  LayerIdParamDto,
  ShapeIdParamDto,
  UpdateLayerRequestDto,
  UpdateShapeRequestDto,
} from './dto/map-layers-request.dto';
import { MapLayersService } from './map-layers.service';

@Controller('map-layers')
export class MapLayersController {
  constructor(private readonly mapLayersService: MapLayersService) {}

  @Get()
  getTreeSnapshot() {
    return this.mapLayersService.getTreeSnapshot();
  }

  @Post('layers')
  createLayer(@Body() payload: CreateLayerRequestDto) {
    return this.mapLayersService.createLayer(payload);
  }

  @Patch('layers/:layerId')
  updateLayer(@Param() params: LayerIdParamDto, @Body() payload: UpdateLayerRequestDto) {
    return this.mapLayersService.updateLayer(params.layerId, payload);
  }

  @Delete('layers/:layerId')
  deleteLayer(@Param() params: LayerIdParamDto) {
    return this.mapLayersService.deleteLayer(params.layerId);
  }

  @Post('shapes')
  createShape(@Body() payload: CreateShapeRequestDto) {
    return this.mapLayersService.createShape(payload);
  }

  @Patch('shapes/:shapeId')
  updateShape(@Param() params: ShapeIdParamDto, @Body() payload: UpdateShapeRequestDto) {
    return this.mapLayersService.updateShape(params.shapeId, payload);
  }

  @Delete('shapes/:shapeId')
  deleteShape(@Param() params: ShapeIdParamDto) {
    return this.mapLayersService.deleteShape(params.shapeId);
  }

  @Post('shapes/delete-batch')
  deleteShapes(@Body() payload: BatchDeleteShapesRequestDto) {
    return this.mapLayersService.deleteShapes(payload);
  }

  @Post('copy-node')
  copyNode(@Body() payload: CopyNodeRequestDto) {
    return this.mapLayersService.copyNodeToUser(payload);
  }
}
