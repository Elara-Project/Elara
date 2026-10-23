import { IsIn, IsInt, IsString, MaxLength, MinLength } from 'class-validator';
import { rightsAndBenefitsCategoryValues, rightsAndBenefitsTypeValues } from '../../db/schema';

export class CreateRightsAndBenefitsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(45)
  title: string;

  @IsIn(rightsAndBenefitsCategoryValues)
  category: (typeof rightsAndBenefitsCategoryValues)[number];

  @IsIn(rightsAndBenefitsTypeValues)
  type: (typeof rightsAndBenefitsTypeValues)[number];

  @IsString()
  @MinLength(2)
  descript: string;

  @IsIn([0, 1])
  status: number;
}
