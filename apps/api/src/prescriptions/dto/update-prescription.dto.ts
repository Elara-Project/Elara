import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Sem medicationsIdCurrentMedications aqui de propósito: ele faz parte da
// PK composta (junto com clinicalDataIdClinicalData). "Trocar o
// medicamento" de uma prescrição não é um update — é apagar essa e criar
// outra, porque mudaria a própria identidade da linha.
export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  frequency?: string;

  @IsOptional()
  @IsIn([0, 1])
  status?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
