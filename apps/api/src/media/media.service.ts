import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { media } from '../db/schema';
import { ChildrenService } from '../children/children.service';
import { LibraryService } from '../library/library.service';
import { CreateMediaDto } from './dto/create-media.dto';

// Pasta fica fora de src/ (não vai pro build de produção por engano) e é
// criada no boot se não existir — não commitada no git (ver .gitignore).
// UPLOAD_DIR é opcional no .env; sem ela, cai no fallback baseado em
// process.cwd() (ver uploads-dir.txt pra entender por que isso é
// configurável em vez de fixo).
export const MEDIA_UPLOAD_DIR = process.env.UPLOAD_DIR
  ? join(process.env.UPLOAD_DIR, 'media')
  : join(process.cwd(), 'uploads', 'media');

@Injectable()
export class MediaService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly childrenService: ChildrenService,
    private readonly libraryService: LibraryService,
  ) {
    if (!existsSync(MEDIA_UPLOAD_DIR)) {
      mkdirSync(MEDIA_UPLOAD_DIR, { recursive: true });
    }
  }

  async create(
    userIdUser: number,
    idChildren: number,
    dto: CreateMediaDto,
    storedFileName: string,
  ) {
    await this.childrenService.findOne(userIdUser, idChildren); // valida ownership
    await this.libraryService.findOne(dto.libraryIdlibrary); // 404 limpo se categoria não existir

    const result = await this.db.insert(media).values({
      userIdUser,
      libraryIdlibrary: dto.libraryIdlibrary,
      childrenIdChildren: idChildren,
      title: dto.title,
      descript: dto.descript,
      imageUrl: storedFileName, // só o nome no disco — NUNCA uma URL pública direta
      date: new Date(),
      status: 1,
    });

    return this.findOneOwned(userIdUser, result[0].insertId);
  }

  async findAllForChild(userIdUser: number, idChildren: number) {
    await this.childrenService.findOne(userIdUser, idChildren);
    return this.db.select().from(media).where(eq(media.childrenIdChildren, idChildren));
  }

  // Checagem direta em media.userIdUser, sem JOIN até Children: como só o
  // dono da criança consegue criar Media pra ela (create() garante isso
  // acima), media.userIdUser É a mesma pessoa que children.userIdUser —
  // checar aqui é equivalente a checar via Children, só que em 1 tabela.
  async findOneOwned(userIdUser: number, idmedia: number) {
    const [found] = await this.db
      .select()
      .from(media)
      .where(and(eq(media.idmedia, idmedia), eq(media.userIdUser, userIdUser)));
    if (!found) {
      throw new NotFoundException(`Media ${idmedia} não encontrada`);
    }
    return found;
  }

  // Caminho absoluto no disco pro controller fazer o stream do arquivo —
  // só depois de já ter validado ownership via findOneOwned.
  getAbsolutePath(storedFileName: string) {
    return join(MEDIA_UPLOAD_DIR, storedFileName);
  }

  async remove(userIdUser: number, idmedia: number) {
    const found = await this.findOneOwned(userIdUser, idmedia);

    const filePath = this.getAbsolutePath(found.imageUrl);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.db.delete(media).where(eq(media.idmedia, idmedia));
    return { deleted: true };
  }
}
