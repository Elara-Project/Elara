import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

// Rotas sempre aninhadas em /children/:childId — diferente de Appointments,
// aqui NÃO dá pra achatar pra /prescriptions/:id, porque não existe um id
// único: a identidade de uma prescrição é (criança + medicamento).
@UseGuards(JwtAuthGuard)
@Controller('children/:childId/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(user.idUser, childId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number) {
    return this.prescriptionsService.findAllForChild(user.idUser, childId);
  }

  @Get(':medicationId')
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('medicationId', ParseIntPipe) medicationId: number,
  ) {
    return this.prescriptionsService.findOneOwned(user.idUser, childId, medicationId);
  }

  @Patch(':medicationId')
  update(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('medicationId', ParseIntPipe) medicationId: number,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(user.idUser, childId, medicationId, dto);
  }

  @Delete(':medicationId')
  remove(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('medicationId', ParseIntPipe) medicationId: number,
  ) {
    return this.prescriptionsService.remove(user.idUser, childId, medicationId);
  }
}
