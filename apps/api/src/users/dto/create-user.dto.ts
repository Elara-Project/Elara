import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  // senha em texto puro vinda do client — o hash acontece no service,
  // nunca guardamos isso direto no banco
  @IsString()
  @MinLength(8)
  senha: string;

  // 1 = ativo, 0 = inativo — combina com o tinyint('Status') do schema
  @IsIn([0, 1])
  status: number;
}
