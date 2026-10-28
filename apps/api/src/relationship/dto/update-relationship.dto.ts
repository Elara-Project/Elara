import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateRelationshipDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  relationship?: string;
}
