import { Module } from '@nestjs/common';
import { ClinicalDataModule } from '../clinical-data/clinical-data.module';
import { MedicationsModule } from '../medications/medications.module';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  imports: [ClinicalDataModule, MedicationsModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
})
export class PrescriptionsModule {}
