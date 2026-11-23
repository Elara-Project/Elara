import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { childDiagnoses, children } from '../db/schema';
import { RelationshipService } from '../relationship/relationship.service';
import { DiagnosesService } from '../diagnoses/diagnoses.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly relationshipService: RelationshipService,
    private readonly diagnosesService: DiagnosesService,
  ) {}

  async create(userIdUser: number, dto: CreateChildDto) {
    const diagnosisIds = [...new Set(dto.diagnosesIds ?? (dto.diagnosesIdDiagnoses ? [dto.diagnosesIdDiagnoses] : []))];
    const idChildren = await this.db.transaction(async (tx) => {
      const result = await tx.insert(children).values({
        name: dto.name,
        dob: new Date(dto.dob),
        dateCreate: new Date(),
        relationshipIdRelationship: dto.relationshipIdRelationship,
        diagnosesIdDiagnoses: diagnosisIds[0] ?? null,
        clinicalDataIdClinicalData: dto.clinicalDataIdClinicalData,
        school: dto.school,
        cid: dto.cid,
        userIdUser, // vem do token, nunca do body — impede criar filho pra outro user
      });

      // qtt é contador de uso — toda Children nova incrementa o
      // Relationship que ela usa, e o Diagnoses também, se informado.
      // Passar "tx" faz isso rodar na MESMA transação do insert acima:
      // se qualquer coisa falhar depois, os incrementos são desfeitos
      // junto (sem isso, um insert de Children que falhasse no meio
      // deixaria um Relationship.qtt incrementado "no ar", sem Children
      // correspondente).
      await this.relationshipService.incrementUsage(dto.relationshipIdRelationship, tx);
      if (diagnosisIds.length) {
        await tx.insert(childDiagnoses).values(diagnosisIds.map((diagnosesIdDiagnoses) => ({ childrenIdChildren: result[0].insertId, diagnosesIdDiagnoses })));
        for (const id of diagnosisIds) await this.diagnosesService.incrementUsage(id, tx);
      }

      return result[0].insertId;
    });

    return this.findOne(userIdUser, idChildren);
  }

  // Lista só os filhos DO USUÁRIO LOGADO — nunca todos os filhos do banco
  async findAllForUser(userIdUser: number) {
    const rows = await this.db.select().from(children).where(eq(children.userIdUser, userIdUser));
    return Promise.all(rows.map((row) => this.withDiagnoses(row)));
  }

  async findOne(userIdUser: number, idChildren: number) {
    const [found] = await this.db
      .select()
      .from(children)
      .where(and(eq(children.idChildren, idChildren), eq(children.userIdUser, userIdUser)));

    // 404 (não 403) de propósito: não confirma pra quem tenta acessar
    // filho de outra pessoa se aquele ID existe ou não.
    if (!found) {
      throw new NotFoundException(`Criança ${idChildren} não encontrada`);
    }
    return this.withDiagnoses(found);
  }

  private async withDiagnoses<T extends { idChildren: number; diagnosesIdDiagnoses: number | null }>(row: T) {
    const links = await this.db.select().from(childDiagnoses).where(eq(childDiagnoses.childrenIdChildren, row.idChildren));
    return { ...row, diagnosesIds: links.length ? links.map((link) => link.diagnosesIdDiagnoses) : (row.diagnosesIdDiagnoses ? [row.diagnosesIdDiagnoses] : []) };
  }

  async update(userIdUser: number, idChildren: number, dto: UpdateChildDto) {
    const current = await this.findOne(userIdUser, idChildren); // valida existência + ownership
    const diagnosisIds = dto.diagnosesIds === undefined
      ? (dto.diagnosesIdDiagnoses !== undefined ? (dto.diagnosesIdDiagnoses ? [dto.diagnosesIdDiagnoses] : []) : undefined)
      : [...new Set(dto.diagnosesIds)];

    await this.db.transaction(async (tx) => {
      const updateData: Record<string, unknown> = { ...dto };
      delete updateData.diagnosesIds;
      if (diagnosisIds !== undefined) updateData.diagnosesIdDiagnoses = diagnosisIds[0] ?? null;
      if (dto.dob) {
        updateData.dob = new Date(dto.dob);
      }

      await tx
        .update(children)
        .set(updateData)
        .where(and(eq(children.idChildren, idChildren), eq(children.userIdUser, userIdUser)));

      // Troca de Relationship: decrementa o antigo, incrementa o novo.
      if (dto.relationshipIdRelationship && dto.relationshipIdRelationship !== current.relationshipIdRelationship) {
        await this.relationshipService.decrementUsage(current.relationshipIdRelationship, tx);
        await this.relationshipService.incrementUsage(dto.relationshipIdRelationship, tx);
      }

      // Diagnoses é opcional (pode ser null antes), por isso a lógica tem
      // mais casos: null->X (só incrementa), X->Y (decrementa+incrementa),
      // X->null não é possível pelo DTO hoje (não aceita null explícito).
      if (diagnosisIds !== undefined) {
        const oldIds = current.diagnosesIds ?? [];
        const oldSet = new Set(oldIds);
        const newSet = new Set(diagnosisIds);
        await tx.delete(childDiagnoses).where(eq(childDiagnoses.childrenIdChildren, idChildren));
        if (diagnosisIds.length) {
          await tx.insert(childDiagnoses).values(diagnosisIds.map((diagnosesIdDiagnoses) => ({ childrenIdChildren: idChildren, diagnosesIdDiagnoses })));
        }
        for (const id of oldSet) if (!newSet.has(id)) await this.diagnosesService.decrementUsage(id, tx);
        for (const id of newSet) if (!oldSet.has(id)) await this.diagnosesService.incrementUsage(id, tx);
      }
    });

    return this.findOne(userIdUser, idChildren);
  }

  async remove(userIdUser: number, idChildren: number) {
    const current = await this.findOne(userIdUser, idChildren);

    await this.db.transaction(async (tx) => {
      await tx.delete(childDiagnoses).where(eq(childDiagnoses.childrenIdChildren, idChildren));
      await tx
        .delete(children)
        .where(and(eq(children.idChildren, idChildren), eq(children.userIdUser, userIdUser)));

      await this.relationshipService.decrementUsage(current.relationshipIdRelationship, tx);
      for (const id of current.diagnosesIds ?? []) await this.diagnosesService.decrementUsage(id, tx);
    });

    return { deleted: true };
  }
}
