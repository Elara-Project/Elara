import { Controller, Get } from '@nestjs/common';

/** Liveness endpoint for checking the API without requiring a database. */
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', service: 'elara-api' };
  }
}
