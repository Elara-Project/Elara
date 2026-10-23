import { Module } from '@nestjs/common';
import { RelationshipModule } from '../relationship/relationship.module';
import { DiagnosesModule } from '../diagnoses/diagnoses.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

@Module({
  imports: [RelationshipModule, DiagnosesModule],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService], // clinical-data, forum etc. vão precisar validar ownership também
})
export class ChildrenModule {}
