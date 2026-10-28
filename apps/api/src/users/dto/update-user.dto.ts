import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Escrito na mão (sem PartialType/OmitType de @nestjs/mapped-types) para
// evitar o ERR_REQUIRE_ESM que esse pacote pode causar dependendo da versão
// resolvida. Senha não entra aqui de propósito — troca de senha merece
// endpoint próprio com verificação da senha atual.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
