import { IsInt, IsString, MinLength } from 'class-validator';

// qtt não entra aqui — contador de uso mantido pelo backend.
export class CreateAllergyDto {
  @IsString()
  @MinLength(2)
  allergenName: string;

  @IsInt()
  severity: number;
}
