import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { appointments, calendar, children, clinicalData } from '../db/schema';

// Só leitura de propósito: Calendar nasce e é atualizado só através do
// AppointmentsService (ver createForChild/update lá). Não existe endpoint
// pra criar/editar Calendar direto — se um dia precisar de "reagendamentos
// como histórico" (múltiplas linhas de Calendar por Appointment, que o
// schema permite mas não usamos hoje), é aqui que a mudança de regra entra.
@Injectable()
export class CalendarService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findAllForUser(userIdUser: number) {
    return this.db
      .select({ calendar })
      .from(calendar)
      .innerJoin(appointments, eq(calendar.appointmentsIdAppointments, appointments.idAppointments))
      .innerJoin(clinicalData, eq(appointments.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .innerJoin(children, eq(children.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .where(eq(children.userIdUser, userIdUser))
      .then((rows) => rows.map((r) => r.calendar));
  }

  async findOneOwned(userIdUser: number, idCalendar: number) {
    const [found] = await this.db
      .select({ calendar })
      .from(calendar)
      .innerJoin(appointments, eq(calendar.appointmentsIdAppointments, appointments.idAppointments))
      .innerJoin(clinicalData, eq(appointments.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .innerJoin(children, eq(children.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .where(and(eq(calendar.idCalendar, idCalendar), eq(children.userIdUser, userIdUser)));

    if (!found) {
      throw new NotFoundException(`Calendar ${idCalendar} não encontrado`);
    }
    return found.calendar;
  }
}
