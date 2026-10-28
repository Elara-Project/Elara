import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { comments, forum, likes } from '../db/schema';
import { ForumService } from '../forum/forum.service';

@Injectable()
export class LikesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly forumService: ForumService,
  ) {}

  // Curtir exige o mesmo acesso de diagnóstico que comentar — por isso o
  // caminho de validação é Comment -> Forum -> diagnóstico, igual usamos
  // em CommentsService.create.
  private async assertAccess(userIdUser: number, idComments: number) {
    const [row] = await this.db
      .select({ diagnosesIdDiagnoses: forum.diagnosesIdDiagnoses })
      .from(comments)
      .innerJoin(forum, eq(comments.forumIdForum, forum.idForum))
      .where(eq(comments.idComments, idComments));

    if (!row) {
      throw new NotFoundException(`Comment ${idComments} não encontrado`);
    }

    const hasAccess = await this.forumService.hasAccessToDiagnosis(userIdUser, row.diagnosesIdDiagnoses);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem acesso a esse fórum');
    }
  }

  async like(userIdUser: number, idComments: number) {
    await this.assertAccess(userIdUser, idComments);

    const [existing] = await this.db
      .select({ idLikes: likes.idLikes })
      .from(likes)
      .where(and(eq(likes.commentsIdComments, idComments), eq(likes.userIdUser, userIdUser)));

    if (existing) {
      throw new ConflictException('Você já curtiu esse comentário');
    }

    await this.db.insert(likes).values({
      commentsIdComments: idComments,
      userIdUser,
      date: new Date(),
    });

    return { liked: true };
  }

  async unlike(userIdUser: number, idComments: number) {
    await this.assertAccess(userIdUser, idComments);

    const result = await this.db
      .delete(likes)
      .where(and(eq(likes.commentsIdComments, idComments), eq(likes.userIdUser, userIdUser)));

    if (result[0].affectedRows === 0) {
      throw new NotFoundException('Você não tinha curtido esse comentário');
    }

    return { liked: false };
  }

  async countForComment(userIdUser: number, idComments: number) {
    await this.assertAccess(userIdUser, idComments);
    const rows = await this.db
      .select({ idLikes: likes.idLikes })
      .from(likes)
      .where(eq(likes.commentsIdComments, idComments));
    return { count: rows.length };
  }
}
