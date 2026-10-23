import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { appointmentStatusValues } from '../../db/schema';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentDateTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  reason?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  local?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(appointmentStatusValues)
  status?: (typeof appointmentStatusValues)[number];
}
