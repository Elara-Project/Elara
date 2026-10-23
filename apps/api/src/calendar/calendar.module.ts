import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService], // notify vai precisar validar ownership através daqui
})
export class CalendarModule {}
