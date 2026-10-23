import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDiagnosisDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nameDiagnosis?: string;

  @IsOptional()
  @IsInt()
  stage?: number;
}
