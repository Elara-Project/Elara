import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { appointments, calendar, children, clinicalData, notify } from '../db/schema';
import { ChildrenService } from '../children/children.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly childrenService: ChildrenService,
  ) {}

  // Appointment exige ClinicalData (FK NOT NULL no schema) — então uma
  // criança PRECISA ter prontuário clínico criado antes de agendar
  // qualquer consulta. Isso é uma regra de negócio real, não só técnica:
  // o front deveria bloquear "agendar consulta" até o prontuário existir,
  // e essa checagem aqui é a garantia de que isso não é ignorado.
  async createForChild(userIdUser: number, idChildren: number, dto: CreateAppointmentDto) {
    const child = await this.childrenService.findOne(userIdUser, idChildren);

    if (!child.clinicalDataIdClinicalData) {
      throw new BadRequestException(
        'Essa criança precisa ter um prontuário clínico antes de agendar consultas',
      );
    }

    // Transação: Appointment + Calendar nascem juntos (Leitura A). Se o
    // insert do Calendar falhar por algum motivo, o Appointment também não
    // deve ficar gravado sozinho — sem transação isso criaria um Appointment
    // "órfão" sem entrada de agenda correspondente.
    const idAppointments = await this.db.transaction(async (tx) => {
      const apptResult = await tx.insert(appointments).values({
        appointmentDateTime: new Date(dto.appointmentDateTime),
        status: 'agendado',
        reason: dto.reason,
        local: dto.local,
        notes: dto.notes,
        clinicalDataIdClinicalData: child.clinicalDataIdClinicalData!,
      });

      const newIdAppointments = apptResult[0].insertId;

      await tx.insert(calendar).values({
        appointmentsIdAppointments: newIdAppointments,
        date: new Date(dto.appointmentDateTime),
        status: 'agendado',
        descript: dto.reason,
      });

      return newIdAppointments;
    });

    return this.findOneOwned(userIdUser, idAppointments);
  }

  async findAllForChild(userIdUser: number, idChildren: number) {
    const child = await this.childrenService.findOne(userIdUser, idChildren);
    if (!child.clinicalDataIdClinicalData) {
      return [];
    }
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.clinicalDataIdClinicalData, child.clinicalDataIdClinicalData));
  }

  // Ownership por JOIN em vez de "subir a cadeia" chamando outros services
  // em sequência (como fizemos em ClinicalDataService). Com 3 saltos
  // (Appointment -> ClinicalData -> Children -> User), um JOIN é uma query
  // só; encadear services aqui significaria 2-3 queries sequenciais pra
  // chegar no mesmo resultado. Vale a pena mudar de padrão quando a cadeia
  // cresce assim.
  async findOneOwned(userIdUser: number, idAppointments: number) {
    const [found] = await this.db
      .select({ appointment: appointments })
      .from(appointments)
      .innerJoin(clinicalData, eq(appointments.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .innerJoin(children, eq(children.clinicalDataIdClinicalData, clinicalData.idClinicalData))
      .where(and(eq(appointments.idAppointments, idAppointments), eq(children.userIdUser, userIdUser)));

    if (!found) {
      throw new NotFoundException(`Appointment ${idAppointments} não encontrado`);
    }
    return found.appointment;
  }

  async update(userIdUser: number, idAppointments: number, dto: UpdateAppointmentDto) {
    await this.findOneOwned(userIdUser, idAppointments); // valida ownership

    await this.db.transaction(async (tx) => {
      const updateData: Record<string, unknown> = { ...dto };
      if (dto.appointmentDateTime) {
        updateData.appointmentDateTime = new Date(dto.appointmentDateTime);
      }

      await tx.update(appointments).set(updateData).where(eq(appointments.idAppointments, idAppointments));

      // Mantém o Calendar sincronizado — só faz sentido se data ou status
      // mudaram. Atualiza in-place (não cria linha nova); ver nota de
      // design no calendar.service.ts sobre por que 1 Appointment = 1
      // Calendar na prática, mesmo o schema permitindo N.
      if (dto.appointmentDateTime || dto.status) {
        const calendarUpdate: Record<string, unknown> = {};
        if (dto.appointmentDateTime) calendarUpdate.date = new Date(dto.appointmentDateTime);
        if (dto.status) calendarUpdate.status = dto.status;

        await tx
          .update(calendar)
          .set(calendarUpdate)
          .where(eq(calendar.appointmentsIdAppointments, idAppointments));
      }
    });

    return this.findOneOwned(userIdUser, idAppointments);
  }

  async remove(userIdUser: number, idAppointments: number) {
    await this.findOneOwned(userIdUser, idAppointments);

    await this.db.transaction(async (tx) => {
      const calendarRows = await tx
        .select({ idCalendar: calendar.idCalendar })
        .from(calendar)
        .where(eq(calendar.appointmentsIdAppointments, idAppointments));

      const calendarIds = calendarRows.map((c) => c.idCalendar);

      // Ordem importa por causa das FKs: Notify -> Calendar -> Appointment.
      // Tentar deletar Appointment primeiro estouraria FK constraint
      // enquanto Calendar/Notify ainda existirem apontando pra ele.
      if (calendarIds.length > 0) {
        await tx.delete(notify).where(inArray(notify.calendarIdCalendar, calendarIds));
        await tx.delete(calendar).where(inArray(calendar.idCalendar, calendarIds));
      }
      await tx.delete(appointments).where(eq(appointments.idAppointments, idAppointments));
    });

    return { deleted: true };
  }
}
