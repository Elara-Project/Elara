import { IsIn, IsOptional } from 'class-validator';

// Sem create — UserConfig nasce automaticamente junto com o User
// (ver UsersService.create). Sem campos obrigatórios aqui, já que é
// sempre uma atualização parcial de preferências.
export class UpdateUserConfigDto {
  @IsOptional()
  @IsIn([0, 1])
  notify?: number;

  @IsOptional()
  @IsIn([0, 1])
  theme?: number; // 0 = claro, 1 = escuro

  @IsOptional()
  @IsIn([0, 1])
  privacity?: number;
}
