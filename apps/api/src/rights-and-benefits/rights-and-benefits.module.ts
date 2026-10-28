import { Module } from '@nestjs/common';
import { RightsAndBenefitsController } from './rights-and-benefits.controller';
import { RightsAndBenefitsService } from './rights-and-benefits.service';

@Module({
  controllers: [RightsAndBenefitsController],
  providers: [RightsAndBenefitsService],
})
export class RightsAndBenefitsModule {}
