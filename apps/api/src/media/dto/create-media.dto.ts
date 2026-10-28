import { Type } from 'class-transformer';
import { IsInt, IsString, MinLength } from 'class-validator';

// Chega como campos de texto dentro de um multipart/form-data, junto com
// o arquivo em si (campo 'file') — por isso não tem nada sobre o arquivo
// aqui, isso é tratado separadamente pelo Multer no controller.
//
// IMPORTANTE: em multipart TODO campo chega como string ("1", não 1).
// Sem o @Type(() => Number), o @IsInt() rejeitaria qualquer upload com
// "libraryIdlibrary must be an integer number". Em JSON isso não acontece
// (o número já chega como número), só em multipart.
export class CreateMediaDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(2)
  descript: string;

  @Type(() => Number)
  @IsInt()
  libraryIdlibrary: number;
}
