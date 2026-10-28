import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

interface RequestUser {
  idUser: number;
  email: string;
}

@UseGuards(JwtAuthGuard) // toda rota daqui exige token válido
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateChildDto) {
    return this.childrenService.create(user.idUser, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.childrenService.findAllForUser(user.idUser);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.childrenService.findOne(user.idUser, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChildDto,
  ) {
    return this.childrenService.update(user.idUser, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.childrenService.remove(user.idUser, id);
  }
}
