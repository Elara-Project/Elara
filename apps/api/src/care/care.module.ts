import { Module } from '@nestjs/common';
import { ChildrenModule } from '../children/children.module';
import { CareController } from './care.controller';
import { CareService } from './care.service';

@Module({ imports: [ChildrenModule], controllers: [CareController], providers: [CareService] })
export class CareModule {}
