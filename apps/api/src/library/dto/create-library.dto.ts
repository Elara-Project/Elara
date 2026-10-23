import { IsString, MinLength } from 'class-validator';

export class CreateLibraryDto {
  @IsString()
  @MinLength(2)
  name: string; // ex: "Receitas", "Laudos", "Exames", "Fotos"

  @IsString()
  @MinLength(2)
  descript: string;

  @IsString()
  icon: string;
}
