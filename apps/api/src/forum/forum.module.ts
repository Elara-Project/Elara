import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';

@Module({
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService], // comments e likes precisam do hasAccessToDiagnosis()
})
export class ForumModule {}
