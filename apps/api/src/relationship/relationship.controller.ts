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
import { RelationshipService } from './relationship.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';

// Sem @UseGuards de propósito: qualquer usuário logado (ou não) pode
// LER a lista pra popular um dropdown no cadastro de criança. Se quiser
// restringir create/update/remove a um admin, dá pra separar em rotas
// próprias com um AdminGuard depois — não implementei isso agora pra
// não travar seu fluxo de cadastro no meio do desenvolvimento.
@Controller('relationships')
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post()
  create(@Body() dto: CreateRelationshipDto) {
    return this.relationshipService.create(dto);
  }

  @Get()
  findAll() {
    return this.relationshipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.relationshipService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRelationshipDto) {
    return this.relationshipService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.relationshipService.remove(id);
  }
}
