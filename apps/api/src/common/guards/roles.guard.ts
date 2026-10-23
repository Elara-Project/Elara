import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// SEMPRE usar depois de @UseGuards(JwtAuthGuard, RolesGuard) NESSA ORDEM —
// esse guard lê req.user.role, que só existe depois do JwtAuthGuard rodar
// e popular req.user via JwtStrategy.validate().
//
// Nota de design: role vem do JWT (não de uma consulta fresca ao banco a
// cada request). Mais rápido, mas significa que promover/rebaixar um admin
// só tem efeito no próximo login dele (token antigo continua com role
// antiga até expirar). Pro tamanho do TCC isso é aceitável; se precisar de
// revogação imediata, a alternativa é este guard consultar o UsersService
// a cada chamada — mais correto, mais lento.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // rota sem @Roles() não exige papel nenhum
    }

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Ação restrita a administradores');
    }
    return true;
  }
}
