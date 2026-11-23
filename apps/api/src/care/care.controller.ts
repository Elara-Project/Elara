import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CareService } from './care.service';
import { CareItemDto, UpdateCareItemDto } from './dto/care-item.dto';

interface RequestUser { idUser: number; email: string }

@UseGuards(JwtAuthGuard)
@Controller('children/:childId/care')
export class CareController {
  constructor(private readonly service: CareService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number) {
    return this.service.findAll(user.idUser, childId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number, @Body() dto: CareItemDto) {
    return this.service.create(user.idUser, childId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCareItemDto) {
    return this.service.update(user.idUser, childId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user.idUser, childId, id);
  }
}
