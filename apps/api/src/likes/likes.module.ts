import { Module } from '@nestjs/common';
import { ForumModule } from '../forum/forum.module';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [ForumModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
