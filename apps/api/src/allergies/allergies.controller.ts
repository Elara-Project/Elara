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
import { AllergiesService } from './allergies.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  create(@Body() dto: CreateAllergyDto) {
    return this.allergiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.allergiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.allergiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAllergyDto) {
    return this.allergiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.allergiesService.remove(id);
  }
}
