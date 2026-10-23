import { Module } from '@nestjs/common';
import { ChildrenModule } from '../children/children.module';
import { TherapyModule } from '../therapy/therapy.module';
import { AllergiesModule } from '../allergies/allergies.module';
import { ClinicalDataController } from './clinical-data.controller';
import { ClinicalDataService } from './clinical-data.service';

@Module({
  imports: [ChildrenModule, TherapyModule, AllergiesModule],
  controllers: [ClinicalDataController],
  providers: [ClinicalDataService],
  exports: [ClinicalDataService], // appointments e prescriptions vão precisar disso também
})
export class ClinicalDataModule {}
