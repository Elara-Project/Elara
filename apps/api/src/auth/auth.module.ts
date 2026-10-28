import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// Sem JwtModule.register(...) — AuthService agora assina o token direto
// com jsonwebtoken (ver auth.service.ts). PassportModule/JwtStrategy
// continuam normais, é passport-jwt que verifica o token recebido, não
// o @nestjs/jwt que foi removido.
@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
