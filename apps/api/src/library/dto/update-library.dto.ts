import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateLibraryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  descript?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
