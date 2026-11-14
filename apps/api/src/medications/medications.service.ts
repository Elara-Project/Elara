import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { isForeignKeyViolation } from '../common/db-errors';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { medications } from '../db/schema';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateMedicationDto) {
    const result = await this.db.insert(medications).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(medications);
  }

  async findOne(idCurrentMedications: number) {
    const [found] = await this.db
      .select()
      .from(medications)
      .where(eq(medications.idCurrentMedications, idCurrentMedications));
    if (!found) {
      throw new NotFoundException(`Medication ${idCurrentMedications} não encontrada`);
    }
    return found;
  }

  async update(idCurrentMedications: number, dto: UpdateMedicationDto) {
    await this.findOne(idCurrentMedications);
    await this.db
      .update(medications)
      .set(dto)
      .where(eq(medications.idCurrentMedications, idCurrentMedications));
    return this.findOne(idCurrentMedications);
  }

  async remove(idCurrentMedications: number) {
    await this.findOne(idCurrentMedications);
    try {
      await this.db.delete(medications).where(eq(medications.idCurrentMedications, idCurrentMedications));
    } catch (error) {
      // Item ainda referenciado por outra tabela: erro do cliente (409), não 500.
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível excluir: medicamento em uso.');
      }
      throw error;
    }
    return { deleted: true };
  }

  // Mesmo padrão de incrementUsage/decrementUsage de Relationship/Diagnoses/
  // Therapy/Allergies — chamado pelo PrescriptionsService.
  async incrementUsage(idCurrentMedications: number, client: DrizzleDb = this.db) {
    await client
      .update(medications)
      .set({ qtt: sql`${medications.qtt} + 1` })
      .where(eq(medications.idCurrentMedications, idCurrentMedications));
  }

  async decrementUsage(idCurrentMedications: number, client: DrizzleDb = this.db) {
    await client
      .update(medications)
      .set({ qtt: sql`GREATEST(${medications.qtt} - 1, 0)` })
      .where(eq(medications.idCurrentMedications, idCurrentMedications));
  }
}
