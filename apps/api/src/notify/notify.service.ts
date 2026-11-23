import { Inject, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { and, eq, lte } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { appointments, calendar, children, clinicalData, notify, user, userConfig } from '../db/schema';
import { CalendarService } from '../calendar/calendar.service';
import { CreateNotifyDto } from './dto/create-notify.dto';

@Injectable()
export class NotifyService implements OnModuleInit, OnModuleDestroy {
  private timer: ReturnType<typeof setInterval> | undefined;
  private processing = false;
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly calendarService: CalendarService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sendDueNotifications(), 60_000);
    void this.sendDueNotifications();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async sendDueNotifications() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from || this.processing) return;
    this.processing = true;
    try {
      const due = await this.db.select({
        idNotify: notify.idNotify,
        descript: notify.descript,
        notifyDate: notify.notifyDate,
        email: user.email,
        enabled: userConfig.notify,
      })
        .from(notify)
        .innerJoin(calendar, eq(notify.calendarIdCalendar, calendar.idCalendar))
        .innerJoin(appointments, eq(calendar.appointmentsIdAppointments, appointments.idAppointments))
        .innerJoin(clinicalData, eq(appointments.clinicalDataIdClinicalData, clinicalData.idClinicalData))
        .innerJoin(children, eq(children.clinicalDataIdClinicalData, clinicalData.idClinicalData))
        .innerJoin(user, eq(children.userIdUser, user.idUser))
        .innerJoin(userConfig, eq(userConfig.userIdUser, user.idUser))
        .where(and(eq(notify.sent, 0), lte(notify.notifyDate, new Date())));

      for (const reminder of due) {
        if (reminder.enabled !== 1) continue;
        const sent = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to: [reminder.email],
            subject: `Lembrete ELARA: ${reminder.descript}`,
            text: `${reminder.descript}\n\nLembrete programado para ${reminder.notifyDate.toLocaleString('pt-BR')}.`,
          }),
        });
        if (!sent.ok) {
          console.error(`Falha no envio do lembrete ${reminder.idNotify}: HTTP ${sent.status}`);
          continue;
        }
        await this.db.update(notify).set({ sent: 1 }).where(eq(notify.idNotify, reminder.idNotify));
      }
    } catch (error) {
      console.error('Falha ao processar lembretes pendentes:', error);
    } finally {
      this.processing = false;
    }
  }

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

// Lembretes vencidos são enviados por e-mail via Resend quando as variáveis
// RESEND_API_KEY e RESEND_FROM_EMAIL estão configuradas.
