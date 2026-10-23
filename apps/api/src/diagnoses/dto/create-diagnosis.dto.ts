import { IsInt, IsString, MinLength } from 'class-validator';

// qtt não entra aqui — contador de uso mantido pelo backend.
export class CreateDiagnosisDto {
  @IsString()
  @MinLength(2)
  nameDiagnosis: string; // ex: "TEA - Nível de suporte 2"

  @IsInt()
  stage: number;
}
