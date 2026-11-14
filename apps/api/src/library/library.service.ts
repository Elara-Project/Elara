import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { isForeignKeyViolation } from '../common/db-errors';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { library } from '../db/schema';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';

@Injectable()
export class LibraryService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateLibraryDto) {
    const result = await this.db.insert(library).values(dto);
    return this.findOne(result[0].insertId);
  }

  findAll() {
    return this.db.select().from(library);
  }

  async findOne(idlibrary: number) {
    const [found] = await this.db.select().from(library).where(eq(library.idlibrary, idlibrary));
    if (!found) {
      throw new NotFoundException(`Library ${idlibrary} não encontrada`);
    }
    return found;
  }

  async update(idlibrary: number, dto: UpdateLibraryDto) {
    await this.findOne(idlibrary);
    await this.db.update(library).set(dto).where(eq(library.idlibrary, idlibrary));
    return this.findOne(idlibrary);
  }

  async remove(idlibrary: number) {
    await this.findOne(idlibrary);
    try {
      await this.db.delete(library).where(eq(library.idlibrary, idlibrary));
    } catch (error) {
      // Item ainda referenciado por outra tabela: erro do cliente (409), não 500.
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível excluir: categoria de documento em uso.');
      }
      throw error;
    }
    return { deleted: true };
  }
}
