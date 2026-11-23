import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { careItems } from '../db/schema';
import { ChildrenService } from '../children/children.service';
import { CareItemDto } from './dto/care-item.dto';

@Injectable()
export class CareService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb, private readonly children: ChildrenService) {}

  async findAll(userIdUser: number, childId: number) {
    await this.children.findOne(userIdUser, childId);
    return this.db.select().from(careItems).where(eq(careItems.childrenIdChildren, childId));
  }

  async create(userIdUser: number, childId: number, dto: CareItemDto) {
    await this.children.findOne(userIdUser, childId);
    const result = await this.db.insert(careItems).values({
      childrenIdChildren: childId,
      ...dto,
      createdAt: new Date(),
    });
    return this.findOne(userIdUser, childId, result[0].insertId);
  }

  async update(userIdUser: number, childId: number, id: number, dto: Partial<CareItemDto>) {
    await this.findOne(userIdUser, childId, id);
    await this.db.update(careItems).set(dto).where(and(eq(careItems.idCareItem, id), eq(careItems.childrenIdChildren, childId)));
    return this.findOne(userIdUser, childId, id);
  }

  async remove(userIdUser: number, childId: number, id: number) {
    await this.findOne(userIdUser, childId, id);
    await this.db.delete(careItems).where(and(eq(careItems.idCareItem, id), eq(careItems.childrenIdChildren, childId)));
    return { deleted: true };
  }

  private async findOne(userIdUser: number, childId: number, id: number) {
    await this.children.findOne(userIdUser, childId);
    const [found] = await this.db.select().from(careItems).where(and(eq(careItems.idCareItem, id), eq(careItems.childrenIdChildren, childId)));
    if (!found) throw new NotFoundException('Item de cuidado não encontrado');
    return found;
  }
}
