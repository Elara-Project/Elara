import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CareItemDto {
  @IsIn(['alimentacao', 'horario'])
  kind: 'alimentacao' | 'horario';

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(500)
  details: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  weekdays?: string;
}

export class UpdateCareItemDto {
  @IsOptional()
  @IsIn(['alimentacao', 'horario'])
  kind?: 'alimentacao' | 'horario';

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  weekdays?: string;
}
