import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { userConfig } from '../db/schema';
import { UpdateUserConfigDto } from './dto/update-user-config.dto';

@Injectable()
export class UserConfigService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findOwn(userIdUser: number) {
    const [found] = await this.db
      .select()
      .from(userConfig)
      .where(eq(userConfig.userIdUser, userIdUser));

    // Só dispararia se o registro tivesse sido criado antes da gente
    // automatizar isso em UsersService — não deveria acontecer em dado
    // novo, mas é melhor um erro claro do que undefined se acontecer.
    if (!found) {
      throw new NotFoundException('Configuração do usuário não encontrada');
    }
    return found;
  }

  async update(userIdUser: number, dto: UpdateUserConfigDto) {
    await this.findOwn(userIdUser);
    await this.db
      .update(userConfig)
      .set({ ...dto, updateDate: new Date() })
      .where(eq(userConfig.userIdUser, userIdUser));
    return this.findOwn(userIdUser);
  }
}
