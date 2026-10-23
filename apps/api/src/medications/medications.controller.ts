import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

// Mesmo padrão aberto de Relationship/Diagnoses/Therapy/Allergies: sem
// guard, catálogo compartilhado.
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicationsService.remove(id);
  }
}
