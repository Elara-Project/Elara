import { IsString, MinLength } from 'class-validator';

// qtt não entra aqui — contador de uso mantido pelo backend.
export class CreateTherapyDto {
  @IsString()
  @MinLength(2)
  nameTherapy: string; // ex: "Terapia Ocupacional", "Fonoaudiologia"

  @IsString()
  @MinLength(2)
  type: string;
}
