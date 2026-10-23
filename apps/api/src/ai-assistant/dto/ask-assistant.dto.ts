import { IsString, MinLength } from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @MinLength(3)
  question: string;
}
