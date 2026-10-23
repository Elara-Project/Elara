import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { allergies } from '../db/schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Injectable()
export class AllergiesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateAllergyDto) {
    const result = await this.db.insert(allergies).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(allergies);
  }

  async findOne(idAllergies: number) {
    const [found] = await this.db
      .select()
      .from(allergies)
      .where(eq(allergies.idAllergies, idAllergies));
    if (!found) {
      throw new NotFoundException(`Allergy ${idAllergies} não encontrada`);
    }
    return found;
  }

  async update(idAllergies: number, dto: UpdateAllergyDto) {
    await this.findOne(idAllergies);
    await this.db.update(allergies).set(dto).where(eq(allergies.idAllergies, idAllergies));
    return this.findOne(idAllergies);
  }

  async remove(idAllergies: number) {
    await this.findOne(idAllergies);
    await this.db.delete(allergies).where(eq(allergies.idAllergies, idAllergies));
    return { deleted: true };
  }

  // Contador de uso — chamado pelo service "dono" da relação (ex:
  // ChildrenService, ClinicalDataService) sempre que algo passa a
  // referenciar ou deixa de referenciar essa linha. client opcional
  // permite rodar DENTRO da mesma transação do insert/update que
  // disparou a mudança, mantendo tudo atômico.
  async incrementUsage(idAllergies: number, client: DrizzleDb = this.db) {
    await client
      .update(allergies)
      .set({ qtt: sql`${allergies.qtt} + 1` })
      .where(eq(allergies.idAllergies, idAllergies));
  }

  async decrementUsage(idAllergies: number, client: DrizzleDb = this.db) {
    // GREATEST(...,0) evita qtt ficar negativo em qualquer cenário de corrida
    await client
      .update(allergies)
      .set({ qtt: sql`GREATEST(${allergies.qtt} - 1, 0)` })
      .where(eq(allergies.idAllergies, idAllergies));
  }
}
