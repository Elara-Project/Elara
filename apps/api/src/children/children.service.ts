import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { children } from '../db/schema';
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
    const idChildren = await this.db.transaction(async (tx) => {
      const result = await tx.insert(children).values({
        name: dto.name,
        dob: new Date(dto.dob),
        dateCreate: new Date(),
        relationshipIdRelationship: dto.relationshipIdRelationship,
        diagnosesIdDiagnoses: dto.diagnosesIdDiagnoses,
        clinicalDataIdClinicalData: dto.clinicalDataIdClinicalData,
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
      if (dto.diagnosesIdDiagnoses) {
        await this.diagnosesService.incrementUsage(dto.diagnosesIdDiagnoses, tx);
      }

      return result[0].insertId;
    });

    return this.findOne(userIdUser, idChildren);
  }

  // Lista só os filhos DO USUÁRIO LOGADO — nunca todos os filhos do banco
  findAllForUser(userIdUser: number) {
    return this.db.select().from(children).where(eq(children.userIdUser, userIdUser));
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
    return found;
  }

  async update(userIdUser: number, idChildren: number, dto: UpdateChildDto) {
    const current = await this.findOne(userIdUser, idChildren); // valida existência + ownership

    await this.db.transaction(async (tx) => {
      const updateData: Record<string, unknown> = { ...dto };
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
      if (dto.diagnosesIdDiagnoses && dto.diagnosesIdDiagnoses !== current.diagnosesIdDiagnoses) {
        if (current.diagnosesIdDiagnoses) {
          await this.diagnosesService.decrementUsage(current.diagnosesIdDiagnoses, tx);
        }
        await this.diagnosesService.incrementUsage(dto.diagnosesIdDiagnoses, tx);
      }
    });

    return this.findOne(userIdUser, idChildren);
  }

  async remove(userIdUser: number, idChildren: number) {
    const current = await this.findOne(userIdUser, idChildren);

    await this.db.transaction(async (tx) => {
      await tx
        .delete(children)
        .where(and(eq(children.idChildren, idChildren), eq(children.userIdUser, userIdUser)));

      await this.relationshipService.decrementUsage(current.relationshipIdRelationship, tx);
      if (current.diagnosesIdDiagnoses) {
        await this.diagnosesService.decrementUsage(current.diagnosesIdDiagnoses, tx);
      }
    });

    return { deleted: true };
  }
}
