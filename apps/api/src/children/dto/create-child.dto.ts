import { ArrayUnique, IsArray, IsDateString, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsDateString()
  dob: string;

  @IsInt()
  relationshipIdRelationship: number;

  // Diagnóstico e dado clínico costumam ser preenchidos depois do
  // cadastro inicial da criança, por isso ficam opcionais aqui.
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
