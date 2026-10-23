import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestUser {
  idUser: number;
  email: string;
}

// Uso: findAll(@CurrentUser() user: RequestUser) — evita repetir
// req.user.idUser em todo controller protegido por JwtAuthGuard.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
