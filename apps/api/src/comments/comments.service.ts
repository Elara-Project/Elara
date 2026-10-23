import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { comments, likes } from '../db/schema';
import { ForumService } from '../forum/forum.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// Janela de edição do autor comum — 3 horas, conforme confirmado. Isolada
// numa constante pra não ficar um "3" mágico espalhado pelo service.
const USER_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly forumService: ForumService,
  ) {}

  async create(userIdUser: number, idForum: number, dto: CreateCommentDto) {
    // findOneForUser já valida que o usuário tem acesso ao diagnóstico
    // desse fórum (lança 403 se não tiver) — reaproveitado, não duplicado.
    await this.forumService.findOneForUser(userIdUser, idForum);

    const result = await this.db.insert(comments).values({
      content: dto.content,
      status: 'visivel',
      createAt: new Date(),
      updateAt: new Date(),
      forumIdForum: idForum,
      userIdUser,
    });

    return this.findOne(result[0].insertId);
  }

  async findAllForForum(userIdUser: number, idForum: number) {
    await this.forumService.findOneForUser(userIdUser, idForum);
    return this.db.select().from(comments).where(eq(comments.forumIdForum, idForum));
  }

  async findOne(idComments: number) {
    const [found] = await this.db.select().from(comments).where(eq(comments.idComments, idComments));
    if (!found) {
      throw new NotFoundException(`Comment ${idComments} não encontrado`);
    }
    return found;
  }

  // role vem do JWT (req.user.role) — decide qual dos dois caminhos seguir:
  // edição de admin (com marca d'água, sem limite de tempo) ou edição do
  // autor (sem marca d'água, com janela de 3h).
  async update(userIdUser: number, role: string, idComments: number, dto: UpdateCommentDto) {
    const comment = await this.findOne(idComments);

    if (role === 'admin') {
      await this.db
        .update(comments)
        .set({
          content: dto.content,
          previousContent: comment.content, // só guarda a edição anterior, não histórico completo
          editedByAdminId: userIdUser,
          editedAt: new Date(),
          updateAt: new Date(),
        })
        .where(eq(comments.idComments, idComments));

      return this.findOne(idComments);
    }

    if (comment.userIdUser !== userIdUser) {
      throw new ForbiddenException('Você só pode editar os próprios comentários');
    }

    const elapsedMs = Date.now() - comment.createAt.getTime();
    if (elapsedMs > USER_EDIT_WINDOW_MS) {
      throw new ForbiddenException('Prazo de 3 horas para editar esse comentário já passou');
    }

    await this.db
      .update(comments)
      .set({ content: dto.content, updateAt: new Date() })
      .where(eq(comments.idComments, idComments));

    return this.findOne(idComments);
  }

  // Mesma janela de 3h aplicada à exclusão do autor comum — não foi dito
  // explicitamente que exclusão teria prazo diferente de edição, então
  // apliquei a mesma regra por consistência. Se quiser exclusão sem prazo
  // pro autor, é só tirar essa checagem do bloco "não-admin" abaixo.
  async remove(userIdUser: number, role: string, idComments: number) {
    const comment = await this.findOne(idComments);

    if (role !== 'admin') {
      if (comment.userIdUser !== userIdUser) {
        throw new ForbiddenException('Você só pode excluir os próprios comentários');
      }
      const elapsedMs = Date.now() - comment.createAt.getTime();
      if (elapsedMs > USER_EDIT_WINDOW_MS) {
        throw new ForbiddenException('Prazo de 3 horas para excluir esse comentário já passou');
      }
    }

    // Likes referenciam o comentário via FK — precisam sumir antes.
    await this.db.delete(likes).where(eq(likes.commentsIdComments, idComments));
    await this.db.delete(comments).where(eq(comments.idComments, idComments));

    return { deleted: true };
  }
}
