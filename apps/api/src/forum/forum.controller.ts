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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ForumService } from './forum.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // --- gestão (admin/moderador) ---
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('forum')
  create(@Body() dto: CreateForumDto) {
    return this.forumService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('forum/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateForumDto) {
    return this.forumService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete('forum/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.forumService.remove(id);
  }

  // --- leitura (qualquer usuário logado, com controle de acesso) ---
  @Get('diagnoses/:diagnosisId/forum')
  findAllForDiagnosis(
    @CurrentUser() user: RequestUser,
    @Param('diagnosisId', ParseIntPipe) diagnosisId: number,
  ) {
    return this.forumService.findAllForDiagnosis(user.idUser, diagnosisId);
  }

  @Get('forum/:id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.forumService.findOneForUser(user.idUser, id);
  }
}
