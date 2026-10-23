import { IsDateString, IsIn, IsInt, IsString, MinLength } from 'class-validator';

export class CreatePrescriptionDto {
  @IsInt()
  medicationsIdCurrentMedications: number;

  @IsString()
  @MinLength(2)
  frequency: string; // ex: "2x ao dia", "a cada 8 horas"

  @IsIn([0, 1])
  status: number; // 0 = inativo/suspenso, 1 = em uso

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
