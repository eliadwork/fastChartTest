import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

import type { MapLeafShape } from '../map-layers.types';

const MAP_LEAF_SHAPES: [MapLeafShape, ...MapLeafShape[]] = ['dot', 'line', 'polygon', 'circle'];

export class LayerIdParamDto {
  @IsString()
  @IsNotEmpty()
  layerId!: string;
}

export class ShapeIdParamDto {
  @IsString()
  @IsNotEmpty()
  shapeId!: string;
}

export class CoordinatePointDto {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  lng!: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  lat!: number;
}

export class ShapeGeometryDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatePointDto)
  point?: CoordinatePointDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinatePointDto)
  path?: CoordinatePointDto[];
}

@ValidatorConstraint({ name: 'createShapeGeometryByShape', async: false })
class CreateShapeGeometryByShapeValidator implements ValidatorConstraintInterface {
  validate(value: ShapeGeometryDto, validationContext?: ValidationArguments) {
    const shape = (validationContext?.object as CreateShapeRequestDto | undefined)?.shape;
    if (shape == null) {
      return false;
    }

    const hasPoint = value?.point != null;
    const hasPath = Array.isArray(value?.path);

    if (shape === 'dot' || shape === 'circle') {
      return hasPoint && !hasPath;
    }

    if (!hasPath || hasPoint) {
      return false;
    }

    const minimumLength = shape === 'line' ? 2 : 3;
    return value.path!.length >= minimumLength;
  }

  defaultMessage(validationContext?: ValidationArguments) {
    const shape = (validationContext?.object as CreateShapeRequestDto | undefined)?.shape;
    if (shape === 'dot' || shape === 'circle') {
      return `Shape "${shape}" requires geometry.point and does not accept geometry.path.`;
    }

    if (shape === 'line') {
      return 'Shape "line" requires geometry.path with at least 2 points and does not accept geometry.point.';
    }

    return 'Shape geometry is invalid for the selected shape.';
  }
}

@ValidatorConstraint({ name: 'updateShapeGeometryStructure', async: false })
class UpdateShapeGeometryStructureValidator implements ValidatorConstraintInterface {
  validate(value?: ShapeGeometryDto) {
    if (value == null) {
      return true;
    }

    const hasPoint = value.point != null;
    const hasPath = Array.isArray(value.path);

    if (hasPoint === hasPath) {
      return false;
    }

    if (hasPath) {
      return value.path!.length >= 2;
    }

    return true;
  }

  defaultMessage() {
    return 'geometry must include either geometry.point or geometry.path (with at least 2 points), but not both.';
  }
}

export class CreateLayerRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parentGroupId?: string;

  @IsOptional()
  @IsString()
  layerName?: string;
}

export class UpdateLayerRequestDto {
  @IsOptional()
  @IsString()
  layerName?: string;

  @IsOptional()
  @IsString()
  parentGroupId?: string | null;

  @IsOptional()
  @IsBoolean()
  allowEdits?: boolean;
}

export class CreateShapeRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetGroupId?: string;

  @IsEnum(MAP_LEAF_SHAPES)
  shape!: MapLeafShape;

  @ValidateNested()
  @Type(() => ShapeGeometryDto)
  @Validate(CreateShapeGeometryByShapeValidator)
  geometry!: ShapeGeometryDto;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.000001)
  radiusMeters?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShapeRequestDto {
  @IsOptional()
  @IsString()
  targetGroupId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShapeGeometryDto)
  @Validate(UpdateShapeGeometryStructureValidator)
  geometry?: ShapeGeometryDto;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.000001)
  radiusMeters?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchDeleteShapesRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  shapeIds!: string[];
}

export class CopyNodeRequestDto {
  @IsString()
  @IsNotEmpty()
  nodeId!: string;
}
