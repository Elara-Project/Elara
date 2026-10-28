import { IsDateString, IsInt, IsString, MinLength } from 'class-validator';

// notifyDate vem pronto do client (ex: calculado no front como
// "data da consulta menos 1 dia") — o backend não embute regra de
// antecedência fixa, já que você confirmou que isso é configurável
// por notificação, não uma constante do sistema.
export class CreateNotifyDto {
  @IsInt()
  calendarIdCalendar: number;

  @IsDateString()
  notifyDate: string;

  @IsString()
  @MinLength(2)
  descript: string;
}
