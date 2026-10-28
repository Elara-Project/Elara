import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

// status não entra aqui de propósito: todo Appointment nasce 'agendado'.
// O client não deveria poder criar um appointment já 'concluido', por ex.
export class CreateAppointmentDto {
  @IsDateString()
  appointmentDateTime: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  reason: string;

  @IsString()
  @MinLength(2)
  local: string;

  @IsString()
  notes: string;
}
