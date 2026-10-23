import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // POST retorna 201 por padrão no Nest; login faz mais sentido como 200
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
