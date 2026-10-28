import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { children, forum } from '../db/schema';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

@Injectable()
export class ForumService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // Regra de acesso central do módulo inteiro: usuário só enxerga/participa
  // do fórum de um diagnóstico se tiver PELO MENOS UM filho com aquele
  // diagnóstico. CommentsService e LikesService chamam isso também (por
  // isso fica público, não private) em vez de duplicar a query.
  async hasAccessToDiagnosis(userIdUser: number, diagnosesIdDiagnoses: number): Promise<boolean> {
    const [row] = await this.db
      .select({ idChildren: children.idChildren })
      .from(children)
      .where(
        and(eq(children.userIdUser, userIdUser), eq(children.diagnosesIdDiagnoses, diagnosesIdDiagnoses)),
      );
    return !!row;
  }

  // ---------- Admin/moderador (gestão do catálogo de sub-fóruns) ----------

  async create(dto: CreateForumDto) {
    const result = await this.db.insert(forum).values({ ...dto, createDate: new Date() });
    return this.findRaw(result[0].insertId);
  }

  async update(idForum: number, dto: UpdateForumDto) {
    await this.findRaw(idForum);
    await this.db.update(forum).set(dto).where(eq(forum.idForum, idForum));
    return this.findRaw(idForum);
  }

  async remove(idForum: number) {
    await this.findRaw(idForum);
    await this.db.delete(forum).where(eq(forum.idForum, idForum));
    return { deleted: true };
  }

  // Leitura sem checagem de acesso — uso interno (admin, ou outro service
  // que já validou o acesso e só precisa dos dados do fórum).
  async findRaw(idForum: number) {
    const [found] = await this.db.select().from(forum).where(eq(forum.idForum, idForum));
    if (!found) {
      throw new NotFoundException(`Forum ${idForum} não encontrado`);
    }
    return found;
  }

  // ---------- Usuário comum (leitura com controle de acesso) ----------

  async findAllForDiagnosis(userIdUser: number, diagnosesIdDiagnoses: number) {
    const hasAccess = await this.hasAccessToDiagnosis(userIdUser, diagnosesIdDiagnoses);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem acesso ao fórum desse diagnóstico');
    }
    return this.db.select().from(forum).where(eq(forum.diagnosesIdDiagnoses, diagnosesIdDiagnoses));
  }

  async findOneForUser(userIdUser: number, idForum: number) {
    const found = await this.findRaw(idForum);
    const hasAccess = await this.hasAccessToDiagnosis(userIdUser, found.diagnosesIdDiagnoses);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem acesso a esse fórum');
    }
    return found;
  }
}
