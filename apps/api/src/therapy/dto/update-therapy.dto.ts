import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTherapyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nameTherapy?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  type?: string;
}
