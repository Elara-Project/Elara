import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { relationship } from '../db/schema';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';

// Tabela de referência compartilhada (não pertence a nenhum usuário
// específico) — por isso não há checagem de ownership aqui, diferente
// de ChildrenService.
@Injectable()
export class RelationshipService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateRelationshipDto) {
    const result = await this.db.insert(relationship).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(relationship);
  }

  async findOne(idRelationship: number) {
    const [found] = await this.db
      .select()
      .from(relationship)
      .where(eq(relationship.idRelationship, idRelationship));
    if (!found) {
      throw new NotFoundException(`Relationship ${idRelationship} não encontrado`);
    }
    return found;
  }

  async update(idRelationship: number, dto: UpdateRelationshipDto) {
    await this.findOne(idRelationship);
    await this.db.update(relationship).set(dto).where(eq(relationship.idRelationship, idRelationship));
    return this.findOne(idRelationship);
  }

  async remove(idRelationship: number) {
    await this.findOne(idRelationship);
    await this.db.delete(relationship).where(eq(relationship.idRelationship, idRelationship));
    return { deleted: true };
  }

  // Contador de uso — chamado pelo service "dono" da relação (ex:
  // ChildrenService, ClinicalDataService) sempre que algo passa a
  // referenciar ou deixa de referenciar essa linha. client opcional
  // permite rodar DENTRO da mesma transação do insert/update que
  // disparou a mudança, mantendo tudo atômico.
  async incrementUsage(idRelationship: number, client: DrizzleDb = this.db) {
    await client
      .update(relationship)
      .set({ qtt: sql`${relationship.qtt} + 1` })
      .where(eq(relationship.idRelationship, idRelationship));
  }

  async decrementUsage(idRelationship: number, client: DrizzleDb = this.db) {
    // GREATEST(...,0) evita qtt ficar negativo em qualquer cenário de corrida
    await client
      .update(relationship)
      .set({ qtt: sql`GREATEST(${relationship.qtt} - 1, 0)` })
      .where(eq(relationship.idRelationship, idRelationship));
  }
}
