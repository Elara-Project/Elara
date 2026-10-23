import { Module } from '@nestjs/common';
import { CalendarModule } from '../calendar/calendar.module';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

@Module({
  imports: [CalendarModule],
  controllers: [NotifyController],
  providers: [NotifyService],
})
export class NotifyModule {}
