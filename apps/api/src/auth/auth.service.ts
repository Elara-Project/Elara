import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

const TOKEN_EXPIRES_IN = '7d';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(dto: LoginDto) {
    const found = await this.usersService.findByEmailForAuth(dto.email);

    // Mensagem genérica de propósito nos dois casos (email não existe OU
    // senha errada) — não dar pista de qual das duas falhou evita que
    // alguém use o login pra descobrir quais emails estão cadastrados.
    if (!found) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, found.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (found.status === 0) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const payload = { sub: found.idUser, email: found.email, role: found.role };

    // jsonwebtoken direto, sem o wrapper @nestjs/jwt — mesma lib que ele
    // usava por baixo dos panos, só sem o ERR_REQUIRE_ESM que esse
    // ambiente especificamente tem com pacotes auxiliares do Nest.
    const accessToken = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      user: {
        idUser: found.idUser,
        name: found.name,
        email: found.email,
        role: found.role,
      },
    };
  }
}
