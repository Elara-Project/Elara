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
import { TherapyService } from './therapy.service';
import { CreateTherapyDto } from './dto/create-therapy.dto';
import { UpdateTherapyDto } from './dto/update-therapy.dto';

@Controller('therapies')
export class TherapyController {
  constructor(private readonly therapyService: TherapyService) {}

  @Post()
  create(@Body() dto: CreateTherapyDto) {
    return this.therapyService.create(dto);
  }

  @Get()
  findAll() {
    return this.therapyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.therapyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTherapyDto) {
    return this.therapyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.therapyService.remove(id);
  }
}
