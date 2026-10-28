import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';

interface RequestUser {
  idUser: number;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // Endpoint pensado pra alimentar a tela de agenda: todos os compromissos
  // do usuário logado, de todas as crianças dele, num só lugar.
  @Get()
  findAllForUser(@CurrentUser() user: RequestUser) {
    return this.calendarService.findAllForUser(user.idUser);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.calendarService.findOneOwned(user.idUser, id);
  }
}
