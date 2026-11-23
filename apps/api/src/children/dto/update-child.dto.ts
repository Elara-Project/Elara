import { ArrayUnique, IsArray, IsDateString, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Na mão de propósito (mesmo motivo do UpdateUserDto): evita depender
// de @nestjs/mapped-types, que já deu ERR_REQUIRE_ESM nesse projeto.
export class UpdateChildDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsInt()
  relationshipIdRelationship?: number;

  @IsOptional()
  @IsInt()
  diagnosesIdDiagnoses?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  diagnosesIds?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  school?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cid?: string;

  @IsOptional()
  @IsInt()
  clinicalDataIdClinicalData?: number;
}
