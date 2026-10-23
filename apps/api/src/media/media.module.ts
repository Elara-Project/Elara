import { Module } from '@nestjs/common';
import { ChildrenModule } from '../children/children.module';
import { LibraryModule } from '../library/library.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [ChildrenModule, LibraryModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
