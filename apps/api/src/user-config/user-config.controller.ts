import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserConfigService } from './user-config.service';
import { UpdateUserConfigDto } from './dto/update-user-config.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

// Sem :id nas rotas — UserConfig só existe "a sua própria", nunca se
// acessa a de outro usuário por id.
@UseGuards(JwtAuthGuard)
@Controller('user-config')
export class UserConfigController {
  constructor(private readonly userConfigService: UserConfigService) {}

  @Get()
  findOwn(@CurrentUser() user: RequestUser) {
    return this.userConfigService.findOwn(user.idUser);
  }

  @Patch()
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateUserConfigDto) {
    return this.userConfigService.update(user.idUser, dto);
  }
}
