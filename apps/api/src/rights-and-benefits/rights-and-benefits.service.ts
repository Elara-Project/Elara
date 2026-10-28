import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { rightsAndBenefits } from '../db/schema';
import { CreateRightsAndBenefitsDto } from './dto/create-rights-and-benefits.dto';
import { UpdateRightsAndBenefitsDto } from './dto/update-rights-and-benefits.dto';

// Ownership direto por userIdUser (sem cascata, diferente de Children) —
// é um direito/benefício DO RESPONSÁVEL, não de uma criança específica
// (decisão de modelagem confirmada desde o início do projeto).
@Injectable()
export class RightsAndBenefitsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(userIdUser: number, dto: CreateRightsAndBenefitsDto) {
    const result = await this.db.insert(rightsAndBenefits).values({ ...dto, userIdUser });
    return this.findOneOwned(userIdUser, result[0].insertId);
  }

  findAllForUser(userIdUser: number) {
    return this.db.select().from(rightsAndBenefits).where(eq(rightsAndBenefits.userIdUser, userIdUser));
  }

  async findOneOwned(userIdUser: number, idRightsAndBenefits: number) {
    const [found] = await this.db
      .select()
      .from(rightsAndBenefits)
      .where(
        and(
          eq(rightsAndBenefits.idRightsAndBenefits, idRightsAndBenefits),
          eq(rightsAndBenefits.userIdUser, userIdUser),
        ),
      );
    if (!found) {
      throw new NotFoundException(`RightsAndBenefits ${idRightsAndBenefits} não encontrado`);
    }
    return found;
  }

  async update(userIdUser: number, idRightsAndBenefits: number, dto: UpdateRightsAndBenefitsDto) {
    await this.findOneOwned(userIdUser, idRightsAndBenefits);
    await this.db
      .update(rightsAndBenefits)
      .set(dto)
      .where(
        and(
          eq(rightsAndBenefits.idRightsAndBenefits, idRightsAndBenefits),
          eq(rightsAndBenefits.userIdUser, userIdUser),
        ),
      );
    return this.findOneOwned(userIdUser, idRightsAndBenefits);
  }

  async remove(userIdUser: number, idRightsAndBenefits: number) {
    await this.findOneOwned(userIdUser, idRightsAndBenefits);
    await this.db
      .delete(rightsAndBenefits)
      .where(
        and(
          eq(rightsAndBenefits.idRightsAndBenefits, idRightsAndBenefits),
          eq(rightsAndBenefits.userIdUser, userIdUser),
        ),
      );
    return { deleted: true };
  }
}
