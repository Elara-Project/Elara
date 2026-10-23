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
import { LibraryService } from './library.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';

// Sem guard, mesmo padrão de Relationship/Diagnoses/Therapy/Allergies,
// conforme confirmado.
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  create(@Body() dto: CreateLibraryDto) {
    return this.libraryService.create(dto);
  }

  @Get()
  findAll() {
    return this.libraryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.libraryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLibraryDto) {
    return this.libraryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.libraryService.remove(id);
  }
}
