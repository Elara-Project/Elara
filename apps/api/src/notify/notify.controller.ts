import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotifyService } from './notify.service';
import { CreateNotifyDto } from './dto/create-notify.dto';

interface RequestUser {
  idUser: number;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateNotifyDto) {
    return this.notifyService.create(user.idUser, dto);
  }

  @Get('calendar/:calendarId')
  findAllForCalendar(
    @CurrentUser() user: RequestUser,
    @Param('calendarId', ParseIntPipe) calendarId: number,
  ) {
    return this.notifyService.findAllForCalendar(user.idUser, calendarId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.notifyService.remove(user.idUser, id);
  }
}
