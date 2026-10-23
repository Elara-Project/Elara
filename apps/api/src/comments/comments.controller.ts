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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('forum/:forumId/comments')
  create(
    @CurrentUser() user: RequestUser,
    @Param('forumId', ParseIntPipe) forumId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.idUser, forumId, dto);
  }

  @Get('forum/:forumId/comments')
  findAllForForum(@CurrentUser() user: RequestUser, @Param('forumId', ParseIntPipe) forumId: number) {
    return this.commentsService.findAllForForum(user.idUser, forumId);
  }

  @Patch('comments/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user.idUser, user.role, id, dto);
  }

  @Delete('comments/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(user.idUser, user.role, id);
  }
}
