import { Module } from '@nestjs/common';
import { TherapyController } from './therapy.controller';
import { TherapyService } from './therapy.service';

@Module({
  controllers: [TherapyController],
  providers: [TherapyService],
  exports: [TherapyService],
})
export class TherapyModule {}
