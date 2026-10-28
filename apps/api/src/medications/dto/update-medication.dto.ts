import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMedicationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  medicineName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  route?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  instructions?: string;
}
