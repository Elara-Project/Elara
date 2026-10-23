import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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
  validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }
    return { idUser: payload.sub, email: payload.email, role: payload.role };
  }
}
