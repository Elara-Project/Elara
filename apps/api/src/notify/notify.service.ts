import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { notify } from '../db/schema';
import { CalendarService } from '../calendar/calendar.service';
import { CreateNotifyDto } from './dto/create-notify.dto';

@Injectable()
export class NotifyService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly calendarService: CalendarService,
  ) {}

  // Reaproveita o ownership check do CalendarService em vez de duplicar o
  // JOIN de 4 tabelas aqui — Notify é o 5º elo da cadeia
  // (Notify -> Calendar -> Appointment -> ClinicalData -> Children -> User),
  // e nesse ponto encadear services já é mais legível que um JOIN gigante.
  async create(userIdUser: number, dto: CreateNotifyDto) {
    await this.calendarService.findOneOwned(userIdUser, dto.calendarIdCalendar);

    const result = await this.db.insert(notify).values({
      calendarIdCalendar: dto.calendarIdCalendar,
      notifyDate: new Date(dto.notifyDate),
      sent: 0,
      descript: dto.descript,
    });

    return this.findOne(result[0].insertId);
  }

  async findOne(idNotify: number) {
    const [found] = await this.db.select().from(notify).where(eq(notify.idNotify, idNotify));
    if (!found) {
      throw new NotFoundException(`Notify ${idNotify} não encontrado`);
    }
    return found;
  }

  async findAllForCalendar(userIdUser: number, idCalendar: number) {
    await this.calendarService.findOneOwned(userIdUser, idCalendar); // ownership
    return this.db.select().from(notify).where(eq(notify.calendarIdCalendar, idCalendar));
  }

  async remove(userIdUser: number, idNotify: number) {
    const found = await this.findOne(idNotify);
    await this.calendarService.findOneOwned(userIdUser, found.calendarIdCalendar); // ownership
    await this.db.delete(notify).where(eq(notify.idNotify, idNotify));
    return { deleted: true };
  }
}

// TODO (pendência de arquitetura, não de código): alguma coisa precisa
// rodar periodicamente, achar Notify com notifyDate <= agora e sent = 0,
// disparar o envio de verdade (push notification, e-mail, SMS — a decidir)
// e marcar sent = 1. Isso é candidato a um cron job com @nestjs/schedule
// (@Cron('*/5 * * * *')) ou uma fila (BullMQ) se o volume justificar.
// Não implementei agora porque depende de você decidir o CANAL de envio
// primeiro (push? e-mail?) — arquitetura de fila fica igual nos dois casos,
// mas a integração muda bastante.
