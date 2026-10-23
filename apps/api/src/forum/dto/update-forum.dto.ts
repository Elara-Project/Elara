import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateForumDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(45)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  descript?: string;
}
