import { IsString, MinLength } from 'class-validator';

// qtt não entra aqui — é contador de uso mantido pelo backend
// (ChildrenService incrementa/decrementa), nunca vem do client.
export class CreateRelationshipDto {
  @IsString()
  @MinLength(2)
  relationship: string; // ex: "Mãe", "Pai", "Avó"
}
