import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  therapyIds?: number[];

  @IsOptional()
  @IsInt()
  allergiesIdAllergies?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  allergiesIds?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  allergiesText?: string;
}
