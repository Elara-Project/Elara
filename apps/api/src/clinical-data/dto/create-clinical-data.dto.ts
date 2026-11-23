import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClinicalDataDto {
  @IsString()
  @MinLength(2)
  familyHistory: string;

  @IsString()
  @MinLength(2)
  observations: string;

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
}
