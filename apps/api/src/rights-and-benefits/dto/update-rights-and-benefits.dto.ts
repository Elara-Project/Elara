import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { rightsAndBenefitsCategoryValues, rightsAndBenefitsTypeValues } from '../../db/schema';

export class UpdateRightsAndBenefitsDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(45)
  title?: string;

  @IsOptional()
  @IsIn(rightsAndBenefitsCategoryValues)
  category?: (typeof rightsAndBenefitsCategoryValues)[number];

  @IsOptional()
  @IsIn(rightsAndBenefitsTypeValues)
  type?: (typeof rightsAndBenefitsTypeValues)[number];

  @IsOptional()
  @IsString()
  @MinLength(2)
  descript?: string;

  @IsOptional()
  @IsIn([0, 1])
  status?: number;
}
