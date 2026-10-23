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
import { RightsAndBenefitsService } from './rights-and-benefits.service';
import { CreateRightsAndBenefitsDto } from './dto/create-rights-and-benefits.dto';
import { UpdateRightsAndBenefitsDto } from './dto/update-rights-and-benefits.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('rights-and-benefits')
export class RightsAndBenefitsController {
  constructor(private readonly rightsAndBenefitsService: RightsAndBenefitsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateRightsAndBenefitsDto) {
    return this.rightsAndBenefitsService.create(user.idUser, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.rightsAndBenefitsService.findAllForUser(user.idUser);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.rightsAndBenefitsService.findOneOwned(user.idUser, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRightsAndBenefitsDto,
  ) {
    return this.rightsAndBenefitsService.update(user.idUser, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.rightsAndBenefitsService.remove(user.idUser, id);
  }
}
