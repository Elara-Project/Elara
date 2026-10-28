import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AiAssistantService } from './ai-assistant.service';
import { AskAssistantDto } from './dto/ask-assistant.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('ask')
  ask(@CurrentUser() user: RequestUser, @Body() dto: AskAssistantDto) {
    return this.aiAssistantService.ask(user.idUser, dto.question);
  }

  @Get('history')
  history(@CurrentUser() user: RequestUser) {
    return this.aiAssistantService.findHistory(user.idUser);
  }
}
