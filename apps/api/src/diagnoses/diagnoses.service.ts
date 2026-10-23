import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { diagnoses } from '../db/schema';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class DiagnosesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateDiagnosisDto) {
    const result = await this.db.insert(diagnoses).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(diagnoses);
  }

  async findOne(idDiagnoses: number) {
    const [found] = await this.db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.idDiagnoses, idDiagnoses));
    if (!found) {
      throw new NotFoundException(`Diagnosis ${idDiagnoses} não encontrado`);
    }
    return found;
  }

  async update(idDiagnoses: number, dto: UpdateDiagnosisDto) {
    await this.findOne(idDiagnoses);
    await this.db.update(diagnoses).set(dto).where(eq(diagnoses.idDiagnoses, idDiagnoses));
    return this.findOne(idDiagnoses);
  }

  async remove(idDiagnoses: number) {
    await this.findOne(idDiagnoses);
    await this.db.delete(diagnoses).where(eq(diagnoses.idDiagnoses, idDiagnoses));
    return { deleted: true };
  }

  // Contador de uso — chamado pelo service "dono" da relação (ex:
  // ChildrenService, ClinicalDataService) sempre que algo passa a
  // referenciar ou deixa de referenciar essa linha. client opcional
  // permite rodar DENTRO da mesma transação do insert/update que
  // disparou a mudança, mantendo tudo atômico.
  async incrementUsage(idDiagnoses: number, client: DrizzleDb = this.db) {
    await client
      .update(diagnoses)
      .set({ qtt: sql`${diagnoses.qtt} + 1` })
      .where(eq(diagnoses.idDiagnoses, idDiagnoses));
  }

  async decrementUsage(idDiagnoses: number, client: DrizzleDb = this.db) {
    // GREATEST(...,0) evita qtt ficar negativo em qualquer cenário de corrida
    await client
      .update(diagnoses)
      .set({ qtt: sql`GREATEST(${diagnoses.qtt} - 1, 0)` })
      .where(eq(diagnoses.idDiagnoses, idDiagnoses));
  }
}
