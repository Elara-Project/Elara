import { IsString, MinLength } from 'class-validator';

// qtt não entra aqui — contador de uso mantido pelo backend
// (PrescriptionsService incrementa/decrementa), mesmo padrão de
// Therapy/Allergies/Diagnoses/Relationship.
export class CreateMedicationDto {
  @IsString()
  @MinLength(2)
  medicineName: string;

  @IsString()
  @MinLength(2)
  route: string; // ex: "oral", "injetável"

  @IsString()
  @MinLength(2)
  instructions: string;
}
