import { IsDateString, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

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
  @IsInt()
  clinicalDataIdClinicalData?: number;
}
