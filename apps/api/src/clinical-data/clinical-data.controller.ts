import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClinicalDataService } from './clinical-data.service';
import { CreateClinicalDataDto } from './dto/create-clinical-data.dto';
import { UpdateClinicalDataDto } from './dto/update-clinical-data.dto';

interface RequestUser {
  idUser: number;
  email: string;
}

// Rotas aninhadas em /children/:childId — nunca existe /clinical-data solto,
// porque o prontuário só faz sentido no contexto de uma criança específica.
@UseGuards(JwtAuthGuard)
@Controller('children/:childId/clinical-data')
export class ClinicalDataController {
  constructor(private readonly clinicalDataService: ClinicalDataService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: CreateClinicalDataDto,
  ) {
    return this.clinicalDataService.createForChild(user.idUser, childId, dto);
  }

  @Get()
  findOne(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number) {
    return this.clinicalDataService.findOneForChild(user.idUser, childId);
  }

  @Patch()
  update(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: UpdateClinicalDataDto,
  ) {
    return this.clinicalDataService.updateForChild(user.idUser, childId, dto);
  }
}
