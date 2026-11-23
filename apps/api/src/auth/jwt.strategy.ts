import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // falha rápido na inicialização em vez de deixar todo login
      // quebrar silenciosamente em produção por falta da env var
      throw new Error('JWT_SECRET não definida no .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // O que essa função retorna vira req.user em qualquer rota protegida
  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }
    try {
      // Usa o papel atual do banco para que promoções/rebaixamentos tenham
      // efeito imediato, sem depender de um novo login para renovar o JWT.
      const currentUser = await this.usersService.findOne(payload.sub);
      return {
        idUser: currentUser.idUser,
        email: currentUser.email,
        role: currentUser.role,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
