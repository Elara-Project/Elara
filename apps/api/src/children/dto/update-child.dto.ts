import { IsDateString, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

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
  @IsInt()
  clinicalDataIdClinicalData?: number;
}
