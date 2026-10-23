import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClinicalDataDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  familyHistory?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  observations?: string;

  @IsOptional()
  @IsInt()
  therapyIdTherapy?: number;

  @IsOptional()
  @IsInt()
  allergiesIdAllergies?: number;
}
