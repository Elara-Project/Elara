import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { therapy } from '../db/schema';
import { CreateTherapyDto } from './dto/create-therapy.dto';
import { UpdateTherapyDto } from './dto/update-therapy.dto';

@Injectable()
export class TherapyService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateTherapyDto) {
    const result = await this.db.insert(therapy).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(therapy);
  }

  async findOne(idTherapy: number) {
    const [found] = await this.db.select().from(therapy).where(eq(therapy.idTherapy, idTherapy));
    if (!found) {
      throw new NotFoundException(`Therapy ${idTherapy} não encontrada`);
    }
    return found;
  }

  async update(idTherapy: number, dto: UpdateTherapyDto) {
    await this.findOne(idTherapy);
    await this.db.update(therapy).set(dto).where(eq(therapy.idTherapy, idTherapy));
    return this.findOne(idTherapy);
  }

  async remove(idTherapy: number) {
    await this.findOne(idTherapy);
    await this.db.delete(therapy).where(eq(therapy.idTherapy, idTherapy));
    return { deleted: true };
  }

  // Contador de uso — chamado pelo service "dono" da relação (ex:
  // ChildrenService, ClinicalDataService) sempre que algo passa a
  // referenciar ou deixa de referenciar essa linha. client opcional
  // permite rodar DENTRO da mesma transação do insert/update que
  // disparou a mudança, mantendo tudo atômico.
  async incrementUsage(idTherapy: number, client: DrizzleDb = this.db) {
    await client
      .update(therapy)
      .set({ qtt: sql`${therapy.qtt} + 1` })
      .where(eq(therapy.idTherapy, idTherapy));
  }

  async decrementUsage(idTherapy: number, client: DrizzleDb = this.db) {
    // GREATEST(...,0) evita qtt ficar negativo em qualquer cenário de corrida
    await client
      .update(therapy)
      .set({ qtt: sql`GREATEST(${therapy.qtt} - 1, 0)` })
      .where(eq(therapy.idTherapy, idTherapy));
  }
}
