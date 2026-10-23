import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

// Usuário comum só mexe na PRÓPRIA conta; admin mexe em qualquer uma.
// 404 (não 403) quando não é permitido, seguindo a convenção do projeto de
// não confirmar a existência de recurso alheio.
function assertSelfOrAdmin(user: RequestUser, idUser: number) {
  if (user.role !== 'admin' && user.idUser !== idUser) {
    throw new NotFoundException(`Usuário ${idUser} não encontrado`);
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Única rota pública do módulo: é o cadastro.
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Declarada ANTES de ':id' — senão o Nest tentaria converter "me" em número.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.findOne(user.idUser);
  }

  // Listar todos os usuários é coisa de admin.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    assertSelfOrAdmin(user, id);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    assertSelfOrAdmin(user, id);
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    assertSelfOrAdmin(user, id);
    return this.usersService.remove(id);
  }
}
