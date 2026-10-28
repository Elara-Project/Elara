import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAllergyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  allergenName?: string;

  @IsOptional()
  @IsInt()
  severity?: number;
}
