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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

interface RequestUser {
  idUser: number;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Criação é aninhada em /children/:childId porque é o único jeito de
  // saber a qual ClinicalData vincular o novo appointment.
  @Post('children/:childId/appointments')
  create(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createForChild(user.idUser, childId, dto);
  }

  @Get('children/:childId/appointments')
  findAllForChild(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number) {
    return this.appointmentsService.findAllForChild(user.idUser, childId);
  }

  // Leitura/edição/remoção são "achatadas" — o appointment já carrega
  // implicitamente a que criança pertence via ClinicalData, não precisa
  // repetir o childId na URL.
  @Get('appointments/:id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOneOwned(user.idUser, id);
  }

  @Patch('appointments/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.idUser, id, dto);
  }

  @Delete('appointments/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.remove(user.idUser, id);
  }
}
