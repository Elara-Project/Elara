import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Uso: @UseGuards(JwtAuthGuard) em cima de qualquer controller/rota que
// exija login (children, appointments, forum, etc.)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
