import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

// Uso exclusivo de admin/moderador — usuário comum nunca cria Forum,
// só participa via Comments.
export class CreateForumDto {
  @IsString()
  @MinLength(2)
  @MaxLength(45)
  title: string;

  @IsInt()
  diagnosesIdDiagnoses: number;

  @IsString()
  @MinLength(2)
  descript: string;
}
