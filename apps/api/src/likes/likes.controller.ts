import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LikesService } from './likes.service';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('comments/:commentId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  like(@CurrentUser() user: RequestUser, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.likesService.like(user.idUser, commentId);
  }

  @Delete()
  unlike(@CurrentUser() user: RequestUser, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.likesService.unlike(user.idUser, commentId);
  }

  @Get()
  count(@CurrentUser() user: RequestUser, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.likesService.countForComment(user.idUser, commentId);
  }
}
